import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMPZ6IfJqYGNZD5GEud3yQNPOLUaxLDUk",
  authDomain: "fostweb.firebaseapp.com",
  projectId: "fostweb",
  storageBucket: "fostweb.firebasestorage.app",
  messagingSenderId: "563759291246",
  appId: "1:563759291246:web:9c273742aecd507eb6ff7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase instances
export { db, storage, collection, addDoc, getDocs, ref, uploadBytes, getDownloadURL };

// Export a default object if needed
export default {
  app,
  db,
  storage
};