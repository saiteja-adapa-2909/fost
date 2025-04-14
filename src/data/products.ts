export const allProducts = [
  {
    id: 1,
    title: "Strawberry Splash",
    description: "A refreshing blend of fresh strawberries with a hint of lime",
    originalCost: 6.99,
    currentCost: 4.99,
    category: "fruit",
    tags: ["berry", "citrus", "refreshing"],
    imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 2,
    title: "Mango Tango",
    description: "Sweet and tropical mango juice made from premium Alphonso mangoes",
    originalCost: 7.99,
    currentCost: 5.99,
    category: "fruit",
    tags: ["tropical", "sweet"],
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724eb42c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 3,
    title: "Green Detox",
    description: "A healthy blend of kale, cucumber, green apple and mint",
    originalCost: 8.99,
    currentCost: 6.99,
    category: "vegetable",
    tags: ["healthy", "detox", "green"],
    imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 4,
    title: "Berry Blast",
    description: "A mix of blueberries, blackberries and raspberries for antioxidant power",
    originalCost: 7.49,
    currentCost: 5.49,
    category: "fruit",
    tags: ["berry", "antioxidant"],
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724eb42c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 5,
    title: "Carrot Sunshine",
    description: "Fresh carrot juice with a touch of ginger and orange",
    originalCost: 6.99,
    currentCost: 5.49,
    category: "vegetable",
    tags: ["healthy", "immunity"],
    imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 6,
    title: "Tropical Paradise",
    description: "A blend of pineapple, coconut water, and passion fruit",
    originalCost: 8.99,
    currentCost: 6.99,
    category: "fruit",
    tags: ["tropical", "refreshing"],
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724eb42c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 7,
    title: "Beetroot Boost",
    description: "Energizing beetroot juice with apple and lemon",
    originalCost: 7.99,
    currentCost: 5.99,
    category: "vegetable",
    tags: ["energy", "healthy"],
    imageUrl: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  },
  {
    id: 8,
    title: "Watermelon Chill",
    description: "Pure watermelon juice with a hint of mint",
    originalCost: 6.49,
    currentCost: 4.99,
    category: "fruit",
    tags: ["refreshing", "summer"],
    imageUrl: "https://images.unsplash.com/photo-1546173159-315724eb42c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  }
];

export const featuredProducts = allProducts.slice(0, 4);