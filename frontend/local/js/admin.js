// --- 1. DỮ LIỆU KHỞI TẠO ---
let booksData = [];

let loansData = [];

let readersData = [];

let employeesData = [];

// --- 2. KHỞI TẠO VÀ RENDER ---
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats(); // Cập nhật số liệu thống kê
    renderAllTables();      // Vẽ tất cả các bảng
});

function renderAllTables() {
    renderBookTable();
    renderLoanTable();
    // always pass the current readersData so renderReaderTable has a defined array
    renderReaderTable(readersData);
    renderEmployeeTable();
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
    // show a friendly message if no books
    if (!Array.isArray(booksData) || booksData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Hiện không có sách trong kho</td></tr>`;
        return;
    }
    booksData.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>#${item.id}</td>
                <td>${item.userName}</td>
                <td>${item.fullName}</td>
                <td>${item.email}</td>
                <td>${item.roleId}</td>
                <td>${item.phoneNum}</td>
                <td>${item.createAt}</td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('book', ${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}


function renderLoanTable() {
    const tbody = document.querySelector('#loanTable tbody');
    tbody.innerHTML = "";
    // show a friendly message if no loans
    if (!Array.isArray(loansData) || loansData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Hiện không có phiếu mượn / trả</td></tr>`;
        return;
    }
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


// RENDER READERS
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('menu-readers').addEventListener('click', function(e) {
    e.preventDefault();
    const el = this;
    try {
      switchTab('readers', el);  // hiện khu vực trước
      loadReaders();        // load dữ liệu (không cần await)
    } catch (err) {
      console.error('handle click error:', err);
    }
  });
});

async function loadReaders() {
    try {
        const res = await fetch("http://localhost:8080/api/users/customers?sort=createAt");
        const json = await res.json();

        // API may return { data: { content: [...] } } or directly return an array
        const data = json?.data?.content ?? json;

        if (!Array.isArray(data)) {
            console.error("Dữ liệu API không phải array:", data);
            return;
        }

        // update the shared readersData and re-render (apply current sort)
        readersData = data;
        applyReaderSortAndRender();
    } catch (err) {
        console.error('loadReaders error:', err);
    }
}

function renderReaderTable(data = readersData) {
    const tbody = document.querySelector('#readerTable tbody');
    tbody.innerHTML = "";
    // ensure data is an array
    if (!Array.isArray(data)) {
        console.error('renderReaderTable expected array but got', data);
        tbody.innerHTML = `<tr><td colspan="8" class="no-data">Không thể tải danh sách độc giả</td></tr>`;
        return;
    }

    // no-data message when there are zero readers
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="no-data">Hiện không có Khách hoặc Độc giả nào trong hệ thống</td></tr>`;
        return;
    }
    data.forEach(item => {
        // normalize/format role for display (roleId may be numeric or a string code)
        const rawRole = (item.roleId ?? item.role ?? '').toString();
        let roleLabel;
        switch (rawRole.toLowerCase()) {
            case '8':
                roleLabel = 'Độc giả';
                break;
            case '9':
                roleLabel = 'Khách';
                break;
            default:
                roleLabel = rawRole || 'Không xác định';
        }
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td title="${escapeHtml(String(item.userName ?? ''))}">${item.userName}</td>
                let currentReaderSort = 'none';
                <td title="${escapeHtml(String(item.fullName ?? ''))}">${item.fullName}</td>
                <td title="${escapeHtml(String(item.email ?? ''))}">${item.email}</td>
                <td title="${escapeHtml(String(item.phoneNum ?? ''))}">${item.phoneNum}</td>
                <td title="${escapeHtml(String(roleLabel))}">${roleLabel}</td>
                <td title="${escapeHtml(String(item.createAt ?? ''))}">${item.createAt}</td>
                    // hook up reader sort select (if present)
                    const sortEl = document.getElementById('readerSort');
                    if (sortEl) {
                        sortEl.addEventListener('change', (e) => {
                            currentReaderSort = e.target.value;
                            applyReaderSortAndRender();
                        });
                    }

                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('reader', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}


// RENDER EMPLOYEE
document.addEventListener('DOMContentLoaded', () => {
    const menuEmp = document.getElementById('menu-employees');
    if (menuEmp) {
        menuEmp.addEventListener('click', function(e) {
    e.preventDefault();
    const el = this;
    try {
      switchTab('employees', el);  // hiện khu vực trước
      loadEmployees();        // load dữ liệu (không cần await)
    } catch (err) {
      console.error('handle click error:', err);
    }
        });
    }
});

async function loadEmployees() {
    try {
        const res = await fetch("http://localhost:8080/api/users/staffs");
        const json = await res.json();

        // API may return { data: { content: [...] } } or directly return an array
        const data = json?.data?.content ?? json;

        if (!Array.isArray(data)) {
            console.error("Dữ liệu API không phải array:", data);
            return;
        }

        // update the shared readersData and re-render
        employeesData = data;
        renderEmployeeTable(employeesData);
    } catch (err) {
        console.error('loadEmployees error:', err);
    }
}

function renderEmployeeTable(data = employeesData) {
    const tbody = document.querySelector('#employeeTable tbody');
    tbody.innerHTML = "";
    // ensure data is an array
    if (!Array.isArray(data)) {
        console.error('renderReaderTable expected array but got', data);
        tbody.innerHTML = `<tr><td colspan="8" class="no-data">Không thể tải danh sách độc giả</td></tr>`;
        return;
    }

    // no-data message when there are zero employees
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Hiện không có nhân sự nào trong hệ thống</td></tr>`;
        return;
    }
    data.forEach(item => {
        // normalize/format role for display
        const rawRole = (item.roleId ?? item.role ?? '').toString();
        let roleLabel;
        switch (rawRole.toLowerCase()) {
            case '1':
                roleLabel = 'Quản lý';
                break;
            case '2':
                roleLabel = 'Nhân viên';
                break;
            default:
                roleLabel = rawRole || 'Không xác định';
        }
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td title="${escapeHtml(String(item.userName ?? ''))}">${item.userName}</td>
                <td title="${escapeHtml(String(item.fullName ?? ''))}">${item.fullName}</td>
                <td title="${escapeHtml(String(item.email ?? ''))}">${item.email}</td>
                <td title="${escapeHtml(String(item.phoneNum ?? ''))}">${item.phoneNum}</td>
                <td title="${escapeHtml(String(roleLabel))}">${roleLabel}</td>
                <td title="${escapeHtml(String(item.createAt ?? ''))}">${item.createAt}</td>
                <td class="action-icons">
                    <button class="action-btn delete" onclick="deleteItem('employee', '${item.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}



                function applyReaderSortAndRender() {
                    // compute a sorted copy according to currentReaderSort
                    if (!Array.isArray(readersData)) return renderReaderTable([]);

                    const arr = [...readersData];
                    switch (currentReaderSort) {
                        case 'id':
                            arr.sort((a,b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
                            break;
                        case 'username':
                            arr.sort((a,b) => String(a.userName ?? '').localeCompare(String(b.userName ?? '')));
                            break;
                        case 'fullname':
                            arr.sort((a,b) => String(a.fullName ?? '').localeCompare(String(b.fullName ?? '')));
                            break;
                        case 'email':
                            arr.sort((a,b) => String(a.email ?? '').localeCompare(String(b.email ?? '')));
                            break;
                        case 'role':
                            arr.sort((a,b) => String((a.roleId ?? a.role ?? '')).localeCompare(String((b.roleId ?? b.role ?? ''))));
                            break;
                        case 'createAt':
                            // newest first
                            arr.sort((a,b) => new Date(b.createAt || 0) - new Date(a.createAt || 0));
                            break;
                        case 'none':
                        default:
                            // keep original order
                            break;
                    }

                    renderReaderTable(arr);
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
        // read the new form field ids from admin.html
        const userName = document.getElementById('readerUserName')?.value || '';
        const fullName = document.getElementById('readerFullName')?.value || '';
        const email = document.getElementById('readerEmail')?.value || '';
        const phoneNum = document.getElementById('readerPhone')?.value || '';
        const address = document.getElementById('readerAddress')?.value || '';
        const roleValue = document.getElementById('readerRole')?.value || '';

        const newReader = {
            id: "DG" + (readersData.length + 1).toString().padStart(3, '0'),
            userName,
            fullName,
            email,
            phoneNum,
            address,
            // store role as whatever the select returns (string code or numeric)
            roleId: roleValue || 'GUEST',
            // store created at (date string)
            createAt: new Date().toISOString().split('T')[0]
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

// helper to escape html when inserting into title attribute
function escapeHtml(str) {
    return String(str).replace(/[&<>\"']/g, function (s) {
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s];
    });
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}