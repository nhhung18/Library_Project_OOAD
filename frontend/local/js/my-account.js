// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Vui lòng đăng nhập trước');
        window.location.href = 'index.html';
        return;
    }
    
    loadProfile();
    loadBorrowingList();
    loadFavorites();
});

function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const rankMap = {
        'customer': 'Khách hàng',
        'librarian': 'Thủ thư',
        'admin': 'Admin'
    };
    
    const tierEmojis = { bronze: '🥉', silver: '🥈', gold: '🥇' };
    const tierNames = { bronze: 'Đồng', silver: 'Bạc', gold: 'Vàng' };
    const tier = currentUser.membershipTier || 'bronze';
    
    const borrowHistory = JSON.parse(localStorage.getItem('cart')) || [];
    const totalBorrowed = borrowHistory.length;
    const currentlyBorrowing = borrowHistory.filter(b => b.status !== 'returned').length;
    
    document.getElementById('profileCard').innerHTML = `
        <div class="profile-info">
            <div class="info-item">
                <label>Tên</label>
                <value>${currentUser.name}</value>
            </div>
            <div class="info-item">
                <label>Email</label>
                <value>${currentUser.email}</value>
            </div>
            <div class="info-item">
                <label>Loại Tài Khoản</label>
                <value>${rankMap[currentUser.role] || 'Khách hàng'}</value>
            </div>
            <div class="info-item">
                <label>Hạng Thẻ</label>
                <value style="color: ${tier === 'gold' ? '#ffd700' : tier === 'silver' ? '#c0c0c0' : '#a67c52'};">${tierEmojis[tier]} Hạng ${tierNames[tier]}</value>
            </div>
            <div class="info-item">
                <label>Tổng Sách Đã Mượn</label>
                <value>${totalBorrowed}</value>
            </div>
            <div class="info-item">
                <label>Đang Mượn</label>
                <value style="color: ${currentlyBorrowing > 0 ? '#f39c12' : '#27ae60'};">${currentlyBorrowing}</value>
            </div>
            <div class="info-item">
                <label>Ngày Tham Gia</label>
                <value>${new Date().toLocaleDateString('vi-VN')}</value>
            </div>
        </div>
    `;
}

function loadBorrowingList() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const borrowing = cart.filter(item => item.status !== 'returned');
    const tbody = document.getElementById('borrowingBody');
    const empty = document.getElementById('borrowingEmpty');
    
    if (borrowing.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
    } else {
        tbody.innerHTML = borrowing.map((item, idx) => {
            const today = new Date();
            const dueDate = new Date(item.dueDate);
            const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const statusClass = item.status === 'pending' ? 'status-pending' : 
                               item.status === 'approved' ? 'status-approved' : 
                               isOverdue ? 'status-overdue' : 'status-approved';
            const statusText = isOverdue ? '⚠️ QUÁ HẠN' :
                              daysLeft <= 3 ? '🔔 SẮP HẾT HẠN' :
                              item.status === 'pending' ? 'Chờ duyệt' : 'Đang mượn';
            
            return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.borrowDate}</td>
                    <td>${item.dueDate}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button onclick="extendBorrow(${idx})" style="background:#3498db; color:white; border:none; padding:0.5rem 1rem; border-radius:0.3rem; cursor:pointer; margin-right:0.5rem;">Gia Hạn</button>
                    </td>
                </tr>
            `;
        }).join('');
        empty.style.display = 'none';
    }
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('favoritesEmpty');
    
    if (favorites.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
    } else {
        grid.innerHTML = favorites.map(fav => `
            <div style="background:#f9f9f9; padding:1rem; border-radius:0.5rem; text-align:center;">
                <p style="font-weight:bold; margin:0 0 0.5rem 0;">${fav.name}</p>
                <a href="book-details.html?id=${fav.id}" class="btn" style="display:inline-block;">Xem Chi Tiết</a>
            </div>
        `).join('');
        empty.style.display = 'none';
    }
}

function extendBorrow(idx) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const borrowing = cart.filter(item => item.status !== 'returned');
    const item = borrowing[idx];
    
    if (!item) return;
    
    const oldDueDate = new Date(item.dueDate);
    const newDueDate = new Date(oldDueDate);
    newDueDate.setDate(newDueDate.getDate() + 14); // Gia hạn 14 ngày
    
    item.dueDate = newDueDate.toISOString().split('T')[0];
    
    // Update in cart
    const cartIdx = cart.findIndex(c => c.id === item.id && c.borrowDate === item.borrowDate);
    if (cartIdx !== -1) {
        cart[cartIdx].dueDate = item.dueDate;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadBorrowingList();
    showNotification('✓ Gia hạn thành công! Hạn trả mới: ' + item.dueDate);
}

function changePassword(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới không khớp!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const userIdx = users.findIndex(u => u.email === currentUser.email && u.password === oldPassword);
    if (userIdx === -1) {
        alert('Mật khẩu cũ không đúng!');
        return;
    }
    
    users[userIdx].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('✓ Đổi mật khẩu thành công!');
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function switchSection(sectionId, element) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    element.classList.add('active');
    
    // Load data for section
    if (sectionId === 'borrowing') loadBorrowingList();
    if (sectionId === 'favorites') loadFavorites();
    if (sectionId === 'membership') loadMembershipTier();
}

function loadMembershipTier() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const tier = currentUser.membershipTier || 'bronze';
    
    const tierEmojis = { bronze: '🥉', silver: '🥈', gold: '🥇' };
    const tierNames = { bronze: 'Đồng', silver: 'Bạc', gold: 'Vàng' };
    
    document.getElementById('currentTierName').innerHTML = `${tierEmojis[tier]} Hạng ${tierNames[tier]}`;
    
    // Get tier config from script.js (need to access from parent window)
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
    
    document.getElementById('currentTierBenefit').innerHTML = tierConfig[tier].benefits;
    
    // Highlight current tier card
    ['bronze', 'silver', 'gold'].forEach(t => {
        const card = document.getElementById(`tier${t.charAt(0).toUpperCase() + t.slice(1)}Card`);
        const btn = document.getElementById(`tier${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
        if (t === tier) {
            card.style.borderWidth = '3px';
            card.style.background = '#e8f5e9';
            btn.textContent = '✓ Đang Dùng';
            btn.disabled = true;
        } else {
            card.style.borderWidth = '2px';
            card.style.background = 'white';
            btn.textContent = 'Chọn';
            btn.disabled = false;
        }
    });
}

function changeTier(newTier) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    currentUser.membershipTier = newTier;
    
    // Update in users array
    const userIdx = users.findIndex(u => u.email === currentUser.email);
    if (userIdx !== -1) {
        users[userIdx].membershipTier = newTier;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
    
    const tierNames = { bronze: 'Đồng', silver: 'Bạc', gold: 'Vàng' };
    alert(`✓ Nâng cấp thành công! Bạn đã chọn hạng ${tierNames[newTier]}`);
    
    loadMembershipTier();
}

function logout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}