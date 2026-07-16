import { fetchProducts } from "./data.js";
import {
  getCart,
  getCartItemCount,
  clearCart,
  removeFromCart,
  updateCartQuantity,
} from "./storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const cartCounterDisplay = document.getElementById("cart-counter");
  const cartWorkspace = document.getElementById("cart-workspace");
  const itemsContainer = document.getElementById("cart-items-container");
  const emptyCartMsg = document.getElementById("empty-cart-msg");
  const totalPriceDisplay = document.getElementById("cart-total-price");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmationMsg = document.getElementById("confirmation-msg");

  // Master product list to reference prices/names
  let allProducts = [];
  let shouldAnimateCartItems = true;

  // 1. Initial Load
  try {
    allProducts = await fetchProducts();
    renderCartDisplay(); // Call our new reusable function
  } catch (error) {
    itemsContainer.innerHTML = `<p class="error-msg" style="color: red; font-weight: bold;">Error loading cart details. Please try again.</p>`;
  }

  // 2. The Reusable Render Function
  function renderCartDisplay() {
    updateCartCounter();
    const cartItems = getCart();

    // Check if cart is empty
    if (cartItems.length === 0) {
      cartWorkspace.classList.add("hidden");
      emptyCartMsg.classList.remove("hidden");
      return;
    }

    // Hide empty message if we have items
    emptyCartMsg.classList.add("hidden");

    let grandTotal = 0;
    itemsContainer.innerHTML = ""; // Clear out the old list

    // Generate HTML for each cart item
    cartItems.forEach((cartItem) => {
      const product = allProducts.find((p) => p.id === cartItem.id);

      if (product) {
        const itemTotal = product.price * cartItem.quantity;
        grandTotal += itemTotal;

        const itemEl = document.createElement("article");
        itemEl.classList.add("cart-item");
        if (shouldAnimateCartItems) {
          itemEl.classList.add("animate-on-load");
        }
        itemEl.innerHTML = `
          <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
          <div class="cart-item-details">
            <h3>${product.name}</h3>
            <div class="cart-quantity-control">
              <button class="quantity-btn" data-id="${product.id}" data-action="decrease" aria-label="Decrease quantity">−</button>
              <span class="quantity-value">${cartItem.quantity}</span>
              <button class="quantity-btn" data-id="${product.id}" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" data-id="${product.id}">Remove</button>
          </div>
        `;
        itemsContainer.appendChild(itemEl);
      }
    });

    // Update total display and show the workspace
    totalPriceDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    cartWorkspace.classList.remove("hidden");

    // Attach event listeners to the newly created Remove buttons
    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const productId = event.target.getAttribute("data-id");

        const itemElement = event.target.closest(".cart-item");
        itemElement.classList.add("item-removing");

        setTimeout(() => {
          removeFromCart(productId);
          renderCartDisplay();
        }, 300);
      });
    });

    shouldAnimateCartItems = false;

    // Attach event listeners to quantity adjustment buttons
    const quantityButtons = document.querySelectorAll(".quantity-btn");
    quantityButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const productId = event.target.getAttribute("data-id");
        const action = event.target.getAttribute("data-action");
        const cartItem = getCart().find((item) => item.id === productId);
        if (!cartItem) return;

        const newQuantity = action === "increase"
          ? cartItem.quantity + 1
          : cartItem.quantity - 1;

        updateCartQuantity(productId, newQuantity);
        renderCartDisplay();
      });
    });
  }

  // 3. Handle Checkout Submission
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const addressInput = document.getElementById("user-address");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset styles
    [nameInput, emailInput, addressInput].forEach(
      (el) => (el.style.borderColor = ""),
    );

    let isValid = true;

    if (!nameInput.value.trim()) {
      nameInput.style.borderColor = "red";
      isValid = false;
    }
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.style.borderColor = "red";
      isValid = false;
    }
    if (!addressInput.value.trim()) {
      addressInput.style.borderColor = "red";
      isValid = false;
    }

    if (!isValid) return;

    // Successful Order Cleanup
    clearCart();

    // Hide workspace and show success message
    cartWorkspace.classList.add("hidden");

    confirmationMsg.innerHTML = `
      <h2>🏕️ Order Confirmed!</h2>
      <p>Thank you for gearing up with us, <strong>${escapeHTML(nameInput.value)}</strong>.</p>
      <p>Your receipt has been sent to ${escapeHTML(emailInput.value)}.</p>
      <p>We will ship your items to: <br><em>${escapeHTML(addressInput.value)}</em></p>
      <a href="index.html" class="btn" style="display:inline-block; margin-top:1.5rem; max-width: 250px;">Return to Catalog</a>
    `;
    confirmationMsg.classList.remove("hidden");

    updateCartCounter();
  });

  // Utility helpers
  function updateCartCounter() {
    if (cartCounterDisplay) {
      const count = getCartItemCount();
      cartCounterDisplay.textContent = `🛒 Cart: ${count} item${count === 1 ? "" : "s"}`;
    }
  }

  function escapeHTML(str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  }
});
