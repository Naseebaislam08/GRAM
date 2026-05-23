// Mini Marketplace & E-commerce Controller (marketplace.js)

document.addEventListener("DOMContentLoaded", () => {
  const marketSearch = document.getElementById("market-search");
  const categoryPills = document.getElementById("category-pills");
  const marketProductGrid = document.getElementById("market-product-grid");

  // Product modal
  const productModal = document.getElementById("product-modal");
  const modalProductDetails = document.getElementById("modal-product-details");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // Cart drawer
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const cartDrawerBackdrop = document.getElementById("cart-drawer-backdrop");
  const cartDrawer = document.getElementById("cart-drawer");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartSummaryContainer = document.getElementById("cart-summary-container");
  const cartBadgeCount = document.getElementById("cart-badge-count");

  // Checkout modal
  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutAddress = document.getElementById("checkout-address");
  const checkoutPayment = document.getElementById("checkout-payment");
  const checkoutSubtotal = document.getElementById("checkout-subtotal");
  const checkoutTotal = document.getElementById("checkout-total");
  const cancelCheckoutBtn = document.getElementById("cancel-checkout-btn");

  // Receipt modal
  const receiptModal = document.getElementById("receipt-modal");
  const receiptOrderId = document.getElementById("receipt-order-id");
  const receiptPaymentType = document.getElementById("receipt-payment-type");
  const receiptAddress = document.getElementById("receipt-address");
  const closeReceiptBtn = document.getElementById("close-receipt-btn");

  let currentCategory = "all";
  let currentSearchQuery = "";

  // 1. Catalog Populate
  function populateProductCatalog() {
    marketProductGrid.innerHTML = "";
    const products = window.GramCareDB.queryProducts(currentSearchQuery, currentCategory);

    if (products.length === 0) {
      marketProductGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding:40px;">
          No matching agricultural treatments found. Try adjusting filters or search query.
        </div>
      `;
      return;
    }

    products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-img-container">
          <img src="${p.image}" class="product-img" alt="${p.name}">
          <span class="product-tag">${p.category}</span>
        </div>
        <div class="product-body">
          <h3 class="product-title">${p.name}</h3>
          <div class="product-rating-row">
            <svg class="star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span>${p.rating} (${p.reviewsCount} reviews)</span>
          </div>
          <p class="product-desc">${p.description}</p>
          <div class="product-footer">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary details-btn" style="padding:8px 12px; font-size:12px;">Details</button>
              <button class="btn btn-primary buy-btn" style="padding:8px 12px; font-size:12px;">Buy</button>
            </div>
          </div>
        </div>
      `;

      // Details click handler
      card.querySelector(".details-btn").addEventListener("click", () => {
        openProductDetails(p.id);
      });

      // Quick add-to-cart handler
      card.querySelector(".buy-btn").addEventListener("click", () => {
        window.GramCareDB.addToCart(p.id);
        updateCartBadge();
        showToast(`Added ${p.name} to cart!`, "success");
      });

      marketProductGrid.appendChild(card);
    });
  }

  // 2. Search & Category Filters
  marketSearch.addEventListener("keyup", (e) => {
    currentSearchQuery = e.target.value;
    populateProductCatalog();
  });

  categoryPills.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-pill")) {
      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      e.target.classList.add("active");
      currentCategory = e.target.dataset.category;
      populateProductCatalog();
    }
  });

  // 3. Product Details Modal Controller
  function openProductDetails(id) {
    const p = window.GramCareDB.getProductById(id);
    if (!p) return;

    modalProductDetails.innerHTML = `
      <div style="display:flex; gap:20px; flex-direction:column; margin-top:10px;">
        <div style="height:200px; border-radius:12px; overflow:hidden; border:1px solid var(--border-glass);">
          <img src="${p.image}" style="width:100%; height:100%; object-fit:cover;" alt="${p.name}">
        </div>
        <div>
          <span style="font-size:11px; text-transform:uppercase; color:var(--accent-mint); font-weight:600;">${p.category}</span>
          <h2 style="font-size:22px; margin-top:4px;">${p.name}</h2>
          <div class="product-rating-row" style="margin-top:6px;">
            <svg class="star-icon" viewBox="0 0 24 24" style="width:16px; height:16px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span>${p.rating} (${p.reviewsCount} reviews)</span>
          </div>
        </div>
        <div>
          <strong style="font-size:13px; color:var(--text-main); display:block; margin-bottom:4px;">Description:</strong>
          <p style="font-size:13px; color:var(--text-muted); line-height:1.6;">${p.description}</p>
        </div>
        <div>
          <strong style="font-size:13px; color:var(--text-main); display:block; margin-bottom:4px;">Application Guidelines:</strong>
          <p style="font-size:13px; color:var(--text-muted); line-height:1.6; font-style:italic;">${p.application}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-glass); padding-top:20px; margin-top:10px;">
          <span style="font-size:24px; font-weight:700; color:var(--text-main); font-family:var(--font-heading);">$${p.price.toFixed(2)}</span>
          <button class="btn btn-primary add-to-cart-modal" style="padding:10px 20px;">Add to Cart</button>
        </div>
      </div>
    `;

    // Modal Add To Cart button event
    modalProductDetails.querySelector(".add-to-cart-modal").addEventListener("click", () => {
      window.GramCareDB.addToCart(p.id);
      updateCartBadge();
      productModal.style.display = "none";
      showToast(`Added ${p.name} to cart!`, "success");
    });

    productModal.style.display = "flex";
  }

  // Close modal
  closeModalBtn.addEventListener("click", () => {
    productModal.style.display = "none";
  });

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) productModal.style.display = "none";
  });

  // 4. Cart Drawer Logic
  function updateCartBadge() {
    const cart = window.GramCareDB.getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadgeCount.innerText = totalCount;
    cartBadgeCount.style.display = totalCount > 0 ? "flex" : "none";
  }

  function renderCartDrawer() {
    cartItemsContainer.innerHTML = "";
    const cart = window.GramCareDB.getCart();

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted); gap:12px; padding:40px 0;">
          <svg style="width:60px; height:60px; fill:var(--text-muted); opacity:0.3;" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          <span style="font-size:14px;">Your cart is empty.</span>
        </div>
      `;
      cartSummaryContainer.innerHTML = "";
      return;
    }

    let subtotal = 0;
    cart.forEach(item => {
      const p = window.GramCareDB.getProductById(item.productId);
      if (p) {
        subtotal += p.price * item.quantity;
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
          <div class="cart-item-details">
            <img class="cart-item-img" src="${p.image}" alt="${p.name}">
            <div class="cart-item-meta">
              <span class="cart-item-name">${p.name}</span>
              <span class="cart-item-price">$${p.price.toFixed(2)}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="qty-control">
              <button class="qty-btn dec-qty">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn inc-qty">+</button>
            </div>
            <button class="btn btn-danger remove-item" style="padding:6px; border-radius:8px;">
              <svg style="width:16px; height:16px; fill:currentColor;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        `;

        // Bind events
        row.querySelector(".inc-qty").addEventListener("click", () => {
          window.GramCareDB.updateCartQty(p.id, item.quantity + 1);
          renderCartDrawer();
          updateCartBadge();
        });

        row.querySelector(".dec-qty").addEventListener("click", () => {
          window.GramCareDB.updateCartQty(p.id, item.quantity - 1);
          renderCartDrawer();
          updateCartBadge();
        });

        row.querySelector(".remove-item").addEventListener("click", () => {
          window.GramCareDB.removeFromCart(p.id);
          renderCartDrawer();
          updateCartBadge();
          showToast("Removed product from cart", "success");
        });

        cartItemsContainer.appendChild(row);
      }
    });

    cartSummaryContainer.innerHTML = `
      <div class="summary-row">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping (Express)</span>
        <span style="color: var(--accent-mint); font-weight:600;">FREE</span>
      </div>
      <div class="summary-row total" style="margin-top:10px; border-top:1px solid var(--border-glass); padding-top:10px;">
        <span>Total Payable</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary" id="checkout-trigger-btn" style="width:100%; margin-top:15px; padding:14px;">Proceed to Checkout</button>
    `;

    // Proceed to checkout button listener
    document.getElementById("checkout-trigger-btn").addEventListener("click", () => {
      cartDrawerBackdrop.style.display = "none";
      openCheckout(subtotal);
    });
  }

  // Cart drawer visibility triggers
  cartToggleBtn.addEventListener("click", () => {
    renderCartDrawer();
    cartDrawerBackdrop.style.display = "flex";
  });

  closeCartBtn.addEventListener("click", () => {
    cartDrawerBackdrop.style.display = "none";
  });

  cartDrawerBackdrop.addEventListener("click", (e) => {
    if (e.target === cartDrawerBackdrop) cartDrawerBackdrop.style.display = "none";
  });

  // 5. Checkout Controller
  function openCheckout(subtotal) {
    checkoutSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    checkoutTotal.innerText = `$${subtotal.toFixed(2)}`;
    checkoutModal.style.display = "flex";
  }

  cancelCheckoutBtn.addEventListener("click", () => {
    checkoutModal.style.display = "none";
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const address = checkoutAddress.value.trim();
    const payment = checkoutPayment.value;
    const totalText = checkoutTotal.innerText;

    // Simulate ordering success
    checkoutModal.style.display = "none";
    
    // Clear shopping cart
    window.GramCareDB.clearCart();
    updateCartBadge();
    
    // Populate Receipt
    const randomOrderId = "ORD-" + Math.floor(10000000 + Math.random() * 90000000);
    receiptOrderId.innerText = randomOrderId;
    receiptPaymentType.innerText = payment;
    receiptAddress.innerText = address;
    
    // Reset Form
    checkoutForm.reset();
    
    receiptModal.style.display = "flex";
    showToast("Order placed successfully!", "success");
  });

  // Receipt Modal close trigger
  closeReceiptBtn.addEventListener("click", () => {
    receiptModal.style.display = "none";
    // Navigate back to marketplace view
    const marketNavItem = document.querySelector(`.nav-item[data-view="marketplace"]`);
    if (marketNavItem) marketNavItem.click();
  });

  // Expose updates for global access
  window.updateCartBadge = updateCartBadge;
  window.populateProductCatalog = populateProductCatalog;

  // Initial load
  populateProductCatalog();
  updateCartBadge();
});
