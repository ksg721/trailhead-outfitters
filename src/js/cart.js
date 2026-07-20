import { fetchProducts } from "./data.js";
import {
  getCart,
  clearCart,
  removeFromCart,
  updateCartQuantity,
  getCartItemCount,
} from "./storage.js";

export function syncCartCounter({ isOpen = false } = {}) {
  const cartCounterDisplay = document.getElementById("cart-counter");

  if (!cartCounterDisplay) return;

  const count = getCartItemCount();
  const itemLabel = count === 1 ? "item" : "items";

  cartCounterDisplay.textContent = `🛒 Cart: ${count} ${itemLabel}`;
  cartCounterDisplay.setAttribute(
    "aria-label",
    isOpen
      ? `Shopping cart is open with ${count} ${itemLabel}`
      : `Open shopping cart with ${count} ${itemLabel}`,
  );
  cartCounterDisplay.setAttribute("aria-expanded", String(isOpen));
}

function ensureCartModalMarkup() {
  if (document.getElementById("cart-backdrop")) {
    return;
  }

  const modalMarkup = `
    <div id="cart-backdrop" class="cart-modal-backdrop hidden" aria-hidden="true">
      <div
        id="cart-modal"
        class="cart-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
        aria-label="Shopping cart"
      >
        <div class="cart-modal-header">
          <h2 id="cart-modal-title">Your Shopping Cart</h2>
          <button
            type="button"
            class="close-modal-btn"
            id="close-cart-modal"
            aria-label="Close shopping cart"
          >
            ×
          </button>
        </div>
        <p id="cart-status-text" class="visually-hidden" aria-live="polite"></p>

        <div class="cart-modal-body">
          <div class="cart-layout hidden" id="cart-workspace">
            <section id="cart-items-container" aria-label="Items in your cart">
              <p class="loading-msg">Loading your gear...</p>
            </section>

            <section class="order-form-section" aria-label="Checkout Form">
              <h2>Order Summary</h2>
              <div class="cart-total-box">
                <span>Total:</span>
                <strong id="cart-total-price">$0.00</strong>
              </div>

              <h2 style="margin-top: 2rem; font-size: 1.25rem">Shipping Details</h2>
              <form id="checkout-form" novalidate>
                <div class="form-group">
                  <label for="user-name">Full Name *</label>
                  <input
                    type="text"
                    id="user-name"
                    name="name"
                    required
                    placeholder="John Doe"
                    aria-describedby="name-error"
                  />
                  <p class="form-error" id="name-error" role="alert"></p>
                </div>

                <div class="form-group">
                  <label for="user-email">Email Address *</label>
                  <input
                    type="email"
                    id="user-email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    aria-describedby="email-error"
                  />
                  <p class="form-error" id="email-error" role="alert"></p>
                </div>

                <div class="form-group">
                  <label for="user-address">Shipping Address *</label>
                  <input
                    type="text"
                    id="user-address"
                    name="address"
                    required
                    placeholder="123 Trailhead Way, ID"
                    aria-describedby="address-error"
                  />
                  <p class="form-error" id="address-error" role="alert"></p>
                </div>

                <button type="submit" class="btn submit-btn">
                  Complete Purchase
                </button>
              </form>
            </section>
          </div>

          <section id="empty-cart-msg" class="confirmation-container hidden">
            <h2>Your cart is empty!</h2>
            <p>Looks like you haven't added any gear for your next adventure yet.</p>
          </section>

          <section
            id="confirmation-msg"
            class="confirmation-container hidden"
          ></section>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalMarkup);
}

document.addEventListener("DOMContentLoaded", async () => {
  ensureCartModalMarkup();

  const cartCounterDisplay = document.getElementById("cart-counter");
  const cartModalBackdrop = document.getElementById("cart-backdrop");
  const cartWorkspace = document.getElementById("cart-workspace");
  const itemsContainer = document.getElementById("cart-items-container");
  const emptyCartMsg = document.getElementById("empty-cart-msg");
  const totalPriceDisplay = document.getElementById("cart-total-price");
  const checkoutForm = document.getElementById("checkout-form");
  const confirmationMsg = document.getElementById("confirmation-msg");
  const closeCartButton = document.getElementById("close-cart-modal");
  const statusText = document.getElementById("cart-status-text");

  let allProducts = [];
  let shouldAnimateCartItems = true;
  let isCartModalOpen = false;
  let lastFocusedElement = null;

  function updateCartCounter() {
    syncCartCounter({ isOpen: isCartModalOpen });
  }

  function updateCartStatusMessage() {
    if (!statusText) return;

    statusText.textContent = isCartModalOpen
      ? `Shopping cart status: ${getCartItemCount() === 0 ? "empty" : "has items"}.`
      : "";
  }

  function openCartModal() {
    if (!cartModalBackdrop) return;

    lastFocusedElement = document.activeElement;
    cartModalBackdrop.classList.remove("hidden");
    cartModalBackdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    isCartModalOpen = true;
    updateCartCounter();
    updateCartStatusMessage();
    renderCartDisplay();

    if (closeCartButton) {
      closeCartButton.focus();
    }
  }

  function closeCartModal() {
    if (!cartModalBackdrop) return;

    cartModalBackdrop.classList.add("hidden");
    cartModalBackdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    isCartModalOpen = false;
    updateCartCounter();
    updateCartStatusMessage();

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  if (cartCounterDisplay) {
    cartCounterDisplay.addEventListener("click", (event) => {
      event.preventDefault();
      if (isCartModalOpen) {
        closeCartModal();
      } else {
        openCartModal();
      }
    });
  }

  if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCartModal);
  }

  if (cartModalBackdrop) {
    cartModalBackdrop.addEventListener("click", (event) => {
      if (event.target === cartModalBackdrop) {
        closeCartModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!isCartModalOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeCartModal();
    }

    if (event.key === "Tab") {
      const focusableElements = cartModalBackdrop.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  try {
    allProducts = await fetchProducts();
    renderCartDisplay();
  } catch (error) {
    if (itemsContainer) {
      itemsContainer.innerHTML = `<p class="error-msg" style="color: red; font-weight: bold;">Error loading cart details. Please try again.</p>`;
    }
  }

  if (window.location.pathname.endsWith("/cart.html") || window.location.pathname.endsWith("cart.html")) {
    openCartModal();
  }

  function renderCartDisplay() {
    updateCartCounter();
    const cartItems = getCart();

    if (cartItems.length === 0) {
      if (cartWorkspace) {
        cartWorkspace.classList.add("hidden");
      }
      if (emptyCartMsg) {
        emptyCartMsg.classList.remove("hidden");
      }
      if (confirmationMsg) {
        confirmationMsg.classList.add("hidden");
      }
      updateCartStatusMessage();
      return;
    }

    if (emptyCartMsg) {
      emptyCartMsg.classList.add("hidden");
    }
    if (confirmationMsg) {
      confirmationMsg.classList.add("hidden");
    }

    let grandTotal = 0;
    if (itemsContainer) {
      itemsContainer.innerHTML = "";
    }

    cartItems.forEach((cartItem) => {
      const product = allProducts.find((p) => p.id === cartItem.id);

      if (product && itemsContainer) {
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
              <button class="quantity-btn" data-id="${product.id}" data-action="decrease" aria-label="Decrease quantity for ${product.name}">−</button>
              <span class="quantity-value">${cartItem.quantity}</span>
              <button class="quantity-btn" data-id="${product.id}" data-action="increase" aria-label="Increase quantity for ${product.name}">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
            <button class="remove-btn" data-id="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
          </div>
        `;
        itemsContainer.appendChild(itemEl);
      }
    });

    if (totalPriceDisplay) {
      totalPriceDisplay.textContent = `$${grandTotal.toFixed(2)}`;
    }

    if (cartWorkspace) {
      cartWorkspace.classList.remove("hidden");
    }

    const removeButtons = document.querySelectorAll(".remove-btn");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const productId = event.target.getAttribute("data-id");
        const itemElement = event.target.closest(".cart-item");

        if (itemElement) {
          itemElement.classList.add("item-removing");
        }

        setTimeout(() => {
          removeFromCart(productId);
          renderCartDisplay();
        }, 300);
      });
    });

    shouldAnimateCartItems = false;

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

    updateCartStatusMessage();
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameInput = document.getElementById("user-name");
      const emailInput = document.getElementById("user-email");
      const addressInput = document.getElementById("user-address");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const nameError = document.getElementById("name-error");
      const emailError = document.getElementById("email-error");
      const addressError = document.getElementById("address-error");

      [nameInput, emailInput, addressInput].forEach((el) => {
        el.style.borderColor = "";
        el.setAttribute("aria-invalid", "false");
      });
      [nameError, emailError, addressError].forEach((el) => {
        if (el) el.textContent = "";
      });

      let isValid = true;
      const trimmedName = nameInput.value.trim();
      const trimmedAddress = addressInput.value.trim();

      if (trimmedName.length < 2 || trimmedName.length > 50) {
        nameInput.style.borderColor = "red";
        nameInput.setAttribute("aria-invalid", "true");
        if (nameError) nameError.textContent = "Name must be between 2 and 50 characters.";
        isValid = false;
      } else if (!trimmedName) {
        nameInput.style.borderColor = "red";
        nameInput.setAttribute("aria-invalid", "true");
        if (nameError) nameError.textContent = "Please enter your full name.";
        isValid = false;
      }
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.style.borderColor = "red";
        emailInput.setAttribute("aria-invalid", "true");
        if (emailError) emailError.textContent = "Please enter a valid email address.";
        isValid = false;
      }
      if (trimmedAddress.length < 2 || trimmedAddress.length > 50) {
        addressInput.style.borderColor = "red";
        addressInput.setAttribute("aria-invalid", "true");
        if (addressError) addressError.textContent = "Address must be between 2 and 50 characters.";
        isValid = false;
      } else if (!trimmedAddress) {
        addressInput.style.borderColor = "red";
        addressInput.setAttribute("aria-invalid", "true");
        if (addressError) addressError.textContent = "Please enter a shipping address.";
        isValid = false;
      }

      if (!isValid) return;

      clearCart();

      if (cartWorkspace) {
        cartWorkspace.classList.add("hidden");
      }

      if (confirmationMsg) {
        confirmationMsg.innerHTML = `
          <h2>🏕️ Order Confirmed!</h2>
          <p>Thank you for gearing up with us, <strong>${escapeHTML(nameInput.value)}</strong>.</p>
          <p>Your receipt has been sent to ${escapeHTML(emailInput.value)}.</p>
          <p>We will ship your items to: <br><em>${escapeHTML(addressInput.value)}</em></p>
          <a href="index.html" class="btn" style="display:inline-block; margin-top:1.5rem; max-width: 250px;">Return to Catalog</a>
        `;
        confirmationMsg.classList.remove("hidden");
      }

      updateCartCounter();
      updateCartStatusMessage();
    });
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
