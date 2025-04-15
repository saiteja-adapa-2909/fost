// server.js
const express = require('express');
const app = express();
const admin = require('firebase-admin');
const cors = require('cors');
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccountConfig = {
  // Use environment variables for your service account
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountConfig)
});

// Configure middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-production-domain.com','http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to create order in Firestore
const createOrder = async (orderData, paymentDetails = null) => {
  const firestore = admin.firestore();
  const orderRef = firestore.collection('orders').doc();

  try {
    await firestore.runTransaction(async (transaction) => {
      // Check for existing order with same transaction ID
      const existingOrdersQuery = await transaction.get(
        firestore.collection('orders')
          .where('txnid', '==', orderData.txnid)
      );

      // Validate conditions
      if (!existingOrdersQuery.empty) {
        throw new Error('Order already exists for this transaction');
      }

      // Create the order
      transaction.set(orderRef, {
        ...orderData,
        status: 'pending',
        paymentStatus: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        shippingAddress: orderData.shippingAddress, // Ensure address is saved
        phoneNumber: orderData.phoneNumber, // Ensure phone number is saved
        ...(paymentDetails && { paymentDetails })
      });
    });

    // Send confirmation email
    await sendOrderConfirmationEmail(orderRef.id, orderData);

    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Helper function to send order confirmation email
const sendOrderConfirmationEmail = async (orderId, orderData) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add address information to email if available
  const addressHtml = orderData.shippingAddress ? `
    <div style="background-color: #F7FAFC; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 18px;">Shipping Address</h2>
      <p style="margin: 5px 0; color: #4A5568;">${orderData.shippingAddress.fullName || orderData.customerName}</p>
      <p style="margin: 5px 0; color: #4A5568;">${orderData.shippingAddress.addressLine1 || ''}</p>
      ${orderData.shippingAddress.addressLine2 ? `<p style="margin: 5px 0; color: #4A5568;">${orderData.shippingAddress.addressLine2}</p>` : ''}
      <p style="margin: 5px 0; color: #4A5568;">${orderData.shippingAddress.area || ''}, ${orderData.shippingAddress.city || 'Hyderabad'}, ${orderData.shippingAddress.state || 'Telangana'}</p>
      <p style="margin: 5px 0; color: #4A5568;">PIN: ${orderData.shippingAddress.pinCode || ''}</p>
      <p style="margin: 5px 0; color: #4A5568;">Phone: ${orderData.phoneNumber || orderData.shippingAddress.phoneNumber || ''}</p>
    </div>
  ` : '';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: orderData.customerEmail,
    subject: `Order Confirmation - Order #${orderId.slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px;">
          <h1 style="color: #2D3748; margin: 0;">Order Confirmation</h1>
          <p style="color: #718096; margin: 10px 0 0;">Thank you for your order!</p>
        </div>

        <div style="background-color: #F7FAFC; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 18px;">Order Summary</h2>
          <p style="margin: 5px 0; color: #4A5568;">Order Number: #${orderId.slice(-6)}</p>
          <p style="margin: 5px 0; color: #4A5568;">Date: ${formatDate()}</p>
        </div>

        ${addressHtml}

        <div style="margin-bottom: 20px;">
          <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 18px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #F7FAFC;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #E2E8F0;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #E2E8F0;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #E2E8F0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map(item => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #E2E8F0;">
                    <div style="font-weight: 500;">${item.product.title}</div>
                  </td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #E2E8F0;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #E2E8F0;">$${(item.product.currentCost * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #F7FAFC;">
                <td colspan="2" style="padding: 12px; font-weight: bold;">Total Amount</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">$${orderData.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="text-align: center; color: #718096; font-size: 14px; border-top: 2px solid #E2E8F0; padding-top: 20px;">
          <p style="margin: 0 0 10px;">Thank you for your purchase!</p>
          <p style="margin: 0;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Route to initiate payment
app.post('/api/initiate-payment', async (req, res) => {
  try {
    const { cartItems, userData, shippingAddress } = req.body;
    
    // Validate required data
    if (!cartItems || !userData || !userData.email) {
      return res.status(400).json({ 
        error: 'Missing required payment data',
        message: 'Cart items and user data are required' 
      });
    }

    const txnid = `TXN_${Date.now()}`;
    const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
    const PAYU_SALT_KEY = process.env.PAYU_SALT_KEY;
    
    // Calculate the total amount
    const subtotal = cartItems.reduce((total, item, index) => {
      const itemPrice = item.product.currentCost;
      const addonTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
      return total + ((itemPrice + addonTotal) * item.quantity);
    }, 0);
    
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;
    
    // Extract phone number from shipping address if available
    const phoneNumber = shippingAddress?.phoneNumber || userData.phoneNumber || '';
    
    // Create transaction data with shipping address and phone number
    const transactionData = {
      userId: userData.uid || 'guest',
      items: cartItems,
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      customerEmail: userData.email,
      customerName: userData.displayName || 'Customer',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      txnid: txnid,
      shippingAddress: shippingAddress || {}, // Store shipping address
      phoneNumber: phoneNumber // Store phone number
    };

    // Save transaction to Firestore
    await admin.firestore()
      .collection('transactions')
      .add(transactionData);

    // Prepare PayU payment parameters
    const paymentParams = {
      key: PAYU_MERCHANT_KEY,
      txnid: txnid,
      amount: total.toFixed(2),
      productinfo: `Order from Your Store`,
      firstname: userData.displayName || shippingAddress?.fullName || 'Customer',
      email: userData.email,
      phone: phoneNumber,
      surl: `${req.protocol}://${req.get('host')}/api/payment-success?transactionId=${txnid}`,
      furl: `${req.protocol}://${req.get('host')}/api/payment-failure?transactionId=${txnid}`,
    };

    // Generate hash
    const hashString = `${paymentParams.key}|${paymentParams.txnid}|${paymentParams.amount}|${paymentParams.productinfo}|${paymentParams.firstname}|${paymentParams.email}|||||||||||${PAYU_SALT_KEY}`;
    const hash = CryptoJS.SHA512(hashString).toString();
    
    res.json({
      ...paymentParams,
      hash: hash,
      payuBaseUrl: process.env.PAYU_BASE_URL || 'https://secure.payu.in/_payment'
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate payment',
      message: error.message
    });
  }
});

// PayU Webhook Handler
app.post('/api/payu-webhook', async (req, res) => {
  try {
    console.log('Received PayU webhook:', JSON.stringify(req.body, null, 2));
    const { txnid, status, amount } = req.body;
    
    if (!txnid || !status) {
      console.error('Missing required webhook parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const firestore = admin.firestore();

    // Check for existing order
    const existingOrderSnapshot = await firestore
      .collection('orders')
      .where('txnid', '==', txnid)
      .get();

    if (!existingOrderSnapshot.empty) {
      console.log('Order already exists for transaction:', txnid);
      return res.status(200).json({ message: 'Order already processed' });
    }

    // Process the webhook
    await firestore.runTransaction(async (transaction) => {
      const transactionQuery = await transaction.get(
        firestore.collection('transactions').where('txnid', '==', txnid)
      );
      
      if (transactionQuery.empty) {
        throw new Error('Transaction not found');
      }

      const transactionDoc = transactionQuery.docs[0];
      const transactionData = transactionDoc.data();
      
      if (status.toLowerCase() === 'success') {
        // Create order
        await createOrder(transactionData, req.body);

        // Update transaction
        await transaction.update(transactionDoc.ref, {
          status: 'completed',
          paymentStatus: 'success',
          webhookProcessed: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // Handle failed payment
        await transaction.update(transactionDoc.ref, {
          status: 'failed',
          paymentStatus: 'failed',
          failureReason: req.body.error_Message || 'Payment failed',
          webhookProcessed: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
});

// Payment Success Route
app.get('/api/payment-success', async (req, res) => {
  try {
    const { transactionId } = req.query;
    console.log('Processing payment success for transaction:', transactionId);
    
    if (!transactionId) {
      console.error('Missing transaction ID in success callback');
      return res.redirect('/payment-failure?error=missing_transaction_id');
    }

    const firestore = admin.firestore();
    
    // Find the transaction
    const transactionSnapshot = await firestore
      .collection('transactions')
      .where('txnid', '==', transactionId)
      .get();

    if (transactionSnapshot.empty) {
      console.error('Transaction not found:', transactionId);
      return res.redirect('/payment-failure?error=transaction_not_found');
    }

    const transactionDoc = transactionSnapshot.docs[0];
    const transactionData = transactionDoc.data();

    // Check if an order already exists for this transaction
    const existingOrderSnapshot = await firestore
      .collection('orders')
      .where('txnid', '==', transactionId)
      .get();
    
    if (!existingOrderSnapshot.empty) {
      console.log('Order already exists for this transaction');
      return res.redirect(`/order-confirmation/${existingOrderSnapshot.docs[0].id}`);
    }
    
    // Create a new order in Firestore
    const orderRef = firestore.collection('orders').doc();
    
    const orderData = {
      userId: transactionData.userId,
      txnid: transactionId,
      items: transactionData.items,
      subtotal: transactionData.subtotal,
      shipping: transactionData.shipping,
      total: transactionData.total,
      customerEmail: transactionData.customerEmail,
      customerName: transactionData.customerName,
      status: 'pending',
      paymentStatus: 'completed',
      shippingAddress: transactionData.shippingAddress || {}, // Ensure shipping address is saved
      phoneNumber: transactionData.phoneNumber || '', // Ensure phone number is saved
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Start a transaction to ensure data consistency
    await firestore.runTransaction(async (transaction) => {
      // IMPORTANT: Perform ALL reads first
      
      // 1. Double-check no order exists (prevent race conditions)
      const doubleCheckSnapshot = await transaction.get(
        firestore.collection('orders')
          .where('txnid', '==', transactionId)
      );
      
      // 2. Get product inventory information for all items
      const productReads = [];
      const productRefs = [];
      
      for (const item of transactionData.items) {
        if (item.product && item.product.id) {
          const productRef = firestore.collection('products').doc(item.product.id);
          productRefs.push(productRef);
          productReads.push(transaction.get(productRef));
        }
      }
      
      // Execute all product reads
      const productDocs = await Promise.all(productReads);
      
      // NOW perform writes after all reads are complete
      
      // Check if order already exists
      if (!doubleCheckSnapshot.empty) {
        console.log('Order already created in parallel process');
        return;
      }
      
      // Create the order
      transaction.set(orderRef, orderData);
      
      // Update the transaction
      transaction.update(transactionDoc.ref, {
        status: 'completed',
        paymentStatus: 'success',
        orderId: orderRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update inventory for each product
      productDocs.forEach((productDoc, index) => {
        if (productDoc.exists) {
          const productData = productDoc.data();
          const item = transactionData.items.find(i => i.product && i.product.id === productRefs[index].id);
          
          if (item) {
            const currentStock = productData.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            if (currentStock >= item.quantity) {
              transaction.update(productRefs[index], { stock: newStock });
            } else {
              console.warn(`Insufficient stock for product: ${productRefs[index].id}`);
            }
          }
        }
      });
    });
    
    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(orderRef.id, orderData);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the whole process if email sending fails
    }
    
    console.log(`Order created successfully: ${orderRef.id}`);
    return res.redirect(`/order-confirmation/${orderRef.id}`);
    
  } catch (error) {
    console.error('Error processing payment success:', error);
    return res.redirect('/payment-failure?error=server_error');
  }
});

// Also add a POST handler for the same route to handle potential POST redirects
app.post('/api/payment-success', async (req, res) => {
  // Extract transaction ID from either query parameters or request body
  const transactionId = req.query.transactionId || req.body.transactionId;
  
  // Redirect to the GET handler with the transaction ID
  res.redirect(`/api/payment-success?transactionId=${transactionId}`);
});

// Payment Failure Route
app.get('/api/payment-failure', async (req, res) => {
  const { transactionId } = req.query;
  
  if (transactionId) {
    try {
      const firestore = admin.firestore();
      const transactionSnapshot = await firestore
        .collection('transactions')
        .where('txnid', '==', transactionId)
        .get();

      if (!transactionSnapshot.empty) {
        const transactionDoc = transactionSnapshot.docs[0];
        await transactionDoc.ref.update({
          status: 'failed',
          paymentStatus: 'failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating failed transaction:', error);
    }
  }
  
  return res.redirect('/payment-failure');
});

// Order Confirmation Route
app.get('/order-confirmation/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).send('Order ID is required');
    }
    
    const firestore = admin.firestore();
    const orderDoc = await firestore.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).send('Order not found');
    }
    
    // If you're using a frontend framework, redirect to the frontend route
    // return res.redirect(`${process.env.FRONTEND_URL}/order-confirmation/${orderId}`);
    
    // If you're serving HTML directly from Express
    const orderData = orderDoc.data();
    
    // Create address display HTML if address exists
    const addressHtml = orderData.shippingAddress ? `
      <div class="address-info">
        <h2>Shipping Address</h2>
        <p><strong>${orderData.shippingAddress.fullName || orderData.customerName}</strong></p>
        <p>${orderData.shippingAddress.addressLine1 || ''}</p>
        ${orderData.shippingAddress.addressLine2 ? `<p>${orderData.shippingAddress.addressLine2}</p>` : ''}
        <p>${orderData.shippingAddress.area || ''}, ${orderData.shippingAddress.city || 'Hyderabad'}, ${orderData.shippingAddress.state || 'Telangana'}</p>
        <p>PIN: ${orderData.shippingAddress.pinCode || ''}</p>
        <p>Phone: ${orderData.phoneNumber || orderData.shippingAddress.phoneNumber || ''}</p>
      </div>
    ` : '';
    
    // Create a simple HTML page with order details
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Confirmation</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .order-info, .address-info {
            margin-bottom: 20px;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            font-weight: bold;
            text-align: right;
            margin-top: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 20px;
            text-align: center;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> #${orderId.slice(-6)}</p>
            <p><strong>Date:</strong> ${new Date(orderData.createdAt.toDate()).toLocaleString()}</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
          </div>
          
          ${addressHtml}
          
          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map(item => `
                <tr>
                  <td>${item.product.title}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.product.currentCost * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: $${orderData.subtotal.toFixed(2)}</p>
            <p>Shipping: $${orderData.shipping.toFixed(2)}</p>
            <p>Total: $${orderData.total.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="http://localhost:5174" class="button">Continue Shopping</a>
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
    
  } catch (error) {
    console.error('Error displaying order confirmation:', error);
    res.status(500).send('Error processing your request');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;