import { fetchProducts } from './data.js';
import { getOrderCount, incrementOrderCount, trackRecentlyViewed } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const counterDisplay = document.getElementById('order-counter');
  const detailContainer = document.getElementById('detail-view-container');
  const formSection = document.getElementById('order-form-container');
  const checkoutForm = document.getElementById('checkout-form');
  const confirmationMsg = document.getElementById('confirmation-msg');

  // 1. Maintain global storage order tracker count text
  updateOrderCounterDisplay();

  // 2. Parse out query parameter ID string from current window location URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    renderError("No product selected. Return to the homepage to browse gear.");
    return;
  }

  // Active product scoped object to map back into form submission metrics later
  let selectedProduct = null;

  // 3. Fetch data pool and isolate matching item details
  try {
    const products = await fetchProducts();
    selectedProduct = products.find(item => item.id === productId);

    if (!selectedProduct) {
      renderError("The requested gear item could not be found in our current inventory.");
      return;
    }

    // Append product tracking context into localStorage history log
    trackRecentlyViewed(selectedProduct.id);

    // Build template mapping directly to classes added in style.css update
    renderProductDetail(selectedProduct);

    // Unhide interactive checkout workspace layout container
    formSection.classList.remove('hidden');

  } catch (error) {
    renderError("Unable to fetch product profile settings. Check connection parameters.");
    return;
  }

  // 4. Client-side validation mechanics & Event Listeners
  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop default browser refresh cycle

    // Basic required input field target selection
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const addressInput = document.getElementById('user-address');
    const phoneInput = document.getElementById('user-phone');
    const messageInput = document.getElementById('user-message');

    // Email verification regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Wipe out legacy individual custom error highlights if present
    clearInputValidationState([nameInput, emailInput, addressInput]);

    let isValid = true;

    // Field evaluation loop
    if (!nameInput.value.trim()) {
      markInvalidField(nameInput, "Please input your full legal name.");
      isValid = false;
    }

    if (!emailRegex.test(emailInput.value.trim())) {
      markInvalidField(emailInput, "Please provide a correctly formatted email address.");
      isValid = false;
    }

    if (!addressInput.value.trim()) {
      markInvalidField(addressInput, "A structural physical delivery address is mandatory.");
      isValid = false;
    }

    // Halt logic cascade if errors trigger
    if (!isValid) return;

    // 5. Commit state change variables post successful form verification
    const newTotalCount = incrementOrderCount();
    updateOrderCounterDisplay();

    // Pivot layout panels by applying your target utility class
    formSection.classList.add('hidden');
    detailContainer.classList.add('hidden');

    // Render interactive checkout payload confirmation response
    confirmationMsg.innerHTML = `
      <h2>🏕️ Order Confirmed!</h2>
      <p>Thank you for ordering, <strong>${escapeHTML(nameInput.value)}</strong>.</p>
      <div style="background: #ffffff; padding: 1rem; border-radius: 8px; margin: 1rem 0; border: 1px solid #dce7df; text-align: left;">
        <p><strong>Item Secured:</strong> ${selectedProduct.name}</p>
        <p><strong>Total Charged:</strong> $${selectedProduct.price.toFixed(2)}</p>
        <p><strong>Shipping Details:</strong> ${escapeHTML(addressInput.value)}</p>
        ${phoneInput.value ? `<p><strong>Contact phone:</strong> ${escapeHTML(phoneInput.value)}</p>` : ''}
        ${messageInput.value ? `<p><strong>Note:</strong> ${escapeHTML(messageInput.value)}</p>` : ''}
      </div>
      <a href="index.html" class="btn" style="display:inline-block; margin-top:1.5rem; max-width: 250px;">Return to Catalog</a>
    `;
    confirmationMsg.classList.remove('hidden');
  });

  // Utility logic execution helpers
  function updateOrderCounterDisplay() {
    if (counterDisplay) {
      const currentCount = getOrderCount();
      counterDisplay.textContent = `You have placed ${currentCount} order${currentCount === 1 ? '' : 's'}`;
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
        </div>
      </div>
    `;
  }

  function renderError(message) {
    detailContainer.innerHTML = `<p class="error-msg" style="color: var(--error-color, #ba3c2a); font-weight: bold; text-align: center;">${message}</p>`;
    formSection.classList.add('hidden');
  }

  function markInvalidField(inputElement, alertMessage) {
    inputElement.style.borderColor = 'var(--error-color, #ba3c2a)';
    inputElement.placeholder = alertMessage;
    inputElement.focus();
  }

  function clearInputValidationState(elementsArray) {
    elementsArray.forEach(el => {
      el.style.borderColor = '';
    });
  }

  // Cross-site Scripting prevention mitigation tool
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});