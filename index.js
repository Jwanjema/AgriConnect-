// Data
let products = [];
let farmerProducts = JSON.parse(localStorage.getItem('farmerProducts')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const landingPage = document.getElementById('landing');
const farmerView = document.getElementById('farmer-view');
const buyerView = document.getElementById('buyer-view');
const farmerBtn = document.getElementById('farmer-btn');
const buyerBtn = document.getElementById('buyer-btn');
const backBtns = document.querySelectorAll('.back-btn');
const productForm = document.getElementById('add-product-form');
const farmerProductsList = document.getElementById('farmer-products-list');
const buyerProductsList = document.getElementById('buyer-products-list');
const searchInput = document.getElementById('search');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const editModal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close-btn');
const editForm = document.getElementById('edit-product-form');

// Kenyan Products Data
const kenyanProducts = [
  { id: 1, name: "Sukuma Wiki", price: 20, category: "vegetables", farmer: "Kamau's Farm" },
  { id: 2, name: "Maize", price: 50, category: "grains", farmer: "Njeri's Shamba" },
  { id: 3, name: "Avocado", price: 30, category: "fruits", farmer: "Mountain View Farm" },
  { id: 4, name: "Irish Potatoes", price: 80, category: "tubers", farmer: "Highland Growers" },
  { id: 5, name: "Tomatoes", price: 40, category: "vegetables", farmer: "Green Valley Farm" }
];

// Seasonal Calendar Data
const seasonalCrops = {
  january: ["Sukuma Wiki", "Carrots", "Onions"],
  february: ["Spinach", "Cabbage", "Kale"],
  march: ["Lettuce", "Broccoli", "Cauliflower"],
  april: ["Peas", "Beans", "Spinach"],
  may: ["Avocado", "Mangoes", "Pineapples"],
  june: ["Tomatoes", "Onions", "Kale"],
  july: ["Maize", "Beans", "Peas"],
  august: ["Potatoes", "Carrots", "Cabbage"],
  september: ["Sukuma Wiki", "Spinach", "Kale"],
  october: ["Tomatoes", "Onions", "Peppers"],
  november: ["Avocado", "Mangoes", "Bananas"],
  december: ["Peas", "Beans", "Spinach"]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  setupEventListeners();
  showView('landing');
});

// View Management
function showView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
    view.classList.add('hidden');
  });

  // Show the requested view
  const viewElement = document.getElementById(`${viewName}-view`) || document.getElementById(viewName);
  if (viewElement) {
    viewElement.classList.remove('hidden');
    viewElement.classList.add('active');
    
    // Load appropriate data for the view
    if (viewName === 'farmer') {
      renderFarmerProducts();
    } else if (viewName === 'buyer') {
      renderProducts();
      initCalendar();
    }
  }
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  farmerBtn.addEventListener('click', () => showView('farmer'));
  buyerBtn.addEventListener('click', () => showView('buyer'));
  
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => showView('landing'));
  });

  // Forms
  productForm.addEventListener('submit', handleAddProduct);
  editForm.addEventListener('submit', handleEditProduct);

  // Search
  searchInput.addEventListener('input', filterProducts);

  // Modal
  closeBtn.addEventListener('click', () => editModal.classList.add('hidden'));
  window.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.classList.add('hidden');
  });

  // Payment
  document.getElementById('proceed-to-payment').addEventListener('click', handlePayment);
}

// Product Management
function loadProducts() {
  // Try to fetch from db.json first
  fetch('http://localhost:3000/products')
    .then(response => response.json())
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(() => {
      products = kenyanProducts;
      renderProducts();
    });
}

function handleAddProduct(e) {
  e.preventDefault();
  
  const newProduct = {
    id: Date.now(),
    name: document.getElementById('product-name').value,
    price: parseInt(document.getElementById('product-price').value),
    category: document.getElementById('product-category').value,
    farmer: "Your Farm"
  };
  
  farmerProducts.push(newProduct);
  saveFarmerProducts();
  e.target.reset();
  renderFarmerProducts();
}

function saveFarmerProducts() {
  localStorage.setItem('farmerProducts', JSON.stringify(farmerProducts));
}

function renderFarmerProducts() {
  if (farmerProducts.length === 0) {
    farmerProductsList.innerHTML = '<p class="empty-message">You haven\'t added any products yet</p>';
    return;
  }
  
  farmerProductsList.innerHTML = farmerProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      <h3>${product.name}</h3>
      <p class="price">Ksh ${product.price}</p>
      <p class="category">${product.category}</p>
      <div class="product-actions">
        <button class="edit-btn" onclick="openEditModal(${product.id})">Edit</button>
        <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function openEditModal(productId) {
  const product = farmerProducts.find(p => p.id === productId);
  if (!product) return;

  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-product-name').value = product.name;
  document.getElementById('edit-product-price').value = product.price;
  document.getElementById('edit-product-category').value = product.category;
  
  editModal.classList.remove('hidden');
}

function handleEditProduct(e) {
  e.preventDefault();
  
  const productId = parseInt(document.getElementById('edit-product-id').value);
  const updatedProduct = {
    id: productId,
    name: document.getElementById('edit-product-name').value,
    price: parseInt(document.getElementById('edit-product-price').value),
    category: document.getElementById('edit-product-category').value,
    farmer: "Your Farm"
  };
  
  const index = farmerProducts.findIndex(p => p.id === productId);
  if (index !== -1) {
    farmerProducts[index] = updatedProduct;
    saveFarmerProducts();
    renderFarmerProducts();
    renderProducts();
    editModal.classList.add('hidden');
  }
}

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    farmerProducts = farmerProducts.filter(p => p.id !== productId);
    saveFarmerProducts();
    renderFarmerProducts();
    renderProducts();
  }
}

// Buyer Marketplace
function renderProducts() {
  const allProducts = [...products, ...farmerProducts];
  
  if (allProducts.length === 0) {
    buyerProductsList.innerHTML = '<p class="empty-message">No products available in the marketplace</p>';
    return;
  }
  
  buyerProductsList.innerHTML = allProducts.map(product => `
    <div class="product-card" data-id="${product.id}">
      <h3>${product.name}</h3>
      <p class="price">Ksh ${product.price}</p>
      <p class="category">${product.category} • ${product.farmer}</p>
      <button class="add-to-cart">Add to Cart</button>
    </div>
  `).join('');
  
  // Add to cart event listeners
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = parseInt(e.target.closest('.product-card').dataset.id);
      const product = [...products, ...farmerProducts].find(p => p.id === productId);
      addToCart(product);
    });
  });
}

function filterProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = [...products, ...farmerProducts].filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.category.toLowerCase().includes(searchTerm)
  );
  
  buyerProductsList.innerHTML = filtered.length === 0 ? 
    '<p class="empty-message">No matching products found</p>' :
    filtered.map(product => `
      <div class="product-card" data-id="${product.id}">
        <h3>${product.name}</h3>
        <p class="price">Ksh ${product.price}</p>
        <p class="category">${product.category} • ${product.farmer}</p>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `).join('');
}

// Seasonal Calendar
function initCalendar() {
  const monthsContainer = document.querySelector('.calendar-months');
  monthsContainer.innerHTML = '';
  
  Object.keys(seasonalCrops).forEach(month => {
    const button = document.createElement('button');
    button.textContent = month.charAt(0).toUpperCase() + month.slice(1);
    button.addEventListener('click', () => showCropsForMonth(month));
    monthsContainer.appendChild(button);
  });
  
  // Show current month by default
  const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
  showCropsForMonth(currentMonth);
}

function showCropsForMonth(month) {
  const cropsContainer = document.querySelector('.seasonal-crops');
  cropsContainer.innerHTML = seasonalCrops[month].map(crop => `
    <div class="seasonal-crop">${crop}</div>
  `).join('');
}

// Cart Management
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  updateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  cartItems.innerHTML = cart.length === 0 ? 
    '<li class="empty-message">Your cart is empty</li>' :
    cart.map((item, index) => `
      <li>
        <span>${item.name} ${item.quantity > 1 ? `(×${item.quantity})` : ''}</span>
        <span>Ksh ${item.price * (item.quantity || 1)}</span>
        <button class="remove-from-cart" onclick="removeFromCart(${index})">Remove</button>
      </li>
    `).join('');
  
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  cartTotal.textContent = `Ksh ${total}`;
}

function handlePayment() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add some products first.");
  } else {
    alert(`Payment of ${cartTotal.textContent} processed successfully!`);
    cart = [];
    saveCart();
    updateCart();
  }
}

// Make functions available globally
window.openEditModal = openEditModal;
window.deleteProduct = deleteProduct;
window.removeFromCart = removeFromCart;