// Render featured books on page load
function renderFeaturedBooks() {
  const wrapper = document.getElementById('featuredBooksWrapper');
  if (!wrapper) return;
  
  wrapper.innerHTML = booksDatabase.map(book => `
    <div class="swiper-slide box">
      <div class="icons">
        <a href="#" class="fas fa-search" onclick="return false;"></a>
        <a href="#" class="fas fa-heart" onclick="addToFavorites(${book.id}, '${book.name}'); return false;"></a>
        <a href="book-details.html?id=${book.id}" class="fas fa-eye"></a>
      </div>
      <div class="stock-badge" style="position:absolute; top:1rem; right:1rem; background:${book.qty > 0 ? '#27ae60' : '#e74c3c'}; color:white; padding:0.5rem 1rem; border-radius:0.3rem; font-size:0.85rem; z-index:10; font-weight:bold;">
        Còn: ${book.qty}
      </div>
      <div class="image">
        <a href="book-details.html?id=${book.id}">
          <img src="${book.image}" alt="${book.name}">
        </a>
      </div>
      <div class="content">
        <h3>${book.name}</h3>
        <p style="font-size:0.85rem; color:#666; margin:0.3rem 0;">Tác giả: ${book.author}</p>
        <p style="font-size:0.85rem; color:#27ae60; margin:0.5rem 0; font-weight:bold;">⭐ ${book.rating}/5 (${book.reviews} đánh giá)</p>
        <a href="#" class="btn" onclick="addToCart(${book.id}, '${book.name}', 0, 1); return false;">yêu cầu mượn</a>
      </div>
    </div>
  `).join('');
  
  // Reinitialize Swiper after rendering
  setTimeout(() => {
    if (swiper && swiper['featured-slider']) {
      swiper['featured-slider'].update();
    }
  }, 100);
}

// Initialize featured books on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderFeaturedBooks);
} else {
  renderFeaturedBooks();
}
