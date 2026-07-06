/**
 * Renders product cards into the listing container.
 * @param {Array} products - List of products to display.
 * @param {HTMLElement} container - The wrapper element to insert HTML into.
 */
export function renderProductGrid(products, container) {
  // Clear loading message or existing items
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>No products found matching your criteria.</p>";
    return;
  }

  products.forEach((product) => {
    // Build the dynamic card article structure
    const card = document.createElement("article");
    card.classList.add("product-card");

    // Make the card clickable and add a structured "Order Now" button
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
        <button type="button" class="order-now-btn" data-id="${product.id}">Order Now</button>
      </div>
    `;

    // Event listener for the "Order Now" button to take them directly to the form page
    const orderBtn = card.querySelector(".order-now-btn");
    orderBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent duplicate trigger behaviors
      window.location.href = `product-detail.html?id=${product.id}`;
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
