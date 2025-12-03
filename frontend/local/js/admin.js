/* js/admin.js - Full Interactive Version with Role-Based Access */

// --- 1. PHÂN QUYỀN & KIỂM TRA ĐĂNG NHẬP ---
function checkAuthAndPermissions() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser || !['admin', 'librarian'].includes(currentUser.role)) {
    alert('Bạn không có quyền truy cập trang này!');
    window.location.href = 'index.html';
    return null;
  }
  
  const isAdmin = currentUser.role === 'admin';
  
  // Hiển thị thông tin user
  document.querySelector('.profile-info .name').textContent = currentUser.name;
  document.querySelector('.profile-info .role').textContent = isAdmin ? 'Quản lý' : 'Thủ thư';
  
  // Ẩn/hiện menu dựa trên role
  const staffMenuLabel = document.getElementById('staffMenuLabel');
  const menuEmployees = document.getElementById('menuEmployees');
  const menuAttendance = document.getElementById('menuAttendance');
  const menuShifts = document.getElementById('menuShifts');
  
  if (isAdmin) {
    // Admin: hiển thị tất cả
    if (staffMenuLabel) staffMenuLabel.style.display = 'block';
    if (menuEmployees) menuEmployees.style.display = 'block';
    if (menuAttendance) menuAttendance.style.display = 'block';
    if (menuShifts) menuShifts.style.display = 'block';
  } else {
    // Librarian: ẩn menu nhân sự
    if (staffMenuLabel) staffMenuLabel.style.display = 'none';
    if (menuEmployees) menuEmployees.style.display = 'none';
    if (menuAttendance) menuAttendance.style.display = 'none';
    if (menuShifts) menuShifts.style.display = 'none';
  }
  
  return currentUser;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// --- 2. DỮ LIỆU KHỞI TẠO ---
let booksData = [
    { id: 1, name: "Đắc Nhân Tâm", author: "Dale Carnegie", category: "Kỹ năng", qty: 15 },
    { id: 2, name: "Nhà Giả Kim", author: "Paulo Coelho", category: "Văn học", qty: 8 },
    { id: 3, name: "Cha Giàu Cha Nghèo", author: "Robert Kiyosaki", category: "Kinh tế", qty: 12 },
    { id: 4, name: "Clean Code", author: "Robert C. Martin", category: "Công nghệ", qty: 5 }
];

let loansData = [
    { id: "PM001", user: "Nguyễn Văn A", book: "Đắc Nhân Tâm", date: "2025-11-25", status: "borrowed" },
    { id: "PM002", user: "Trần Thị B", book: "Nhà Giả Kim", date: "2025-11-20", status: "returned" },
];

let readersData = [
    { id: "DG001", name: "Nguyễn Văn A", email: "vana@gmail.com", date: "2025-01-10", rank: "Vàng" },
    { id: "DG002", name: "Trần Thị B", email: "thib@gmail.com", date: "2025-02-15", rank: "Bạc" },
];

let employeesData = [
    { id: "NV01", name: "Admin User", role: "Quản lý", shift: "Full-time", status: "Đang làm" },
    { id: "NV02", name: "Lê Văn C", role: "Thủ thư", shift: "Sáng", status: "Đang làm" },
];

let attendanceData = [
    { id: "ATT001", emp: "NV01", empName: "Admin User", date: "2025-12-01", timeIn: "08:00", timeOut: "17:00" },
    { id: "ATT002", emp: "NV02", empName: "Lê Văn C", date: "2025-12-01", timeIn: "08:00", timeOut: "12:00" },
];

let shiftsData = [
    { id: "CA01", name: "Sáng", start: "08:00", end: "12:00" },
    { id: "CA02", name: "Chiều", start: "13:00", end: "17:00" },
    { id: "CA03", name: "Tối", start: "18:00", end: "22:00" },
];

// --- 3. KHỞI TẠO VÀ RENDER ---
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuthAndPermissions();
    if (!user) return;
    
    updateDashboardStats();
    renderAllTables();
});

function renderAllTables() {
    renderBookTable();
    renderLoanTable();
    renderReaderTable();
    renderEmployeeTable();
    renderAttendanceTable();
    renderShiftTable();
}

function updateDashboardStats() {
    document.getElementById('stat-books').innerText = booksData.length;
    // Đếm số phiếu đang mượn (status = borrowed)
    const borrowingCount = loansData.filter(l => l.status === 'borrowed').length;
    document.getElementById('stat-loans').innerText = borrowingCount;
    document.getElementById('stat-readers').innerText = readersData.length;
    document.getElementById('stat-employees').innerText = employeesData.length;
}

// --- 3. LOGIC RENDER TỪNG BẢNG ---

function renderBookTable() {
    const tbody = document.querySelector('#bookTable tbody');
    tbody.innerHTML = "";
    booksData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>#${item.id}</td>
                <td><b>${item.name}</b></td>
                <td>${item.author}</td>
                <td>${item.category}</td>
                <td>${item.qty}</td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('book', ${item.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderLoanTable() {
    const tbody = document.querySelector('#loanTable tbody');
    tbody.innerHTML = "";
    loansData.forEach(item => {
        let isBorrowed = item.status === 'borrowed';
        let statusHtml = isBorrowed 
            ? `<span class="status borrowed">Đang mượn</span>` 
            : `<span class="status returned">Đã trả</span>`;
        
        // Nút check để trả sách
        let actionBtn = isBorrowed
            ? `<button class="action-btn edit" title="Trả sách" onclick="returnBook('${item.id}')"><i class="fas fa-check-circle"></i></button>`
            : `<button class="action-btn edit" disabled style="opacity:0.3"><i class="fas fa-check-circle"></i></button>`;

        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.user}</td>
                <td>${item.book}</td>
                <td>${item.date}</td>
                <td>${statusHtml}</td>
                <td class="action-icons">
                    ${actionBtn}
                    <button class="action-btn delete" onclick="deleteItem('loan', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderReaderTable() {
    const tbody = document.querySelector('#readerTable tbody');
    tbody.innerHTML = "";
    readersData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.date}</td>
                <td><span style="color:var(--green); font-weight:bold">${item.rank}</span></td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('reader', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderEmployeeTable() {
    const tbody = document.querySelector('#employeeTable tbody');
    tbody.innerHTML = "";
    employeesData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.role}</td>
                <td>${item.shift}</td>
                <td><span style="color:green">${item.status}</span></td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('employee', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderAttendanceTable() {
    const tbody = document.querySelector('#attendanceTable tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    attendanceData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.emp}</td>
                <td>${item.empName}</td>
                <td>${item.date}</td>
                <td>${item.timeIn}</td>
                <td>${item.timeOut}</td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('attendance', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderShiftTable() {
    const tbody = document.querySelector('#shiftTable tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    shiftsData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.start}</td>
                <td>${item.end}</td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('shift', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

// --- 4. XỬ LÝ FORM SUBMIT (THÊM MỚI) ---
function handleFormSubmit(event, type) {
    event.preventDefault(); // Chặn load lại trang

    if (type === 'book') {
        const newBook = {
            id: booksData.length + 1,
            name: document.getElementById('bookName').value,
            author: document.getElementById('bookAuthor').value,
            category: document.getElementById('bookCategory').value,
            qty: document.getElementById('bookQty').value
        };
        booksData.push(newBook);
        closeModal('bookModal');
    } 
    else if (type === 'loan') {
        const newLoan = {
            id: "PM" + (loansData.length + 1).toString().padStart(3, '0'),
            user: document.getElementById('loanUser').value,
            book: document.getElementById('loanBook').value,
            date: document.getElementById('loanDate').value,
            status: 'borrowed'
        };
        loansData.push(newLoan);
        closeModal('loanModal');
    }
    else if (type === 'reader') {
        const newReader = {
            id: "DG" + (readersData.length + 1).toString().padStart(3, '0'),
            name: document.getElementById('readerName').value,
            email: document.getElementById('readerEmail').value,
            date: new Date().toISOString().split('T')[0], // Ngày hiện tại
            rank: document.getElementById('readerRank').value
        };
        readersData.push(newReader);
        closeModal('readerModal');
    }
    else if (type === 'employee') {
        const newEmp = {
            id: "NV" + (employeesData.length + 1).toString().padStart(2, '0'),
            name: document.getElementById('empName').value,
            role: document.getElementById('empRole').value,
            shift: document.getElementById('empShift').value,
            status: "Đang làm"
        };
        employeesData.push(newEmp);
        closeModal('employeeModal');
    }
    else if (type === 'attendance') {
        const newAtt = {
            id: "ATT" + (attendanceData.length + 1).toString().padStart(3, '0'),
            emp: document.getElementById('attEmp').value,
            empName: document.getElementById('attEmp').value,
            date: document.getElementById('attDate').value,
            timeIn: document.getElementById('attTimeIn').value,
            timeOut: document.getElementById('attTimeOut').value
        };
        attendanceData.push(newAtt);
        closeModal('attendanceModal');
    }
    else if (type === 'shift') {
        const newShift = {
            id: "CA" + (shiftsData.length + 1).toString().padStart(2, '0'),
            name: document.getElementById('shiftName').value,
            start: document.getElementById('shiftStart').value,
            end: document.getElementById('shiftEnd').value
        };
        shiftsData.push(newShift);
        closeModal('shiftModal');
    }

    // Reset form và vẽ lại bảng
    event.target.reset();
    renderAllTables();
    updateDashboardStats();
    alert("Thêm mới thành công!");
}

// --- 5. XỬ LÝ XÓA VÀ CẬP NHẬT ---

function deleteItem(type, id) {
    if (!confirm("Bạn có chắc chắn muốn xóa mục này?")) return;

    if (type === 'book') booksData = booksData.filter(x => x.id !== id);
    if (type === 'loan') loansData = loansData.filter(x => x.id !== id);
    if (type === 'reader') readersData = readersData.filter(x => x.id !== id);
    if (type === 'employee') employeesData = employeesData.filter(x => x.id !== id);
    if (type === 'attendance') attendanceData = attendanceData.filter(x => x.id !== id);
    if (type === 'shift') shiftsData = shiftsData.filter(x => x.id !== id);

    renderAllTables();
    updateDashboardStats();
}

function returnBook(loanId) {
    if (!confirm("Xác nhận độc giả đã trả sách?")) return;
    
    // Tìm phiếu mượn và đổi trạng thái
    const loanIndex = loansData.findIndex(l => l.id === loanId);
    if (loanIndex !== -1) {
        loansData[loanIndex].status = 'returned';
        renderAllTables();
        updateDashboardStats();
        alert("Đã cập nhật trạng thái: Đã trả sách");
    }
}

// --- 6. UTILITIES (MODAL & TAB) ---
function switchTab(tabId, element) {
    document.querySelectorAll('.section-content').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    if(element) element.classList.add('active');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}