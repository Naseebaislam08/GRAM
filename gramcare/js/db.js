// GramCare Data Store (db.js)

// Catalog of products in the mini marketplace
const PRODUCTS = [
  {
    id: "prod-tomato-fungicide",
    name: "BioShield Copper Fungicide",
    category: "organic",
    price: 18.99,
    rating: 4.8,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300", // backup web URL
    description: "Highly effective organic copper fungicide spray for control of early/late blight, leaf spots, and mildews on tomatoes, potatoes, and other vegetables.",
    application: "Dilute 2 tbsp per gallon of water. Spray thoroughly on all plant surfaces. Repeat every 7-10 days."
  },
  {
    id: "prod-wheat-rust-cure",
    name: "RustGuard Triazole Systemic",
    category: "pesticides",
    price: 24.50,
    rating: 4.6,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=300",
    description: "Broad-spectrum systemic fungicide specifically formulated to cure and prevent rust diseases (yellow, brown, black rust) in wheat, barley, and cereal crops.",
    application: "Apply at first sign of disease. Mix 15ml in 10L water. Apply via foliar spray."
  },
  {
    id: "prod-potato-blight",
    name: "BlightStop Organic Neem Concentrate",
    category: "organic",
    price: 15.25,
    rating: 4.7,
    reviewsCount: 215,
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=300",
    description: "Pure cold-pressed neem oil concentrate mixed with organic wetting agents. Effectively disrupts fungal spores and deters insect pests.",
    application: "Mix 30ml concentrate with 1 gallon water. Spray early morning or late evening. Safe up to day of harvest."
  },
  {
    id: "prod-rice-blast-control",
    name: "BlastOff Tricyclazole 75% WP",
    category: "pesticides",
    price: 29.99,
    rating: 4.5,
    reviewsCount: 76,
    image: "https://images.unsplash.com/photo-1535242208474-9a2793260ca8?auto=format&fit=crop&q=80&w=300",
    description: "Specialized systemic fungicide for effective control of leaf blast, neck blast, and node blast in rice crops.",
    application: "Foliar spray at 0.6g per liter of water. First spray at tillering stage, second at booting stage."
  },
  {
    id: "prod-npk-booster",
    name: "MaxGrow 19-19-19 NPK Fertilizer",
    category: "fertilizers",
    price: 12.99,
    rating: 4.9,
    reviewsCount: 310,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=300",
    description: "100% water-soluble balanced NPK fertilizer. Promotes healthy vegetative growth, strong root structure, and high crop yield.",
    application: "Apply through drip irrigation or foliar spray. Use 5g per liter of water during active growth stages."
  },
  {
    id: "prod-soil-acidifier",
    name: "Sulphur-Max Soil Conditioner",
    category: "fertilizers",
    price: 16.49,
    rating: 4.4,
    reviewsCount: 64,
    image: "https://images.unsplash.com/photo-1463171359979-300c4642bebb?auto=format&fit=crop&q=80&w=300",
    description: "Elemental sulphur granules for lowering soil pH and providing essential sulphur nutrition to oilseeds, pulses, and vegetables.",
    application: "Broadcasting at 10-15kg per acre during land preparation, or apply around root zones."
  },
  {
    id: "prod-pruning-shears",
    name: "ProShear Ergonomic Bypass Pruner",
    category: "tools",
    price: 22.00,
    rating: 4.8,
    reviewsCount: 188,
    image: "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=300",
    description: "Professional grade bypass pruning shears with hardened carbon steel blades. Ideal for pruning diseased stems and leaves to check disease spread.",
    application: "Keep blades clean. Disinfect blades with rubbing alcohol between cuts on infected crops to avoid cross-contamination."
  },
  {
    id: "prod-backpack-sprayer",
    name: "AgriSpray 16L Backpack Sprayer",
    category: "tools",
    price: 45.99,
    rating: 4.6,
    reviewsCount: 120,
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300",
    description: "Ergonomic 16-liter manual knapsack sprayer with adjustable brass nozzles, padded shoulder straps, and durable leak-proof chamber.",
    application: "Rinse tank thoroughly after each pesticide/fungicide application. Store in dry shade."
  }
];

// Mock Diagnosis Rules database
const DIAGNOSIS_RULES = {
  tomato: [
    {
      id: "diag-tomato-early-blight",
      diseaseName: "Tomato Early Blight",
      pathogen: "Alternaria solani (Fungus)",
      confidenceRange: [88, 97],
      symptoms: "Dark, concentric target-like spots appearing first on older lower leaves. Leaves yellow around the spots and eventually drop. Can lead to stem lesions and sunscalded fruit.",
      organicTreatment: "Spray copper fungicides (like BioShield) or neem oil. Prune lower leaves to increase air circulation. Mulch around the base of the plant.",
      chemicalTreatment: "Apply Chlorothalonil or Mancozeb-based fungicides at regular intervals according to package instructions.",
      preventiveMeasures: "Rotate crops annually (avoid nightshades for 3 years). Water the soil directly, not the leaves. Maintain proper spacing between tomato plants.",
      recommendedProducts: ["prod-tomato-fungicide", "prod-npk-booster", "prod-pruning-shears"]
    },
    {
      id: "diag-tomato-healthy",
      diseaseName: "Healthy Tomato Plant",
      pathogen: "None",
      confidenceRange: [95, 99],
      symptoms: "Leaves are vibrant green with no lesions, spots, or yellow margins. Stems are sturdy, and fruit development is uniform and free of spots.",
      organicTreatment: "No treatment required. Maintain organic compost applications.",
      chemicalTreatment: "No chemical fungicide or pesticide needed.",
      preventiveMeasures: "Continue regular watering schedule, staking, and apply general NPK nutrition to ensure high yield.",
      recommendedProducts: ["prod-npk-booster"]
    }
  ],
  wheat: [
    {
      id: "diag-wheat-rust",
      diseaseName: "Wheat Leaf Rust",
      pathogen: "Puccinia triticina (Fungus)",
      confidenceRange: [85, 96],
      symptoms: "Small, oval, orange-brown pustules (uredinia) scattered randomly across the leaf surface. Pustules rub off on fingers, leaving an orange dust-like residue.",
      organicTreatment: "Dust with elemental sulphur or spray compost tea. Select rust-resistant crop varieties in the future.",
      chemicalTreatment: "Apply systemic triazole fungicides (such as RustGuard) immediately upon detection to arrest infection spread.",
      preventiveMeasures: "Destroy volunteer wheat plants before sowing. Avoid excessive nitrogen fertilizers which promote dense, humid foliage.",
      recommendedProducts: ["prod-wheat-rust-cure", "prod-soil-acidifier"]
    },
    {
      id: "diag-wheat-healthy",
      diseaseName: "Healthy Wheat Crop",
      pathogen: "None",
      confidenceRange: [94, 99],
      symptoms: "Uniform green blades with no rust pustules, powdery patches, or tip necrosis. Solid stand with healthy head formation.",
      organicTreatment: "None required. Maintain moisture levels.",
      chemicalTreatment: "None required.",
      preventiveMeasures: "Apply micro-nutrients during the tillering and booting stages. Monitor weekly for any signs of spores.",
      recommendedProducts: ["prod-npk-booster"]
    }
  ],
  potato: [
    {
      id: "diag-potato-late-blight",
      diseaseName: "Potato Late Blight",
      pathogen: "Phytophthora infestans (Oomycete)",
      confidenceRange: [90, 98],
      symptoms: "Water-soaked, dark green to black lesions starting at leaf tips and margins. Under humid conditions, a white mildew-like growth appears on the leaf underside. Tubers show reddish-brown rot.",
      organicTreatment: "Spray copper-based fungicides (BioShield) or Neem oil extracts (BlightStop) proactively. Immediately dig up and destroy infected plants.",
      chemicalTreatment: "Use systemic fungicides containing metalaxyl, fluopicolide, or chlorothalonil. Apply every 5-7 days in cool, wet weather.",
      preventiveMeasures: "Use certified disease-free seed potatoes. Hill soil around potato bases to protect tubers from spores washing down. Avoid overhead watering.",
      recommendedProducts: ["prod-tomato-fungicide", "prod-potato-blight", "prod-pruning-shears"]
    },
    {
      id: "diag-potato-healthy",
      diseaseName: "Healthy Potato Plant",
      pathogen: "None",
      confidenceRange: [96, 99],
      symptoms: "Lush green compound leaves. Upright growth with no wilting, dark lesions, or leaf curling.",
      organicTreatment: "None required.",
      chemicalTreatment: "None required.",
      preventiveMeasures: "Ensure soil is well-drained and crop rotation is practiced.",
      recommendedProducts: ["prod-npk-booster"]
    }
  ],
  rice: [
    {
      id: "diag-rice-blast",
      diseaseName: "Rice Blast",
      pathogen: "Magnaporthe oryzae (Fungus)",
      confidenceRange: [87, 95],
      symptoms: "Spindle-shaped, diamond-like lesions on leaves with grey/whitish centers and reddish-brown borders. Can attack nodes and panicles (neck blast), causing them to rot and break.",
      organicTreatment: "Spray bio-fungicides containing Bacillus subtilis. Avoid high planting densities. Burn infected straw residues after harvest.",
      chemicalTreatment: "Apply Tricyclazole (BlastOff) or Isoprothiolane at the tillering and panicle initiation stages.",
      preventiveMeasures: "Avoid excessive nitrogen application. Maintain a consistent water level in paddy fields to reduce drought stress.",
      recommendedProducts: ["prod-rice-blast-control", "prod-backpack-sprayer"]
    },
    {
      id: "diag-rice-healthy",
      diseaseName: "Healthy Paddy Crop",
      pathogen: "None",
      confidenceRange: [93, 99],
      symptoms: "Vigorous green tillers, upright stems, and clear green leaves without lesions. Strong panicle development.",
      organicTreatment: "None required.",
      chemicalTreatment: "None required.",
      preventiveMeasures: "Maintain proper water level management and optimal fertilizing schedule.",
      recommendedProducts: ["prod-npk-booster"]
    }
  ],
  corn: [
    {
      id: "diag-corn-leaf-blight",
      diseaseName: "Northern Corn Leaf Blight",
      pathogen: "Exserohilum turcicum (Fungus)",
      confidenceRange: [86, 94],
      symptoms: "Long, elliptical, grayish-green or tan lesions (cigar-shaped) on leaves, typically starting from lower leaves. Lesions can merge, destroying large areas of leaf tissue.",
      organicTreatment: "Apply preventive neem sprays or potassium bicarbonate. Practice tillage to bury crop debris.",
      chemicalTreatment: "Foliar fungicides like strobilurins or triazoles are effective if applied early in susceptible hybrids.",
      preventiveMeasures: "Plant disease-resistant corn hybrids. Rotate crops to reduce inoculum survival in soil.",
      recommendedProducts: ["prod-tomato-fungicide", "prod-backpack-sprayer"]
    },
    {
      id: "diag-corn-healthy",
      diseaseName: "Healthy Corn Crop",
      pathogen: "None",
      confidenceRange: [95, 99],
      symptoms: "Robust tall stalk, thick green leaves with parallel veins free of lesions, healthy silk and ear development.",
      organicTreatment: "None required.",
      chemicalTreatment: "None required.",
      preventiveMeasures: "Monitor for pests like stalk borers and apply balanced nutrition.",
      recommendedProducts: ["prod-npk-booster"]
    }
  ]
};

// Database local storage management functions
const GramCareDB = {
  // Get all products
  getProducts: () => PRODUCTS,
  
  // Find product by ID
  getProductById: (id) => PRODUCTS.find(p => p.id === id),

  // Search/Filter products
  queryProducts: (query = "", category = "all") => {
    let result = PRODUCTS;
    if (category !== "all") {
      result = result.filter(p => p.category === category);
    }
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return result;
  },

  // Get matching diagnosis rule
  getDiagnosisRule: (crop, diseaseType = "infected") => {
    const rules = DIAGNOSIS_RULES[crop.toLowerCase()];
    if (!rules) return null;
    if (diseaseType === "healthy") {
      return rules.find(r => r.id.endsWith("-healthy")) || rules[0];
    } else {
      return rules.find(r => !r.id.endsWith("-healthy")) || rules[0];
    }
  },

  // Diagnosis History Management (localStorage)
  getHistory: () => {
    const data = localStorage.getItem("gramcare_history");
    return data ? JSON.parse(data) : [];
  },

  addHistory: (item) => {
    const history = GramCareDB.getHistory();
    const newItem = {
      id: "hist-" + Date.now(),
      timestamp: new Date().toISOString(),
      ...item
    };
    history.unshift(newItem);
    localStorage.setItem("gramcare_history", JSON.stringify(history));
    return newItem;
  },

  clearHistory: () => {
    localStorage.setItem("gramcare_history", JSON.stringify([]));
  },

  // Consultation Bookings Management (localStorage)
  getBookings: () => {
    const data = localStorage.getItem("gramcare_bookings");
    return data ? JSON.parse(data) : [];
  },

  addBooking: (booking) => {
    const bookings = GramCareDB.getBookings();
    const newBooking = {
      id: "book-" + Date.now(),
      status: "Confirmed", // Default confirmed for high-fidelity simulator
      createdAt: new Date().toISOString(),
      ...booking
    };
    bookings.unshift(newBooking);
    localStorage.setItem("gramcare_bookings", JSON.stringify(bookings));
    return newBooking;
  },

  // Shopping Cart Management (localStorage)
  getCart: () => {
    const data = localStorage.getItem("gramcare_cart");
    return data ? JSON.parse(data) : [];
  },

  saveCart: (cart) => {
    localStorage.setItem("gramcare_cart", JSON.stringify(cart));
  },

  addToCart: (productId, quantity = 1) => {
    const cart = GramCareDB.getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    GramCareDB.saveCart(cart);
    return cart;
  },

  updateCartQty: (productId, quantity) => {
    let cart = GramCareDB.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.productId !== productId);
    } else {
      const item = cart.find(item => item.productId === productId);
      if (item) item.quantity = quantity;
    }
    GramCareDB.saveCart(cart);
    return cart;
  },

  removeFromCart: (productId) => {
    let cart = GramCareDB.getCart();
    cart = cart.filter(item => item.productId !== productId);
    GramCareDB.saveCart(cart);
    return cart;
  },

  clearCart: () => {
    GramCareDB.saveCart([]);
  }
};

// Export to window object for global script access
window.GramCareDB = GramCareDB;
