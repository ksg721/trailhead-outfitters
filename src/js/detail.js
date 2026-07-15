import { fetchProducts } from "./data.js";
import { trackRecentlyViewed, addToCart, getCartItemCount } from "./storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const cartCounterDisplay = document.getElementById("cart-counter");
  const detailContainer = document.getElementById("detail-view-container");

  // 1. Update the cart counter on page load
  updateCartCounter();

  // 2. Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    renderError("No product selected. Return to the homepage to browse gear.");
    return;
  }

  // 3. Fetch data and find product
  try {
    const products = await fetchProducts();
    const selectedProduct = products.find((item) => item.id === productId);

    if (!selectedProduct) {
      renderError(
        "The requested gear item could not be found in our current inventory.",
      );
      return;
    }

    // Update recently viewed history
    trackRecentlyViewed(selectedProduct.id);

    // Render the product and the new Add to Cart button
    renderProductDetail(selectedProduct);

    // 4. Attach event listener to the new Add to Cart button
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        addToCart(selectedProduct.id);
        updateCartCounter();

        // Provide user feedback
        addToCartBtn.textContent = "✓ Added to Cart!";
        addToCartBtn.style.backgroundColor = "var(--primary)";
        setTimeout(() => {
          addToCartBtn.textContent = "Add to Cart";
          addToCartBtn.style.backgroundColor = "var(--secondary)";
        }, 2000);
        // 4. Attach event listener to the new Add to Cart button
        const addToCartBtn = document.getElementById("add-to-cart-btn");
        if (addToCartBtn) {
          addToCartBtn.addEventListener("click", () => {
            addToCart(selectedProduct.id);
            updateCartCounter();

            // --- NEW: Trigger the visual 'pop' animation on the counter ---
            if (cartCounterDisplay) {
              cartCounterDisplay.classList.remove("counter-pop");
              void cartCounterDisplay.offsetWidth; // Force browser reflow to restart animation
              cartCounterDisplay.classList.add("counter-pop");
            }

            // Provide user feedback on the button itself
            addToCartBtn.textContent = "✓ Added to Cart!";
            addToCartBtn.style.backgroundColor = "var(--primary)";
            setTimeout(() => {
              addToCartBtn.textContent = "Add to Cart";
              addToCartBtn.style.backgroundColor = "var(--secondary)";
            }, 2000);
          });
        }
      });
    }
  } catch (error) {
    renderError(
      "Unable to fetch product profile settings. Check connection parameters.",
    );
  }

  // Helpers
  function updateCartCounter() {
    if (cartCounterDisplay) {
      const count = getCartItemCount();
      cartCounterDisplay.textContent = `🛒 Cart: ${count} item${count === 1 ? "" : "s"}`;
    }
  }

  function renderProductDetail(product) {
    detailContainer.innerHTML = `
      <div class="detail-container">
        <div class="detail-image-wrapper">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
        </div>
        <div class="detail-info">
          <span class="detail-category">${product.category}</span>
          <h1>${product.name}</h1>
          <p class="price">$${product.price.toFixed(2)}</p>
          <p class="detail-description">${product.description}</p>
          <button id="add-to-cart-btn" class="btn submit-btn" style="margin-top: 1.5rem;">Add to Cart</button>
        </div>
      </div>
    `;
  }

  function renderError(message) {
    detailContainer.innerHTML = `<p class="error-msg" style="color: var(--error-color, #ba3c2a); font-weight: bold; text-align: center;">${message}</p>`;
  }
});
