let currentBook = null;

// Load book details from URL parameter on page load
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const bookId = parseInt(params.get('id'));
  
  if (!bookId) {
    showNotification('⚠️ ID sách không hợp lệ', 'warning');
    return;
  }
  
  // Find book in database
  currentBook = booksDatabase.find(b => b.id === bookId);
  
  if (!currentBook) {
    showNotification('❌ Sách không tìm thấy', 'error');
    return;
  }
  
  // Populate book details
  displayBookDetails();
});

function displayBookDetails() {
  if (!currentBook) return;
  
  // Update title and basic info
  document.getElementById('bookTitle').textContent = currentBook.name;
  document.getElementById('bookAuthor').textContent = `Tác giả: ${currentBook.author}`;
  document.getElementById('bookCategory').textContent = `Thể loại: ${currentBook.category}`;
  document.getElementById('bookDescription').textContent = currentBook.description;
  
  // Update price
  const priceDiv = document.getElementById('bookPrice');
  priceDiv.innerHTML = `$${currentBook.price} <span>$${currentBook.originalPrice}</span>`;
  
  // Update quantity
  const qtyElement = document.getElementById('bookQty');
  qtyElement.textContent = currentBook.qty;
  const qtyInput = document.getElementById('qtyInput');
  qtyInput.max = Math.min(currentBook.qty, 10);
  
  // Update status
  const status = currentBook.qty > 0 ? 'Còn hàng' : 'Hết hàng';
  document.getElementById('metaStatus').textContent = status;
  document.getElementById('metaStatus').style.color = currentBook.qty > 0 ? 'var(--green)' : 'var(--red)';
  
  // Update meta info
  document.getElementById('metaAuthor').textContent = currentBook.author;
  document.getElementById('metaCategory').textContent = currentBook.category;
  
  // Update image
  document.getElementById('MainImg').src = currentBook.image;
  document.getElementById('MainImg').alt = currentBook.name;
  
  // Update rating display
  const ratingStars = document.getElementById('ratingStars');
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += `<i class="fas fa-star" style="color:${i < currentBook.rating ? 'var(--orange)' : '#ccc'};"></i>`;
  }
  ratingStars.innerHTML = stars + ' ';
  
  // Update review count
  const relevantReviews = (JSON.parse(localStorage.getItem('reviews')) || []).filter(r => r.bookId === currentBook.id);
  document.getElementById('reviewCount').textContent = `(${relevantReviews.length} đánh giá)`;
  
  // Disable borrow button if out of stock
  const borrowBtn = document.querySelector('.actions .btn');
  if (currentBook.qty <= 0) {
    borrowBtn.style.opacity = '0.5';
    borrowBtn.style.cursor = 'not-allowed';
    borrowBtn.onclick = (e) => {
      e.preventDefault();
      showNotification('❌ Sách đã hết', 'error');
    };
  }
}

// Book details page specific functions
function addToCartFromDetails(event) {
  event.preventDefault();
  
  if (!currentBook) {
    showNotification('⚠️ Lỗi: Không tìm thấy sách', 'warning');
    return;
  }
  
  if (currentBook.qty <= 0) {
    showNotification('❌ Sách đã hết', 'error');
    return;
  }
  
  const qty = parseInt(document.getElementById('qtyInput').value) || 1;
  
  if (qty > currentBook.qty) {
    showNotification(`⚠️ Chỉ còn ${currentBook.qty} quyển`, 'warning');
    return;
  }
  
  addToCart(currentBook.id, currentBook.name, currentBook.price, qty);
  showNotification(`✓ Đã thêm ${qty} quyển "${currentBook.name}" vào giỏ`, 'success');
}

function submitReview(event) {
  event.preventDefault();
  
  if (!currentBook) {
    showNotification('⚠️ Lỗi: Không tìm thấy sách', 'warning');
    return;
  }
  
  const rating = document.querySelector('input[name="rate"]:checked');
  const text = document.getElementById('reviewText').value;
  const msg = document.getElementById('reviewMsg');
  
  if (!rating) {
    msg.textContent = '⚠️ Vui lòng chọn số sao';
    msg.style.color = 'orange';
    return;
  }
  
  if (!text.trim()) {
    msg.textContent = '⚠️ Vui lòng viết đánh giá';
    msg.style.color = 'orange';
    return;
  }
  
  let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    msg.textContent = '⚠️ Vui lòng đăng nhập để đánh giá';
    msg.style.color = 'orange';
    return;
  }
  
  reviews.push({
    bookId: currentBook.id,
    rating: parseInt(rating.value),
    text: text,
    date: new Date().toLocaleDateString('vi-VN'),
    user: currentUser.name
  });
  
  localStorage.setItem('reviews', JSON.stringify(reviews));
  msg.textContent = '✓ Cảm ơn đánh giá của bạn!';
  msg.style.color = 'green';
  
  document.querySelectorAll('input[name="rate"]').forEach(el => el.checked = false);
  document.getElementById('reviewText').value = '';
  
  setTimeout(() => msg.textContent = '', 3000);
}
