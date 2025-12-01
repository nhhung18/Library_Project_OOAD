// Render books list with filter & search
let allBooks = booksDatabase;
let filteredBooks = booksDatabase;

function renderBooks() {
  const container = document.getElementById('booksContainer');
  container.innerHTML = filteredBooks.map(book => `
    <div class="box">
      <div class="icons">
        <a href="#" class="fas fa-search"></a>
        <a href="#" class="fas fa-heart" onclick="addToFavorites(${book.id}, '${book.name}'); return false;"></a>
        <a href="book-details.html?id=${book.id}" class="fas fa-eye"></a>
      </div>
      <div class="stock-badge" style="position:absolute; top:1rem; right:1rem; background:${book.qty > 0 ? '#27ae60' : '#e74c3c'}; color:white; padding:0.5rem 1rem; border-radius:0.3rem; font-size:0.85rem; z-index:10; font-weight:bold;">
        Còn: ${book.qty}
      </div>
      <div class="image">
        <img src="${book.image}" alt="${book.name}">
      </div>
      <div class="content">
        <h3>${book.name}</h3>
        <p style="font-size:0.9rem; color:#666; margin:0.5rem 0;">Tác giả: ${book.author}</p>
        <p style="font-size:0.85rem; color:#27ae60; margin:0.3rem 0;">⭐ ${book.rating}/5</p>
        <div class="price" style="display:none;">$${book.price}</div>
        <a href="book-details.html?id=${book.id}" class="btn">xem chi tiết</a>
      </div>
    </div>
  `).join('');
  
  document.getElementById('bookCount').textContent = filteredBooks.length;
}

function loadCategories() {
  const categories = [...new Set(booksDatabase.map(b => b.category))];
  const categoryFilter = document.getElementById('categoryFilter');
  
  categoryFilter.innerHTML = categories.map(cat => `
    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 1.4rem;">
      <input type="checkbox" value="${cat}" onchange="applyFilters()" style="cursor: pointer;">
      <span>${cat} (${booksDatabase.filter(b => b.category === cat).length})</span>
    </label>
  `).join('');
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedCategories = Array.from(document.querySelectorAll('#categoryFilter input:checked')).map(el => el.value);
  const sortOption = document.getElementById('sortSelect').value;
  
  // Filter
  filteredBooks = booksDatabase.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm) || 
                         book.author.toLowerCase().includes(searchTerm) ||
                         book.category.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category);
    return matchesSearch && matchesCategory;
  });
  
  // Sort
  switch(sortOption) {
    case 'name-asc':
      filteredBooks.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredBooks.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'rating-desc':
      filteredBooks.sort((a, b) => b.rating - a.rating);
      break;
    case 'rating-asc':
      filteredBooks.sort((a, b) => a.rating - b.rating);
      break;
  }
  
  renderBooks();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('#categoryFilter input').forEach(el => el.checked = false);
  document.getElementById('sortSelect').value = 'name-asc';
  filteredBooks = booksDatabase;
  renderBooks();
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    renderBooks();
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('sortSelect').addEventListener('change', applyFilters);
  });
} else {
  loadCategories();
  renderBooks();
  
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applyFilters);
}
