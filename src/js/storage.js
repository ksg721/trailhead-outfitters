/**
 * Storage Utility Module
 * Manages all persistent state interaction via localStorage.
 */

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
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Updates the quantity for a specific cart item.
 * Removes the item if the quantity is less than or equal to zero.
 * @param {string} productId
 * @param {number} quantity
 */
export function updateCartQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity = quantity;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
