/**
 * Storage Utility Module
 * Manages all persistent state interaction via localStorage.
 */

const ORDER_COUNT_KEY = 'totalOrders';
const RECENTLY_VIEWED_KEY = 'recentlyViewed';

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
    items = items.filter(id => id !== productId);

    // Add the item to the front of the list
    items.unshift(productId);

    // Restrict the history array to the last 4 items
    if (items.length > 4) {
      items.pop();
    }

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to update recently viewed items in localStorage:", error);
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