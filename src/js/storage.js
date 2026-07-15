/**
 * Storage Utility Module
 * Manages all persistent state interaction via localStorage.
 */

const ORDER_COUNT_KEY = "totalOrders";
const RECENTLY_VIEWED_KEY = "recentlyViewed";

/**
 * Retrieves the total number of orders placed.
 * @returns {number} The count of orders.
 */
export function getOrderCount() {
  const count = localStorage.getItem(ORDER_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increments the order tracker count by 1 and updates localStorage.
 * @returns {number} The newly updated order count.
 */
export function incrementOrderCount() {
  const currentCount = getOrderCount();
  const newCount = currentCount + 1;
  localStorage.setItem(ORDER_COUNT_KEY, newCount);
  return newCount;
}

/**
 * Adds a product ID to a "recently viewed" queue in localStorage.
 * Keeps track of up to the 4 most unique recent items.
 * @param {string} productId
 */
export function trackRecentlyViewed(productId) {
  try {
    let recent = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let items = recent ? JSON.parse(recent) : [];

    // Remove the item if it already exists to avoid duplicates
    items = items.filter((id) => id !== productId);

    // Add the item to the front of the list
    items.unshift(productId);

    // Restrict the history array to the last 4 items
    if (items.length > 4) {
      items.pop();
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error(
      "Failed to update recently viewed items in localStorage:",
      error,
    );
  }
}

/**
 * Retrieves the array of recently viewed product IDs.
 * @returns {Array<string>} List of product IDs.
 */
export function getRecentlyViewed() {
  try {
    const recent = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return recent ? JSON.parse(recent) : [];
  } catch (error) {
    return [];
  }
}

/* ==========================================================================
   Multi-Item Cart System Methods
   ========================================================================== */
const CART_KEY = "shoppingCart";

/**
 * Retrieves the current cart array from localStorage.
 * @returns {Array} Array of cart item objects { id, quantity }.
 */
export function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Adds a product to the cart or increments its quantity if it already exists.
 * @param {string} productId
 */
export function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1; // Increase quantity if already in cart
  } else {
    cart.push({ id: productId, quantity: 1 }); // Add new item
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Calculates the total number of individual items currently in the cart.
 * @returns {number} Total item count.
 */
export function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Empties the shopping cart entirely.
 */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

/**
 * Removes a specific product completely from the cart.
 * @param {string} productId
 */
export function removeFromCart(productId) {
  let cart = getCart();
  // Filter out the item that matches the ID we want to remove
  cart = cart.filter((item) => item.id !== productId);
  // Save the new array back to local storage
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
