// Books Database
const booksDatabase = [
  { id: 1, name: "Đắc Nhân Tâm", author: "Dale Carnegie", category: "Kỹ năng sống", price: 15.99, originalPrice: 20.99, qty: 12, image: "image/book/dacnhantam.jpg", description: "Cuốn sách nổi tiếng nhất về nghệ thuật giao tiếp và thu phục lòng người.", rating: 4.5, reviews: 120 },
  { id: 2, name: "Nhà Giả Kim", author: "Paulo Coelho", category: "Văn học", price: 12.99, originalPrice: 18.99, qty: 8, image: "image/book/lanhdaokhongoan.jpg", description: "Tiểu thuyết về hành trình tìm kiếm ước mơ của một chàng trai trẻ.", rating: 4.8, reviews: 95 },
  { id: 3, name: "Clean Code", author: "Robert C. Martin", category: "Công nghệ", price: 24.99, originalPrice: 32.99, qty: 5, image: "image/book/nghilondethanhcong.jpg", description: "Hướng dẫn viết code sạch và chuyên nghiệp cho lập trình viên.", rating: 4.9, reviews: 180 },
  { id: 4, name: "Sapiens", author: "Yuval Noah Harari", category: "Lịch sử", price: 18.99, originalPrice: 26.99, qty: 7, image: "image/book/biquyettruongtho.png", description: "Khám phá lịch sử nhân loại từ quá khứ đến hiện tại.", rating: 4.6, reviews: 150 },
  { id: 5, name: "Tư Duy Làm Giàu", author: "Napoleon Hill", category: "Kỹ năng sống", price: 13.99, originalPrice: 19.99, qty: 10, image: "image/book/vuotquadongbao-bia.jpg", description: "Bí mật của những người thành công trong kiếm tiền.", rating: 4.5, reviews: 110 }
];

// Membership Tier Configuration - Mọi người có thể mượn
const tierConfig = {
  bronze: { name: 'Tiêu Chuẩn', maxBooks: 999, dueDays: 30, maxExtends: 2 }
};

// Global variables - Direct from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Save all data to localStorage
function saveData() {
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('favorites', JSON.stringify(favorites));
  localStorage.setItem('subscribers', JSON.stringify(subscribers));
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Initialize demo accounts
function initializeDemoAccounts() {
  if (!users.find(u => u.email === 'admin@lib.com')) {
    users.push({ name: 'Admin HAB', email: 'admin@lib.com', password: 'admin123', role: 'admin', membershipTier: 'bronze', status: 'user' });
  }
  if (!users.find(u => u.email === 'librarian@lib.com')) {
    users.push({ name: 'Nhân viên HAB', email: 'librarian@lib.com', password: 'librarian123', role: 'librarian', membershipTier: 'bronze', status: 'user' });
  }
  if (!users.find(u => u.email === 'test@gmail.com')) {
    users.push({ name: 'Test User', email: 'test@gmail.com', password: '123456', role: 'customer', membershipTier: 'bronze', status: 'user' });
  }
  if (!users.find(u => u.email === 'customer@gmail.com')) {
    users.push({ name: 'Người Dùng Demo', email: 'customer@gmail.com', password: 'demo123', role: 'customer', membershipTier: 'bronze', status: 'user' });
  }
  saveData();
}

initializeDemoAccounts();

// Notification system - sửa để hiển thị lần lượt
let notificationQueue = [];
let isShowingNotification = false;

function showNotification(message, type = 'success') {
  notificationQueue.push({ message, type });
  
  if (!isShowingNotification) {
    showNextNotification();
  }
}

function showNextNotification() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }
  
  isShowingNotification = true;
  const { message, type } = notificationQueue.shift();
  
  const notification = document.createElement('div');
  const bgColor = type === 'error' ? '#e74c3c' : '#27ae60';
  
  // Tính toán vị trí theo số lượng notification đang hiển thị
  const visibleNotifications = document.querySelectorAll('.notification-item').length;
  const topPosition = 20 + (visibleNotifications * 90);
  
  notification.className = 'notification-item';
  notification.style.cssText = `
    position: fixed; top: ${topPosition}px; right: 20px; background: ${bgColor}; color: white; 
    padding: 1rem 2rem; border-radius: 0.5rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,.1); 
    z-index: 10000; animation: slideIn 0.3s ease; min-width: 300px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      notification.remove();
      // Xóa khỏi queue và hiển thị notification tiếp theo
      setTimeout(() => showNextNotification(), 200);
    }, 300);
  }, 3000);
}

// DOM elements cache - Optimize by lazy loading
const dom = {
  searchForm: () => document.querySelector('.search-form'),
  loginForm: () => document.querySelector('#loginFormContainer'),
  searchBtn: () => document.querySelector('#search-btn'),
  loginBtn: () => document.querySelector('#login-btn'),
  closeLoginBtn: () => document.querySelector('#close-login-btn'),
  headerNav: () => document.querySelector('.header .header-2'),
  loaderContainer: () => document.querySelector('.loader-container'),
  cartBtn: () => document.querySelector('#cart-btn'),
  cartModal: () => document.querySelector('#cartModal'),
  cartItems: () => document.querySelector('#cartItems'),
  cartFooter: () => document.querySelector('#cartFooter'),
  cartCount: () => document.querySelector('#cart-count'),
  myAccountLink: () => document.querySelector('#myAccountLink')
};

// Update cart badge and account link
function updateCartBadge() {
  const cartCount = dom.cartCount();
  if (cartCount) cartCount.textContent = cart.length;
  const myAccountLink = dom.myAccountLink();
  if (myAccountLink) myAccountLink.style.display = currentUser ? 'inline-block' : 'none';
}

// Add to cart (Borrow request)
function addToCart(bookId, bookName, price, qty = 1) {
  if (!currentUser) {
    showNotification('❌ Vui lòng đăng nhập trước!', 'error');
    getLoginBtn()?.click();
    return;
  }
  
  // Kiểm tra nếu người dùng chưa đăng ký thẻ mượn
  if (!currentUser.membershipTier || currentUser.status === 'guest') {
    showNotification('❌ Vui lòng đăng ký thẻ mượn để mượn sách!', 'error');
    openLibraryCardModal();
    return;
  }
  
  if (cart.find(item => item.id === bookId && item.status === 'pending')) {
    showNotification('⚠️ Sách này đã có trong yêu cầu mượn!', 'error');
    return;
  }
  
  const tier = tierConfig['bronze'];
  const borrowDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + tier.dueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  cart.push({ id: bookId, name: bookName, price, qty, borrowDate, dueDate, status: 'pending', extendsUsed: 0 });
  saveData();
  updateCartBadge();
  showNotification(`✓ Thêm "${bookName}" vào yêu cầu mượn (Hạn: ${tier.dueDays} ngày)`);
}

// Add/Remove favorites
function addToFavorites(bookId, bookName) {
  const index = favorites.findIndex(item => item.id === bookId);
  if (index === -1) {
    favorites.push({ id: bookId, name: bookName });
    showNotification(`❤️ Thêm "${bookName}" vào yêu thích`);
  } else {
    favorites.splice(index, 1);
    showNotification(`${bookName} đã bị xóa khỏi yêu thích`);
  }
  saveData();
}

// Display cart
function displayCart() {
  const cartItems = dom.cartItems();
  const cartFooter = dom.cartFooter();
  
  if (!cartItems || !cartFooter) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align:center; padding:2rem;">Không có yêu cầu mượn nào</p>';
    cartFooter.style.display = 'none';
  } else {
    const statusColors = { pending: '#f39c12', approved: '#3498db', returned: '#27ae60' };
    const statusTexts = { pending: 'Chờ duyệt', approved: 'Đang mượn', returned: 'Đã trả' };
    
    cartItems.innerHTML = cart.map((item, idx) => {
      const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      const isOverdue = daysLeft < 0;
      const status = statusTexts[item.status] || 'Chờ duyệt';
      const color = statusColors[item.status] || '#f39c12';
      
      return `
        <div style="padding:1rem; border-bottom:1px solid #eee;">
          <div style="display:flex; justify-content:space-between; align-items:start;">
            <div style="flex:1;">
              <p style="font-weight:bold; margin:0;">${item.name}</p>
              <p style="color:#666; font-size:0.9rem; margin:0.3rem 0;">Mượn: ${item.borrowDate} | Hạn: ${item.dueDate}</p>
              <p style="color:${isOverdue ? 'red' : 'green'}; font-size:0.9rem; margin:0.3rem 0;">
                ${isOverdue ? '⚠️ QUÁ HẠN' : daysLeft <= 3 ? '🔔 SẮP HẾT HẠN' : `${daysLeft} ngày còn lại`}
              </p>
              <span style="display:inline-block; background:${color}; color:white; padding:0.3rem 0.8rem; border-radius:0.3rem; font-size:0.8rem; margin-top:0.5rem;">
                ${status}
              </span>
            </div>
            <button onclick="removeFromCart(${idx})" style="background:red; color:white; border:none; padding:0.5rem 1rem; border-radius:0.3rem; cursor:pointer; margin-left:1rem;">Xóa</button>
          </div>
        </div>
      `;
    }).join('');
    cartFooter.style.display = 'block';
  }
}

// Remove from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveData();
  updateCartBadge();
  displayCart();
}

// Close cart modal
function closeCart() {
  dom.cartModal()?.style?.setProperty('right', '-105%');
}

// Event listeners
(() => {
  const handleLoad = () => {
    updateCartBadge();
    const loader = dom.loaderContainer();
    if (loader) setTimeout(() => loader.classList.add('active'), 4000);
    const nav = dom.headerNav();
    if (nav) nav.classList.toggle('active', window.scrollY > 80);
  };

  const handleScroll = () => {
    const search = dom.searchForm();
    if (search) search.classList.remove('active');
    const nav = dom.headerNav();
    if (nav) nav.classList.toggle('active', window.scrollY > 80);
  };

  window.addEventListener('load', handleLoad);
  window.addEventListener('scroll', handleScroll);
  
  dom.searchBtn()?.addEventListener('click', () => dom.searchForm()?.classList.toggle('active'));
  dom.loginBtn()?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
      // Nếu đã đăng nhập, toggle dropdown menu
      toggleUserDropdown();
    } else {
      // Nếu chưa đăng nhập, hiện form đăng nhập
      dom.loginForm()?.classList.toggle('active');
    }
  });
  dom.closeLoginBtn()?.addEventListener('click', () => dom.loginForm()?.classList.remove('active'));
  dom.cartBtn()?.addEventListener('click', (e) => {
    e.preventDefault();
    displayCart();
    const modal = dom.cartModal();
    if (modal) modal.style.right = '0';
  });

  document.addEventListener('click', (e) => {
    const loginForm = dom.loginForm();
    const cartModal = dom.cartModal();
    const userDropdown = document.getElementById('userDropdown');
    const loginBtn = dom.loginBtn();
    
    if (e.target === loginForm && loginForm) loginForm.classList.remove('active');
    if (e.target === cartModal) closeCart();
    
    // Đóng dropdown nếu click ngoài
    if (userDropdown && e.target !== loginBtn && !loginBtn?.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.style.display = 'none';
    }
  });
})();

// Helper: Validate email
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// Helper: Get form values
const getFormValue = (selector) => document.querySelector(selector)?.value.trim() || '';

// Form handlers
function handleRegister(event) {
  event.preventDefault();
  const name = getFormValue('#registerName');
  const email = getFormValue('#registerEmail').toLowerCase();
  const password = getFormValue('#registerPassword');
  const passwordConfirm = getFormValue('#registerPasswordConfirm');
  
  if (!name || !email || !password) {
    showNotification('❌ Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }
  
  if (password !== passwordConfirm) {
    showNotification('❌ Mật khẩu không khớp!', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showNotification('❌ Email không hợp lệ!', 'error');
    return;
  }
  
  if (users.find(u => u.email === email)) {
    showNotification('❌ Email đã được đăng ký!', 'error');
    return;
  }
  
  // Tạo người dùng là "Khách" - chưa có hạng thẻ
  users.push({ name, email, password, role: 'customer', membershipTier: null, status: 'guest' });
  currentUser = { name, email, role: 'customer', membershipTier: null, status: 'guest' };
  saveData();
  showNotification('✓ Tạo tài khoản thành công! Vui lòng đăng ký thẻ mượn để sử dụng dịch vụ.');
  
  // Reset form
  document.querySelector('#registerFormSubmit')?.reset();
  
  setTimeout(() => {
    dom.loginForm()?.classList.remove('active');
    setTimeout(() => openLibraryCardModal(), 500);
  }, 1500);
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = getFormValue('#loginEmail').toLowerCase();
  const password = getFormValue('#loginPassword');
  
  if (!email || !password) {
    showNotification('❌ Vui lòng điền email và mật khẩu!', 'error');
    return;
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = { name: user.name, email: user.email, role: user.role, membershipTier: user.membershipTier || null, status: user.status || 'guest' };
    saveData();
    showNotification(`✓ Đăng nhập thành công! Xin chào ${user.name}`);
    dom.loginForm()?.classList.remove('active');
    updateUserDropdown();
    
    // Reset form
    document.querySelector('#loginFormSubmit')?.reset();
    
    setTimeout(() => {
      if (['admin', 'librarian'].includes(user.role)) {
        window.location.href = 'admin.html';
      } else if (user.status === 'guest' || !user.membershipTier) {
        // Nếu là Khách - yêu cầu đăng ký thẻ
        showNotification('📖 Vui lòng đăng ký thẻ mượn!');
        openLibraryCardModal();
      } else {
        location.reload();
      }
    }, 1500);
  } else {
    showNotification('❌ Email hoặc mật khẩu không đúng!', 'error');
  }
}

function switchLoginForm(type) {
  const loginForm = document.querySelector('#loginFormSubmit');
  const registerForm = document.querySelector('#registerFormSubmit');
  
  if (type === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    // Reset register form
    registerForm.reset();
  }
}

function handleNewsletter(event) {
  event.preventDefault();
  const email = getFormValue('#newsletterEmail').toLowerCase();
  const msg = document.querySelector('#newsletterMsg');
  
  if (!msg) return;
  
  if (!email || !isValidEmail(email)) {
    msg.textContent = '❌ Email không hợp lệ!';
    msg.style.color = 'red';
    return;
  }
  
  if (subscribers.find(s => s.email === email)) {
    msg.textContent = 'Email này đã đăng ký!';
    msg.style.color = 'red';
    return;
  }
  
  subscribers.push({ email, date: new Date().toLocaleDateString('vi-VN') });
  saveData();
  msg.textContent = '✓ Đăng ký thành công!';
  msg.style.color = 'green';
  document.querySelector('#newsletterForm')?.reset();
  setTimeout(() => msg.textContent = '', 3000);
}

// Render featured books
function renderFeaturedBooks() {
  const wrapper = document.querySelector('#featuredBooksWrapper');
  if (!wrapper) return;
  
  wrapper.innerHTML = booksDatabase.map(book => `
    <div class="swiper-slide box">
      <div class="icons">
        <a href="#" class="fas fa-heart" onclick="addToFavorites(${book.id}, '${book.name}'); return false;"></a>
        <a href="book-details.html?id=${book.id}" class="fas fa-eye"></a>
      </div>
      <div class="image"><img src="${book.image}" alt="${book.name}"></div>
      <div class="content">
        <h3>${book.name}</h3>
        <p style="font-size:0.9rem; color:#666; margin:0.5rem 0;">Tác giả: ${book.author}</p>
        <p style="font-size:0.85rem; color:#27ae60; margin:0.3rem 0;">⭐ ${book.rating}/5 (${book.reviews} đánh giá)</p>
        <button onclick="addToCart(${book.id}, '${book.name}', ${book.price})" class="btn" style="width:100%; margin-top:0.5rem;">Yêu Cầu Mượn</button>
      </div>
    </div>
  `).join('');
}

// Initialize Swiper - Reusable config
const createSwiper = (selectors) => {
  selectors.forEach(([sel, cfg]) => document.querySelector(sel) && new Swiper(sel, cfg));
};

// Swiper configurations
const swiperConfigs = [
  ['.books-slider', { loop: true, centeredSlides: true, autoplay: { delay: 9500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }],
  ['.featured-slider', { spaceBetween: 10, loop: true, centeredSlides: true, autoplay: { delay: 9500, disableOnInteraction: false }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, breakpoints: { 0: { slidesPerView: 1 }, 450: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } } }],
  ['.arrivals-slider', { spaceBetween: 10, loop: true, centeredSlides: true, autoplay: { delay: 9500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }],
  ['.reviews-slider', { spaceBetween: 10, grabCursor: true, loop: true, centeredSlides: true, autoplay: { delay: 9500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }],
  ['.blogs-slider', { spaceBetween: 10, grabCursor: true, loop: true, centeredSlides: true, autoplay: { delay: 9500, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } }]
];

createSwiper(swiperConfigs);

// Render featured books after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFeaturedBooks);
} else {
  renderFeaturedBooks();
}

// ===== Library Card Registration Functions =====

// Lấy button đăng nhập
function getLoginBtn() {
  return document.querySelector('#login-btn');
}

// Mở modal đăng ký thẻ mượn
function openLibraryCardModal() {
  const modal = document.querySelector('#libraryCardModal');
  if (!modal) return;
  
  // Nếu người dùng chưa đăng nhập
  if (!currentUser) {
    showNotification('❌ Vui lòng đăng nhập trước!', 'error');
    dom.loginBtn()?.click();
    return;
  }
  
  // Hiển thị thông tin người dùng
  const userInfo = document.querySelector('#libraryCardUserInfo');
  const userName = document.querySelector('#libraryCardUserName');
  if (userInfo && userName) {
    userName.textContent = `Xin chào, ${currentUser.name}! 👋`;
    userInfo.style.display = 'block';
  }
  
  // Reset form
  document.querySelector('#libraryCardForm')?.reset();
  document.querySelectorAll('input[name="libraryCardTier"]').forEach(input => {
    input.checked = false;
  });
  
  // Set mặc định là Bronze
  const bronzeRadio = document.querySelector('input[value="bronze"][name="libraryCardTier"]');
  if (bronzeRadio) {
    bronzeRadio.checked = true;
    updateTierPrice('bronze');
  }
  
  modal.style.display = 'flex';
  modal.style.animation = 'slideIn 0.3s ease';
}

// Đóng modal đăng ký thẻ mượn
function closeLibraryCardModal() {
  const modal = document.querySelector('#libraryCardModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Xử lý đăng ký thẻ mượn
function handleLibraryCardRegistration(event) {
  event.preventDefault();
  
  if (!currentUser) {
    showNotification('❌ Vui lòng đăng nhập trước!', 'error');
    return;
  }
  
  // Tự động gán hạng Bronze (50,000₫)
  const selectedTier = 'bronze';
  
  // Cập nhật người dùng - nâng cấp từ Guest thành User
  currentUser.membershipTier = selectedTier;
  currentUser.status = 'user';
  currentUser.registrationDate = new Date().toISOString().split('T')[0];
  
  // Cập nhật thông tin người dùng trong danh sách users
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    users[userIndex].membershipTier = selectedTier;
    users[userIndex].status = 'user';
    users[userIndex].registrationDate = currentUser.registrationDate;
  }
  
  saveData();
  
  const tierName = tierConfig[selectedTier].name;
  showNotification(`✓ Đăng ký thẻ mượn thành công! Bạn là hạng ${tierName}`);
  
  setTimeout(() => {
    closeLibraryCardModal();
    setTimeout(() => {
      location.reload();
    }, 500);
  }, 1500);
}

// Chuyển đến trang đăng ký thẻ mượn trong phần tài khoản
function goToMembershipPage() {
  if (!currentUser) {
    showNotification('❌ Vui lòng đăng nhập trước!', 'error');
    getLoginBtn()?.click();
    return;
  }
  
  // Chuyển đến trang my-account.html với parameter để load phần membership
  window.location.href = 'my-account.html?section=membership';
}

// Hàm điều hướng từ dropdown menu
function goToProfile() {
  if (!currentUser) {
    getLoginBtn()?.click();
    return;
  }
  window.location.href = 'my-account.html?section=profile';
}

function goToBorrowing() {
  if (!currentUser) {
    getLoginBtn()?.click();
    return;
  }
  window.location.href = 'my-account.html?section=borrowing';
}

function goToMembership() {
  if (!currentUser) {
    getLoginBtn()?.click();
    return;
  }
  window.location.href = 'my-account.html?section=membership';
}

function goToFavorites() {
  if (!currentUser) {
    getLoginBtn()?.click();
    return;
  }
  window.location.href = 'my-account.html?section=favorites';
}

function goToPassword() {
  if (!currentUser) {
    getLoginBtn()?.click();
    return;
  }
  window.location.href = 'my-account.html?section=password';
}

function handleLogout() {
  if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    closeUserDropdown();
    showNotification('✓ Đã đăng xuất');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// Toggle dropdown menu
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (!dropdown) return;
  
  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    dropdown.style.display = 'block';
    updateUserDropdown();
  } else {
    dropdown.style.display = 'none';
  }
}

function closeUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

function updateUserDropdown() {
  if (!currentUser) return;
  
  const nameEl = document.getElementById('userDropdownName');
  const emailEl = document.getElementById('userDropdownEmail');
  
  if (nameEl) nameEl.textContent = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;
}