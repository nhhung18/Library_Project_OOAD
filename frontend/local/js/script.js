// Utility function: Safe element selector
const getElement = (selector) => {
  const el = document.querySelector(selector);
  if (!el) console.warn(`Element not found: ${selector}`);
  return el;
};

// Books Database
const booksDatabase = [
  {
    id: 1,
    name: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    category: "Kỹ năng sống",
    price: 15.99,
    originalPrice: 20.99,
    qty: 12,
    image: "image/book/dacnhantam.jpg",
    description: "Đây là cuốn sách nổi tiếng nhất về nghệ thuật giao tiếp và thu phục lòng người. Không chỉ là nghệ thuật thu phục lòng người, mà còn mang lại góc nhìn, suy nghĩ sâu sắc về việc giao tiếp ứng xử.",
    rating: 4.5,
    reviews: 120
  },
  {
    id: 2,
    name: "Nhà Giả Kim",
    author: "Paulo Coelho",
    category: "Văn học",
    price: 12.99,
    originalPrice: 18.99,
    qty: 8,
    image: "image/book/lanhdaokhongoan.jpg",
    description: "Một cuốn tiểu thuyết về hành trình tìm kiếm ước mơ của một chàng trai trẻ.",
    rating: 4.8,
    reviews: 95
  },
  {
    id: 3,
    name: "Cha Giàu Cha Nghèo",
    author: "Robert Kiyosaki",
    category: "Kinh tế",
    price: 14.99,
    originalPrice: 22.99,
    qty: 15,
    image: "image/book/tu-duy-lam-giau.jpg",
    description: "Cuốn sách về tài chính cá nhân và cách xây dựng tài sản.",
    rating: 4.7,
    reviews: 200
  },
  {
    id: 4,
    name: "Clean Code",
    author: "Robert C. Martin",
    category: "Công nghệ",
    price: 24.99,
    originalPrice: 32.99,
    qty: 5,
    image: "image/book/nghilondethanhcong.jpg",
    description: "Hướng dẫn viết code sạch và chuyên nghiệp cho lập trình viên.",
    rating: 4.9,
    reviews: 180
  },
  {
    id: 5,
    name: "Sapiens",
    author: "Yuval Noah Harari",
    category: "Lịch sử",
    price: 18.99,
    originalPrice: 26.99,
    qty: 7,
    image: "image/book/biquyettruongtho.png",
    description: "Một bộ sách khám phá lịch sử nhân loại từ quá khứ đến hiện tại.",
    rating: 4.6,
    reviews: 150
  },
  {
    id: 6,
    name: "Tư Duy Làm Giàu",
    author: "Napoleon Hill",
    category: "Kỹ năng sống",
    price: 13.99,
    originalPrice: 19.99,
    qty: 10,
    image: "image/book/vuotquadongbao-bia.jpg",
    description: "Khám phá bí mật của những người thành công trong kiếm tiền.",
    rating: 4.5,
    reviews: 110
  }
];

// Initialize elements
const searchForm = getElement('.search-form');
const loginForm = getElement('#loginFormContainer');
const searchBtn = getElement('#search-btn');
const loginBtn = getElement('#login-btn');
const closeLoginBtn = getElement('#close-login-btn');
const headerNav = getElement('.header .header-2');
const loaderContainer = getElement('.loader-container');
const cartBtn = getElement('#cart-btn');
const cartModal = getElement('#cartModal');
const wishlistBtn = getElement('#wishlist-btn');

// Membership Tier Configuration
const tierConfig = {
  bronze: {
    name: 'Đồng',
    maxBooks: 2,
    dueDays: 14,
    maxExtends: 0,
    benefits: 'Mượn tối đa 2 sách, hạn 14 ngày'
  },
  silver: {
    name: 'Bạc',
    maxBooks: 5,
    dueDays: 30,
    maxExtends: 2,
    benefits: 'Mượn tối đa 5 sách, hạn 30 ngày, gia hạn 2 lần/tháng'
  },
  gold: {
    name: 'Vàng',
    maxBooks: 10,
    dueDays: 60,
    maxExtends: 999,
    benefits: 'Mượn tối đa 10 sách, hạn 60 ngày, gia hạn không giới hạn'
  }
};

// Cart and Favorites storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize demo accounts (Admin & Librarian)
function initializeDemoAccounts() {
  // Check if demo accounts already exist
  const adminExists = users.find(u => u.email === 'admin@lib.com');
  const librarianExists = users.find(u => u.email === 'librarian@lib.com');
  
  if (!adminExists) {
    users.push({ 
      name: 'Admin HAB', 
      email: 'admin@lib.com', 
      password: 'admin123', 
      role: 'admin',
      membershipTier: 'gold'
    });
  }
  
  if (!librarianExists) {
    users.push({ 
      name: 'Nhân viên HAB', 
      email: 'librarian@lib.com', 
      password: 'librarian123', 
      role: 'librarian',
      membershipTier: 'gold'
    });
  }
  
  localStorage.setItem('users', JSON.stringify(users));
}

// Initialize on page load
initializeDemoAccounts();

// Update cart badge
function updateCartBadge() {
  const badge = getElement('#cart-count');
  if (badge) badge.textContent = cart.length;
  
  // Hiển thị link "Tài Khoản" nếu đã login
  const myAccountLink = getElement('#myAccountLink');
  if (myAccountLink) {
    myAccountLink.style.display = currentUser ? 'inline-block' : 'none';
  }
}

// Add to cart → Request Borrow
function addToCart(bookId, bookName, price, qty = 1) {
  // Check tier limits
  if (currentUser) {
    const tier = currentUser.membershipTier || 'bronze';
    const tierLimits = tierConfig[tier];
    const currentBorrows = cart.filter(item => item.status !== 'returned').length;
    
    if (currentBorrows >= tierLimits.maxBooks) {
      showNotification(`❌ Hạng ${tierLimits.name}: Tối đa ${tierLimits.maxBooks} sách. Bạn đã mượn ${currentBorrows} sách.`);
      return;
    }
  }
  
  const existingItem = cart.find(item => item.id === bookId);
  const borrowDate = new Date().toISOString().split('T')[0]; // Ngày hôm nay
  const dueDate = new Date();
  
  // Calculate due date based on tier
  const tier = currentUser?.membershipTier || 'bronze';
  const dueDays = tierConfig[tier].dueDays;
  dueDate.setDate(dueDate.getDate() + dueDays);
  const dueDateStr = dueDate.toISOString().split('T')[0];
  
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({ 
      id: bookId, 
      name: bookName, 
      price: price, 
      qty: qty,
      borrowDate: borrowDate,
      dueDate: dueDateStr,
      status: 'pending', // pending, approved, returned
      extendsUsed: 0
    });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification(`✓ Đã thêm "${bookName}" vào yêu cầu mượn (Hạn: ${dueDays} ngày)`);
}

// Add to favorites
function addToFavorites(bookId, bookName) {
  if (!favorites.find(item => item.id === bookId)) {
    favorites.push({ id: bookId, name: bookName });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(`❤️ Thêm "${bookName}" vào yêu thích`);
  } else {
    favorites = favorites.filter(item => item.id !== bookId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification(`${bookName} đã bị xóa khỏi yêu thích`);
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 2rem;
    border-radius: .5rem;
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.1);
    z-index: 10000;
    animation: slideIn .3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut .3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Display cart → Display Borrow Requests
function displayCart() {
  const cartItems = getElement('#cartItems');
  const cartFooter = getElement('#cartFooter');
  const cartTotal = getElement('#cartTotal');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align:center; padding:2rem;">Không có yêu cầu mượn nào</p>';
    cartFooter.style.display = 'none';
  } else {
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
      const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysLeft < 0;
      const statusColor = item.status === 'pending' ? '#f39c12' : item.status === 'returned' ? '#27ae60' : '#3498db';
      const statusText = item.status === 'pending' ? 'Chờ duyệt' : item.status === 'approved' ? 'Đã duyệt' : 'Đã trả';
      
      total += item.price * item.qty;
      return `
        <div style="padding:1rem; border-bottom:1px solid #eee;">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <p style="font-weight:bold; margin:0;">${item.name}</p>
              <p style="color:#666; font-size:0.9rem; margin:0.3rem 0;">Mượn: ${item.borrowDate}</p>
              <p style="color:#666; font-size:0.9rem; margin:0.3rem 0;">Hạn: ${item.dueDate} (${daysLeft} ngày)</p>
              <p style="color:${isOverdue ? 'red' : 'green'}; font-size:0.9rem; margin:0.3rem 0; font-weight:bold;">
                ${isOverdue ? '⚠️ QUÁ HẠN' : daysLeft <= 3 ? '🔔 SẮP HẾT HẠN' : 'Bình thường'}
              </p>
              <span style="display:inline-block; background:${statusColor}; color:white; padding:0.3rem 0.8rem; border-radius:0.3rem; font-size:0.8rem; margin-top:0.5rem;">
                ${statusText}
              </span>
            </div>
            <button onclick="removeFromCart(${index})" style="background:red; color:white; border:none; padding:0.5rem 1rem; border-radius:0.3rem; cursor:pointer; margin-left:1rem; white-space:nowrap;">
              Xóa
            </button>
          </div>
        </div>
      `;
    }).join('');
    cartFooter.style.display = 'block';
  }
}

// Remove from cart → Remove from Borrow Requests
function removeFromCart(itemIndex) {
  if (typeof itemIndex === 'string') {
    // Nếu là bookId (cách cũ), convert về index
    itemIndex = cart.findIndex(item => item.id == itemIndex);
  }
  cart.splice(itemIndex, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  displayCart();
}

// Close cart
function closeCart() {
  if (cartModal) cartModal.style.right = '-105%';
}

// Event listeners with null checks
if (searchBtn) searchBtn.addEventListener('click', () => searchForm?.classList.toggle('active'));
if (loginBtn) loginBtn.addEventListener('click', () => loginForm?.classList.toggle('active'));
if (closeLoginBtn) closeLoginBtn.addEventListener('click', () => loginForm?.classList.remove('active'));
if (cartBtn) cartBtn.addEventListener('click', (e) => {
  e.preventDefault();
  displayCart();
  cartModal.style.right = '0';
});
if (wishlistBtn) wishlistBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showNotification(`Yêu thích: ${favorites.length} sách`);
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target === loginForm) loginForm.classList.remove('active');
  if (e.target === cartModal) closeCart();
});

// Handle scroll events
window.addEventListener('scroll', () => {
  if (searchForm) searchForm.classList.remove('active');
  const scrollActive = window.scrollY > 80;
  headerNav?.classList.toggle('active', scrollActive);
});

// Handle page load
window.addEventListener('load', () => {
  const scrollActive = window.scrollY > 80;
  headerNav?.classList.toggle('active', scrollActive);
  updateCartBadge();
  if (loaderContainer) setTimeout(() => loaderContainer.classList.add('active'), 4000);
});

// Form handlers
function handleLogin(event) {
  event.preventDefault();
  const loginContent = document.getElementById('loginFormContent');
  const isRegister = loginContent.style.display === 'none';
  const userType = document.getElementById('loginForm').dataset.userType || 'customer';
  
  if (isRegister) {
    // Register logic
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const tier = document.getElementById('registerTier').value;
    
    if (password !== passwordConfirm) {
      alert('Mật khẩu không khớp!');
      return;
    }
    
    if (users.find(u => u.email === email)) {
      alert('Email đã được đăng ký!');
      return;
    }
    
    users.push({ name, email, password, role: 'customer', membershipTier: tier });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ name, email, role: 'customer', membershipTier: tier }));
    showNotification(`✓ Tạo tài khoản thành công! Bạn là hạng ${tierConfig[tier].name}`);
    setTimeout(() => location.reload(), 1500);
  } else {
    // Login logic
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    let user;
    if (userType === 'staff') {
      // Staff login - admin or librarian
      user = users.find(u => u.email === email && u.password === password && (u.role === 'admin' || u.role === 'librarian'));
    } else {
      // Customer login
      user = users.find(u => u.email === email && u.password === password && u.role === 'customer');
    }
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier || 'bronze' }));
      showNotification(`✓ Đăng nhập thành công! Xin chào ${user.name}`);
      loginForm.classList.remove('active');
      
      // Redirect dựa trên role
      if (user.role === 'admin' || user.role === 'librarian') {
        setTimeout(() => window.location.href = 'admin.html', 1500);
      } else {
        setTimeout(() => location.reload(), 1500);
      }
    } else {
      if (userType === 'staff') {
        alert('Email hoặc mật khẩu nhân viên không đúng!');
      } else {
        alert('Email hoặc mật khẩu không đúng!');
      }
    }
  }
}

function switchLoginForm(type) {
  const loginContent = document.getElementById('loginFormContent');
  const registerContent = document.getElementById('registerFormContent');
  const formTitle = document.getElementById('formTitle');
  
  if (type === 'register') {
    loginContent.style.display = 'none';
    registerContent.style.display = 'block';
    formTitle.textContent = 'Tạo tài khoản';
  } else {
    loginContent.style.display = 'block';
    registerContent.style.display = 'none';
    formTitle.textContent = 'Đăng nhập';
  }
}

function switchUserType(type) {
  const registerLinkContainer = document.getElementById('registerLinkContainer');
  const staffLoginInfo = document.getElementById('staffLoginInfo');
  const customerTypeBtn = document.getElementById('customerTypeBtn');
  const staffTypeBtn = document.getElementById('staffTypeBtn');
  
  // Reset forms
  document.getElementById('loginFormContent').style.display = 'block';
  document.getElementById('registerFormContent').style.display = 'none';
  document.getElementById('formTitle').textContent = 'Đăng nhập';
  
  // Store current type
  document.getElementById('loginForm').dataset.userType = type;
  
  if (type === 'customer') {
    registerLinkContainer.style.display = 'block';
    staffLoginInfo.style.display = 'none';
    customerTypeBtn.style.background = 'var(--green)';
    customerTypeBtn.style.color = 'white';
    staffTypeBtn.style.background = '#ccc';
    staffTypeBtn.style.color = '#333';
  } else {
    registerLinkContainer.style.display = 'none';
    staffLoginInfo.style.display = 'block';
    staffTypeBtn.style.background = 'var(--green)';
    staffTypeBtn.style.color = 'white';
    customerTypeBtn.style.background = '#ccc';
    customerTypeBtn.style.color = '#333';
  }
}

function handleNewsletter(event) {
  event.preventDefault();
  const email = document.getElementById('newsletterEmail').value;
  const msg = document.getElementById('newsletterMsg');
  
  if (!subscribers.find(s => s.email === email)) {
    subscribers.push({ email, date: new Date().toLocaleDateString('vi-VN') });
    localStorage.setItem('subscribers', JSON.stringify(subscribers));
    msg.textContent = '✓ Đăng ký thành công!';
    msg.style.color = 'green';
    document.getElementById('newsletterForm').reset();
    setTimeout(() => {
      msg.textContent = '';
    }, 3000);
  } else {
    msg.textContent = 'Email này đã đăng ký!';
    msg.style.color = 'red';
  }
}
const swiperConfigs = {
  '.books-slider': {
    loop: true,
    centeredSlides: true,
    autoplay: { delay: 9500, disableOnInteraction: false },
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  },
  '.featured-slider': {
    spaceBetween: 10,
    loop: true,
    centeredSlides: true,
    autoplay: { delay: 9500, disableOnInteraction: false },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    breakpoints: { 0: { slidesPerView: 1 }, 450: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }
  },
  '.arrivals-slider': {
    spaceBetween: 10,
    loop: true,
    centeredSlides: true,
    autoplay: { delay: 9500, disableOnInteraction: false },
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  },
  '.reviews-slider': {
    spaceBetween: 10,
    grabCursor: true,
    loop: true,
    centeredSlides: true,
    autoplay: { delay: 9500, disableOnInteraction: false },
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  },
  '.blogs-slider': {
    spaceBetween: 10,
    grabCursor: true,
    loop: true,
    centeredSlides: true,
    autoplay: { delay: 9500, disableOnInteraction: false },
    breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
  }
};

// Initialize all swipers
Object.entries(swiperConfigs).forEach(([selector, config]) => {
  if (document.querySelector(selector)) new Swiper(selector, config);
});