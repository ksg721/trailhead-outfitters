import { fetchProducts } from "./data.js";
import { renderProductGrid, renderErrorMessage } from "./render.js";
// 1. Swap the old getOrderCount for the new getCartItemCount
import { getCartItemCount } from "./storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("product-list-container");

  // 2. Target the new cart-counter ID you added to your HTML
  const cartCounterDisplay = document.getElementById("cart-counter");

  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");

  let allProducts = [];

  // 3. Update the persistent cart banner using the new cart math
  if (cartCounterDisplay) {
    const count = getCartItemCount();
    cartCounterDisplay.textContent = `🛒 Cart: ${count} item${count === 1 ? "" : "s"}`;
  }

  // Fetch data, save to global array, and initial render
  try {
    allProducts = await fetchProducts();
    renderProductGrid(allProducts, container);
  } catch (error) {
    renderErrorMessage(
      container,
      "We encountered an issue loading our catalog. Please try again later.",
    );
    return;
  }

  // ------------------------------------------------------------------------
  // Filter & Search Logic
  // ------------------------------------------------------------------------
  function handleFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    renderProductGrid(filteredProducts, container);
  }

  if (searchInput && categoryFilter) {
    searchInput.addEventListener("input", handleFilters);
    categoryFilter.addEventListener("change", handleFilters);
  }
});
