document.addEventListener('DOMContentLoaded', () => {
  const products = [
    {
      id: 'games',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b7738?auto=format&fit=crop&w=800&q=80',
      price: 1500
    },
    {
      id: 'apps',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
      price: 2000
    },
    {
      id: 'bots',
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
      price: 300
    },
    {
      id: 'sites',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      price: 800
    }
  ];

  let cart = [];
  console.log('App loaded and ready!');

  const productsGrid = document.getElementById('productsGrid');
  const cartBtn = document.getElementById('cartBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartModal = document.getElementById('cartModal');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const toast = document.getElementById('toast');

  // Initialize Telegram Web App if available
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand(); // Expand to full screen
  }

  // Render products
  function renderProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
      // Create translation keys dynamically
      const titleKey = `products.${product.id}.title`;
      const descKey = `products.${product.id}.desc`;
      
      const card = document.createElement('div');
      card.className = 'product-card bg-tg-card rounded-2xl overflow-hidden border border-white/5 flex flex-col';
      
      card.innerHTML = `
        <div class="h-48 overflow-hidden relative">
          <img src="${product.image}" alt="${product.id}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-tg-card to-transparent"></div>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <h3 class="text-xl font-bold text-white mb-2" data-i18n="${titleKey}"></h3>
          <p class="text-tg-hint text-sm flex-1 mb-4" data-i18n="${descKey}"></p>
          <div class="flex items-center justify-between mt-auto">
            <span class="text-lg font-bold text-white" data-i18n="app.price_from"></span>
            <button class="add-to-cart-btn bg-white/10 hover:bg-tg-primary hover:text-white text-tg-primary font-semibold py-2 px-4 rounded-xl transition-colors flex items-center gap-2" data-id="${product.id}">
              <i class="fa-solid fa-plus text-sm"></i>
              <span data-i18n="app.add_to_cart"></span>
            </button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    updateDynamicTranslations();
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  // Update dynamic translations explicitly
  function updateDynamicTranslations() {
    if (!window.miniappI18n) return;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      
      // Special case for price with placeholder
      if (key === 'app.price_from') {
        const productId = el.closest('.product-card').querySelector('.add-to-cart-btn').getAttribute('data-id');
        const prod = products.find(p => p.id === productId);
        if (prod) {
          el.textContent = window.miniappI18n.t(key, { price: prod.price });
        }
      } else {
        el.textContent = window.miniappI18n.t(key);
      }
    });
  }

  // Add to cart
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCartBadge();
    showToast(window.miniappI18n ? window.miniappI18n.t('app.added') : 'Added to cart');
  }

  // Update badge
  function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    if (totalItems > 0) {
      cartBadge.classList.remove('scale-0');
      cartBadge.classList.add('scale-100');
    } else {
      cartBadge.classList.remove('scale-100');
      cartBadge.classList.add('scale-0');
    }
  }

  // Render cart items
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-10 text-tg-hint">
          <i class="fa-solid fa-basket-shopping text-5xl mb-4 opacity-50"></i>
          <p>${window.miniappI18n ? window.miniappI18n.t('app.empty_cart') : 'Cart is empty'}</p>
        </div>
      `;
      cartTotal.textContent = '$0';
      return;
    }

    let total = 0;
    
    cart.forEach(item => {
      total += item.price * item.quantity;
      
      const title = window.miniappI18n ? window.miniappI18n.t(`products.${item.id}.title`) : item.id;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5';
      itemEl.innerHTML = `
        <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover" alt="${title}">
        <div class="flex-1">
          <h4 class="text-white font-semibold text-sm line-clamp-1">${title}</h4>
          <p class="text-tg-primary font-bold mt-1">$${item.price}</p>
        </div>
        <div class="flex items-center gap-3 bg-tg-bg rounded-lg p-1">
          <button class="w-8 h-8 flex items-center justify-center text-tg-hint hover:text-white transition-colors qty-btn" data-action="minus" data-id="${item.id}">
            <i class="fa-solid fa-minus text-xs"></i>
          </button>
          <span class="w-4 text-center text-sm font-bold">${item.quantity}</span>
          <button class="w-8 h-8 flex items-center justify-center text-tg-hint hover:text-white transition-colors qty-btn" data-action="plus" data-id="${item.id}">
            <i class="fa-solid fa-plus text-xs"></i>
          </button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotal.textContent = `$${total.toLocaleString()}`;
    
    // Add quantity listeners
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const id = e.currentTarget.getAttribute('data-id');
        updateQuantity(id, action);
      });
    });
  }

  // Update quantity
  function updateQuantity(productId, action) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      if (action === 'plus') {
        cart[itemIndex].quantity += 1;
      } else if (action === 'minus') {
        cart[itemIndex].quantity -= 1;
        if (cart[itemIndex].quantity <= 0) {
          cart.splice(itemIndex, 1);
        }
      }
      updateCartBadge();
      renderCart();
    }
  }

  // Show Toast
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', 'translate-y-4');
    }, 2000);
  }

  // Event Listeners for Modal
  cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.classList.add('modal-open');
    document.body.classList.add('no-scroll');
  });

  closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('modal-open');
    document.body.classList.remove('no-scroll');
  });

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('modal-open');
      document.body.classList.remove('no-scroll');
    }
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    // Формируем текст заказа для отправки в Telegram
    let orderText = "🛒 *Новый заказ!*\\n\\n";
    cart.forEach((item, index) => {
      const title = window.miniappI18n ? window.miniappI18n.t(`products.${item.id}.title`) : item.id;
      orderText += `${index + 1}. ${title} x${item.quantity} — $${item.price * item.quantity}\\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderText += `\\n💰 *Итого: $${total}*`;

    // Замените YOUR_USERNAME на юзернейм того, кто будет принимать заказы (БЕЗ @)
    const managerUsername = 'YOUR_USERNAME'; 
    const telegramUrl = `https://t.me/${managerUsername}?text=${encodeURIComponent(orderText)}`;

    // Перенаправляем пользователя в чат с готовым сообщением
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
      window.Telegram.WebApp.openTelegramLink(telegramUrl);
    } else {
      window.open(telegramUrl, '_blank');
    }

    showToast(window.miniappI18n ? window.miniappI18n.t('app.checkout_success') : 'Order completed!');
    cart = [];
    updateCartBadge();
    
    setTimeout(() => {
      cartModal.classList.remove('modal-open');
      document.body.classList.remove('no-scroll');
    }, 1500);
  });

  // ==========================================
  // App Initialization & Standalone Polyfill
  // ==========================================
  async function initApp() {
    // Если скрипта переводов нет (например, выгрузили на GitHub Pages)
    if (!window.miniappI18n) {
      console.log('Running standalone (e.g. GitHub Pages). Loading locales manually...');
      try {
        const response = await fetch('./locales/ru.json');
        const localesData = await response.json();
        
        // Создаем свой собственный обработчик переводов
        window.miniappI18n = {
          t: (key, params = {}) => {
            const keys = key.split('.');
            let val = localesData;
            
            // Ищем строку по ключу (например "app.title" -> localesData.app.title)
            for (const k of keys) {
              if (val === undefined || val[k] === undefined) return key;
              val = val[k];
            }
            
            let text = val;
            // Подставляем переменные, например ${price} или {price}
            Object.keys(params).forEach(p => {
              text = text.replace(new RegExp(`\\$\\{${p}\\}|\\{${p}\\}`, 'g'), params[p]);
            });
            
            return text;
          }
        };
      } catch (err) {
        console.error('Failed to load locales/ru.json:', err);
        // Заглушка, чтобы код не упал с ошибкой
        window.miniappI18n = { t: (key) => key };
      }
    }
    
    // После загрузки системы перевода — отрисовываем продукты
    renderProducts();
  }

  // Запуск приложения
  initApp();
});
