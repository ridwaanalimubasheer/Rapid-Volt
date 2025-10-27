// Shared JS for RapidVolt multi-page site

// -------------------- Products (read dynamically from HTML) --------------------
let PRODUCTS = [];

// If HTML defines product elements, extract them
document.querySelectorAll('.product').forEach((el, idx) => {
  const name = el.dataset.name || `Product ${idx + 1}`;
  const desc = el.dataset.desc || '';
  const price = parseFloat(el.dataset.price || 0);
  const img = el.dataset.img || '';
  PRODUCTS.push({
    id: 'p' + (idx + 1),
    title: name,
    desc,
    price,
    img
  });
});

// Fallback default (if no HTML products found)
if (PRODUCTS.length === 0) {
  PRODUCTS = [
    { id: 'p1', title: 'Schneider Lighting Control System', price: 1299.00, desc: 'Integrated lighting control.' },
    { id: 'p2', title: 'Standalone Motion Sensor', price: 89.00, desc: 'PIR motion sensor.' },
    { id: 'p3', title: 'Schneider Wiring Accessories', price: 29.50, desc: 'Switches and plates.' },
    { id: 'p4', title: 'Wiring Devices Master Catalogue', price: 15.00, desc: 'Comprehensive catalogue.' },
    { id: 'p5', title: 'Exclusive Timeless & Traditional', price: 49.99, desc: 'Designer series.' },
    { id: 'p6', title: 'Affle Plus', price: 19.99, desc: 'Auxiliary parts.' },
    { id: 'p7', title: 'Isolators', price: 39.99, desc: 'Circuit isolators.' },
    { id: 'p8', title: 'Isoline Enclosed Switches', price: 79.00, desc: 'Weatherproof switches.' },
    { id: 'p9', title: 'ESYLUX Motion', price: 99.00, desc: 'High quality sensor.' }
  ];
}

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

function getTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

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

// -------------------- Product Rendering --------------------
const productsEl = document.getElementById('products');
if (productsEl) {
  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      ${p.img ? `<img src="${p.img}" alt="${p.title}" class="product-img">` : ''}
      <h4>${p.title}</h4>
      <p class='desc'>${p.desc}</p>
      <div class='price'>AED ${p.price.toFixed(2)}</div>
      <div class='actions'>
        <button data-id='${p.id}' class='btn add-to-cart'>Add to cart</button>
      </div>`;
    productsEl.appendChild(card);
  });
}

// -------------------- Delegated Clicks --------------------
document.addEventListener('click', (e) => {
  if (e.target.matches('.add-to-cart')) addToCart(e.target.dataset.id);
  if (e.target.matches('.qty')) changeQty(e.target.dataset.id, Number(e.target.dataset.delta));
  if (e.target.matches('.remove')) removeFromCart(e.target.dataset.id);
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

// -------------------- Chatbot with email on inactivity --------------------
const chatbot = document.getElementById('chatbot');
if (chatbot) {
  const toggleBtn = document.getElementById('chatbot-toggle');
  const closeBtn = document.getElementById('chat-close');
  const chatBody = document.getElementById('chat-body');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      sendChatTranscript();
      chatbot.style.display = 'none';
      chatBody.innerHTML = '';
    }, 7 * 60 * 1000);
  }

  function addMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = sender === 'user' ? 'user-msg' : 'bot-msg';
    msgEl.textContent = text;
    chatBody.appendChild(msgEl);
    chatBody.scrollTop = chatBody.scrollHeight;
    resetInactivityTimer();
  }

  toggleBtn.addEventListener('click', () => {
    chatbot.style.display = 'flex';
    resetInactivityTimer();
  });
  closeBtn.addEventListener('click', () => chatbot.style.display = 'none');

  // -------------------- Levenshtein Distance --------------------
  function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
      }
    }
    return matrix[a.length][b.length];
  }

  function findClosestProduct(input) {
    const clean = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    let best = null;
    let minDist = Infinity;
    PRODUCTS.forEach(p => {
      const title = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dist = levenshtein(clean, title);
      const similarity = 1 - dist / Math.max(clean.length, title.length);
      if (similarity > 0.4 && dist < minDist) {
        minDist = dist;
        best = p;
      }
    });
    return best;
  }

  // -------------------- Email Chat Transcript --------------------
  function sendChatTranscript() {
    if (!chatBody || chatBody.children.length === 0) return;

    let transcript = "";
    Array.from(chatBody.children).forEach(c => {
      transcript += `${c.className === 'user-msg' ? 'User' : 'Bot'}: ${c.textContent}\n`;
    });

    if (window.emailjs) {
      emailjs.send('service_k55dmgp', 'template_ny6vz8a', {
        to_email: 'rapidvoltshop@gmail.com',
        customer_name: 'Website Chat User',
        customer_email: 'Not provided',
        order_details: transcript,
        order_total: 'Chat Transcript',
        website_desc: 'Smart electrical & power solutions — supply, control and automation.'
      }).then(() => console.log('Chat transcript sent via email'))
        .catch(err => console.error('Failed to send chat transcript:', err));
    }
  }

  // -------------------- Chat Form --------------------
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    addMessage(userMessage, 'user');
    chatInput.value = '';

    let response = "Hi! How can we help you today?";
    const msg = userMessage.toLowerCase();

    const matchedProduct = findClosestProduct(msg);
    if (matchedProduct) {
      response = `${matchedProduct.title} costs AED ${matchedProduct.price.toFixed(2)}.`;
    } else if (msg.includes('price')) {
      response = "Please mention the product name so I can tell you the price.";
    } else if (msg.includes('contact')) {
      response = "You can contact us at rapidvoltshop@gmail.com or +971 555 778 653.";
    } else if (msg.includes('hello') || msg.includes('hi')) {
      response = "Hello! Welcome to RapidVolt. How can I assist you today?";
    } else if (msg.includes('product')) {
      response = "We supply smart electrical & power solutions — supply, control and automation.";
    }

    addMessage(response, 'bot');
  });

  chatInput.addEventListener('keydown', resetInactivityTimer);
}
