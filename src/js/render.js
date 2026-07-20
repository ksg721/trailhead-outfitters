import { addToCart } from "../js/storage.js";
import { syncCartCounter } from "./cart.js";

/**
 * Renders product cards into the listing container.
 * @param {Array} products - List of products to display.
 * @param {HTMLElement} container - The wrapper element to insert HTML into.
 */
export function renderProductGrid(products, container) {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products found matching your criteria.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("article");
    card.classList.add("product-card");

    card.innerHTML = `
      <a href="product-detail.html?id=${product.id}" class="card-link-wrapper" aria-label="View details for ${product.name}">
        <div class="product-image" style="background-image: url('${product.image}'), linear-gradient(135deg, #edf5ef 0%, #dce9df 100%); background-size: cover; background-position: center;"></div>
      </a>
      <div class="product-details">
        <h3>
          <a href="product-detail.html?id=${product.id}">${product.name}</a>
        </h3>
        <p>Category: <span style="color: var(--primary); font-weight: bold;">${product.category}</span></p>
        <p class="price">$${product.price.toFixed(2)}</p>
        <div class="card-actions">
          <a href="product-detail.html?id=${product.id}" class="order-now-btn" aria-label="View details for ${product.name}">Details</a>
          <button type="button" class="order-now-btn add-to-cart-btn" data-id="${product.id}">Order Now</button>
        </div>
      </div>
    `;

    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    const cartCounterDisplay = document.getElementById("cart-counter");

    addToCartBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      addToCart(product.id);
      syncCartCounter();

      if (cartCounterDisplay) {
        cartCounterDisplay.classList.remove("counter-pop");
        void cartCounterDisplay.offsetWidth;
        cartCounterDisplay.classList.add("counter-pop");
      }

      addToCartBtn.textContent = "✓ Added to Cart!";
      addToCartBtn.style.backgroundColor = "var(--primary)";
      setTimeout(() => {
        addToCartBtn.textContent = "Order Now";
        addToCartBtn.style.backgroundColor = "var(--primary)";
      }, 2000);
    });

    container.appendChild(card);
  });
}

/**
 * Renders an error message inside a container if fetching fails.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function renderErrorMessage(container, message) {
  container.innerHTML = `<p class="error-msg" style="color: var(--error-color, red); font-weight: bold;">${message}</p>`;
}
