// AgriConnect Kenya - index.js

const baseURL = "http://localhost:3000";

// Views
const views = {
  landing: document.getElementById("landing"),
  farmer: document.getElementById("farmer-view"),
  buyer: document.getElementById("buyer-view"),
};

function showView(view) {
  Object.values(views).forEach((v) => v.classList.add("hidden"));
  views[view].classList.remove("hidden");
  views[view].classList.add("active");
}

// Navigation Buttons
document.getElementById("farmer-btn").addEventListener("click", () => showView("farmer"));
document.getElementById("buyer-btn").addEventListener("click", () => {
  showView("buyer");
  loadSeasonalCrops(new Date().toLocaleString("default", { month: "long" }));
});

document.querySelectorAll(".back-btn").forEach((btn) =>
  btn.addEventListener("click", () => showView("landing"))
);

// Fetch Products
async function fetchProducts() {
  const res = await fetch(`${baseURL}/products`);
  return res.json();
}

// Render Farmer Products
const farmerList = document.getElementById("farmer-products-list");
function renderFarmerProducts(products) {
  farmerList.innerHTML = "";
  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p class="price">Ksh ${product.price}</p>
      <p class="category">${product.category}</p>
      <div class="product-actions">
        <button class="btn edit-btn" data-id="${product.id}">Edit</button>
        <button class="btn delete-btn" data-id="${product.id}">Delete</button>
      </div>
    `;
    farmerList.appendChild(div);
  });
}

// Add Product
const addProductForm = document.getElementById("add-product-form");
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("product-name").value.trim();
  const price = parseInt(document.getElementById("product-price").value);
  const category = document.getElementById("product-category").value;

  await fetch(`${baseURL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category }),
  });

  addProductForm.reset();
  const updated = await fetchProducts();
  renderFarmerProducts(updated);
});

// Edit/Delete Handlers
farmerList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("edit-btn")) {
    const product = await fetch(`${baseURL}/products/${id}`).then((r) => r.json());
    document.getElementById("edit-product-id").value = product.id;
    document.getElementById("edit-product-name").value = product.name;
    document.getElementById("edit-product-price").value = product.price;
    document.getElementById("edit-product-category").value = product.category;
    document.getElementById("edit-modal").classList.remove("hidden");
  } else if (e.target.classList.contains("delete-btn")) {
    await fetch(`${baseURL}/products/${id}`, { method: "DELETE" });
    const updated = await fetchProducts();
    renderFarmerProducts(updated);
  }
});

document.getElementById("edit-product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-product-id").value;
  const name = document.getElementById("edit-product-name").value;
  const price = parseInt(document.getElementById("edit-product-price").value);
  const category = document.getElementById("edit-product-category").value;

  await fetch(`${baseURL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category }),
  });

  document.getElementById("edit-modal").classList.add("hidden");
  const updated = await fetchProducts();
  renderFarmerProducts(updated);
});

document.querySelector(".close-btn").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

// Buyer Marketplace
const buyerList = document.getElementById("buyer-products-list");
function renderBuyerProducts(products) {
  buyerList.innerHTML = "";
  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p class="price">Ksh ${product.price}</p>
      <p class="category">${product.category}</p>
      <button class="btn add-to-cart" data-id="${product.id}">Add to Cart</button>
    `;
    buyerList.appendChild(div);
  });
}

// Cart
let cart = [];
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <span class="cart-item-price">Ksh ${item.price}</span>
      <button class="remove-from-cart" data-index="${index}">Remove</button>
    `;
    cartItems.appendChild(li);
  });
  cartTotal.textContent = `Ksh ${total}`;
}

buyerList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("add-to-cart")) {
    const id = e.target.dataset.id;
    const product = await fetch(`${baseURL}/products/${id}`).then((r) => r.json());
    cart.push(product);
    updateCart();
  }
});

cartItems.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-from-cart")) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    updateCart();
  }
});

// Payment Simulation
const paymentBtn = document.getElementById("proceed-to-payment");
paymentBtn.addEventListener("click", () => {
  if (cart.length === 0) return alert("Your cart is empty!");
  alert("✅ Payment successful! Thank you for shopping with AgriConnect Kenya.");
  cart = [];
  updateCart();
});

// Seasonal Calendar (Kenyan Crops)
const calendarMonths = document.querySelector(".calendar-months");
const seasonalCropsContainer = document.querySelector(".seasonal-crops");

const cropsByMonth = {
  January: ["Sukuma Wiki", "Maize", "Mangoes"],
  February: ["Spinach", "Cabbage", "Passion Fruits"],
  March: ["Tomatoes", "Onions", "Maize"],
  April: ["Carrots", "Beetroot", "Kales"],
  May: ["Green Beans", "Avocados", "Cabbage"],
  June: ["Maize", "Pineapples", "Irish Potatoes"],
  July: ["Sukuma Wiki", "Spinach", "Sweet Potatoes"],
  August: ["Onions", "Watermelon", "Beans"],
  September: ["Mangoes", "Tomatoes", "Pumpkins"],
  October: ["Carrots", "Passion Fruits", "Cabbage"],
  November: ["Kales", "Avocados", "Maize"],
  December: ["Spinach", "Sweet Potatoes", "Bananas"],
};

Object.keys(cropsByMonth).forEach((month) => {
  const btn = document.createElement("button");
  btn.textContent = month;
  btn.addEventListener("click", () => loadSeasonalCrops(month));
  calendarMonths.appendChild(btn);
});

function loadSeasonalCrops(month) {
  document.querySelectorAll(".calendar-months button").forEach((b) => b.classList.remove("active"));
  const activeBtn = Array.from(document.querySelectorAll(".calendar-months button")).find(b => b.textContent === month);
  if (activeBtn) activeBtn.classList.add("active");
  const crops = cropsByMonth[month] || [];
  seasonalCropsContainer.innerHTML = crops
    .map((crop) => `<div class="seasonal-crop">${crop}</div>`)
    .join("");
}

// Initial Load
fetchProducts().then((data) => {
  renderFarmerProducts(data);
  renderBuyerProducts(data);
});
