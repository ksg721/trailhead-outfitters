import { fetchProducts } from './data.js';
import { renderProductGrid, renderErrorMessage } from './render.js';
import { getOrderCount } from './storage.js'; // Import our new storage module

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('product-list-container');
  const counterDisplay = document.getElementById('order-counter');

  // Dynamically update your persistent storage banner text smoothly
  const orderCount = getOrderCount();
  if (counterDisplay) {
    counterDisplay.textContent = `You have placed ${orderCount} order${orderCount === 1 ? '' : 's'}`;
  }

  // Fetch and display dynamic list
  try {
    const products = await fetchProducts();
    renderProductGrid(products, container);
  } catch (error) {
    renderErrorMessage(container, "We encountered an issue loading our catalog. Please try again later.");
  }
});