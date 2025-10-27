// Shared JS for RapidVolt multi-page site

// -------------------- Load Products --------------------
let PRODUCTS = [];

function loadProductsFromHTML() {
  const els = document.querySelectorAll('[data-product-id]');
  PRODUCTS = Array.from(els).map(el => ({
    id: el.dataset.productId,
    title: el.dataset.title || el.querySelector('h4')?.textContent || 'Untitled',
    price: parseFloat(el.dataset.price || el.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || 0),
    desc: el.dataset.desc || el.querySelector('.desc')?.textContent || ''
  }));
}

// -------------------- Highlight Product from URL --------------------
function highlightProductFromURL() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product'); // e.g., "lighting", "motion"
  if (!productId) return;

  const productsEl = document.getElementById('products');
  if (!productsEl) return;

  const productCard = Array.from(productsEl.children).find(c => c.dataset.id === productId);
  if (productCard) {
    productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    productCard.classList.add('highlight');
    setTimeout(() => productCard.classList.remove('highlight'), 4000); // highlight for 4s
  }
}

document.addEventListener('DOMContentLoaded', highlightProductFromURL);


document.addEventListener('DOMContentLoaded', loadProductsFromHTML);

// -------------------- Cart --------------------
let cart = JSON.parse(localStorage.getItem('rapidvolt_cart') || '[]');

function saveCart() {
  localStorage.setItem('rapidvolt_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id) {
  const item = cart.find(c => c.id === id);
  if (item) item.qty += 1;
  else {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) cart.push({ id: p.id, title: p.title, price: p.price, qty: 1 });
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const it = cart.find(c => c.id === id);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) removeFromCart(id);
  saveCart();
}

function getTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartUI() {
  const cartCountEls = document.querySelectorAll('#cart-count');
  cartCountEls.forEach(el => el.textContent = cart.reduce((s, i) => s + i.qty, 0));

  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
    cart.forEach(i => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="left">
          <strong>${i.title}</strong>
          <div>AED ${i.price.toFixed(2)} x ${i.qty}</div>
        </div>
        <div class="right">
          <button class="qty" data-id="${i.id}" data-delta="-1">-</button>
          <button class="qty" data-id="${i.id}" data-delta="1">+</button>
          <button class="remove" data-id="${i.id}">Remove</button>
        </div>`;
      cartItemsEl.appendChild(row);
    });
    const cartTotalEl = document.getElementById('cartTotal');
    if (cartTotalEl) cartTotalEl.textContent = 'AED ' + getTotal().toFixed(2);
  }
}

document.addEventListener('DOMContentLoaded', updateCartUI);

// -------------------- Menu --------------------
const menuToggle = document.getElementById('menuToggle');
const menuList = document.getElementById('menuList');
if (menuToggle && menuList) {
  let menuOpen = false;
  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuToggle.classList.toggle('open', menuOpen);
    menuList.classList.toggle('open', menuOpen);
  });
  document.addEventListener('click', (e) => {
    if (menuOpen && !menuList.contains(e.target) && !menuToggle.contains(e.target)) {
      menuOpen = false;
      menuToggle.classList.remove('open');
      menuList.classList.remove('open');
    }
  });
}

// At the end of your script.js, after PRODUCTS are rendered
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product'); // e.g., "lighting"
  if(productId){
    const target = document.querySelector(`.product-card[data-id="${productId}"]`);
    if(target){
      // Optional: scroll into view
      target.scrollIntoView({behavior: 'smooth', block: 'center'});
      // Optional: highlight it
      target.style.border = '2px solid #0a6cff';
      target.style.boxShadow = '0 4px 12px rgba(10,108,255,0.3)';
    }
  }
});


// -------------------- Highlight product from URL --------------------
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const highlightId = params.get('product');
  if (highlightId) {
    const target = document.querySelector(`[data-product-id="${highlightId}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('highlight');
      setTimeout(() => target.classList.remove('highlight'), 3000);
    }
  }
});

// -------------------- Delegated Clicks --------------------
document.addEventListener('click', (e) => {
  if (e.target.matches('.add-to-cart')) addToCart(e.target.dataset.id);
  if (e.target.matches('.qty')) changeQty(e.target.dataset.id, Number(e.target.dataset.delta));
  if (e.target.matches('.remove')) removeFromCart(e.target.dataset.id);

  const card = e.target.closest('[data-product-id]');
  if (card && !e.target.classList.contains('add-to-cart')) {
    window.location.href = `shop.html?product=${card.dataset.productId}`;
  }
});

// -------------------- Checkout --------------------
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm && window.emailjs) {
  emailjs.init('_svtAxKDEi0yLEz6Y');
  checkoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value || '';
    const address = document.getElementById('cust-address').value || '';
    const orderDetails = cart.map(i => `${i.title} x ${i.qty} - AED ${(i.price * i.qty).toFixed(2)}`).join('\n');
    const total = getTotal().toFixed(2);
    const templateParams = {
      to_email: 'rapidvoltshop@gmail.com',
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      order_details: orderDetails,
      order_total: 'AED ' + total,
      website_desc: "Smart electrical & power solutions — supply, control and automation."
    };
    const statusEl = document.getElementById('checkoutStatus');
    if (statusEl) statusEl.textContent = 'Sending order...';
    emailjs.send('service_k55dmgp', 'template_ny6vz8a', templateParams)
      .then(() => { if (statusEl) statusEl.textContent = '✅ Order placed!'; cart = []; saveCart(); })
      .catch(() => { if (statusEl) statusEl.textContent = '❌ Failed to send order.'; });
  });
}
