/**
 * Fetches product data from the local JSON file.
 * @param {string} jsonPath - Path to the products.json file.
 * @returns {Promise<Array>} Array of product objects.
 */
export async function fetchProducts(jsonPath = "/products.json") {
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading product data:", error);
    throw error;
  }
}
