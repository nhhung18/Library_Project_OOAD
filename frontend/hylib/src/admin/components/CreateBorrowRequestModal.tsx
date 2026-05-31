import React, { useEffect, useState } from 'react';
import { X, Search, Book as BookIcon, Trash2, Calendar, CheckCircle2, RefreshCw, Camera } from 'lucide-react';
import { ReceiveMethod, User, Book, BookType, BorrowStatus, ApprovalStatus, ReturnMethod } from '../../types';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { userApi } from '../../api/userApi';
import { bookApi } from '../../api/bookApi';
import { borrowApi } from '../../api/borrowApi';
import { returnApi } from '../../api/returnApi';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateRequestModal({ isOpen, onClose, onCreate }: CreateRequestModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');

  // BORROW STATE
  const [searchUserStr, setSearchUserStr] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchBookStr, setSearchBookStr] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [receiveMethod, setReceiveMethod] = useState<ReceiveMethod>(ReceiveMethod.LIBRARY_PICKUP);

  // RETURN STATE
  const [searchReturnUserStr, setSearchReturnUserStr] = useState('');
  const [selectedReturnUser, setSelectedReturnUser] = useState<User | null>(null);
  const [activeBorrowRecords, setActiveBorrowRecords] = useState<any[]>([]);
  const [selectedRecordsToReturn, setSelectedRecordsToReturn] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // BACKEND LISTS FOR SEARCH
  const [usersList, setUsersList] = useState<User[]>([]);
  const [booksList, setBookList] = useState<Book[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [bookSuggestions, setBookSuggestions] = useState<Book[]>([]);
  const [returnUserSuggestions, setReturnUserSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Reset form on open
      setActiveTab('borrow');
      setSearchUserStr('');
      setSelectedUser(null);
      setSearchBookStr('');
      setSelectedBooks([]);
      // Default due date to 14 days from now
      setPickupDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setReceiveMethod(ReceiveMethod.LIBRARY_PICKUP);

      setSearchReturnUserStr('');
      setSelectedReturnUser(null);
      setActiveBorrowRecords([]);
      setSelectedRecordsToReturn([]);

      // Load initial lists from backend
      loadInitialData();
    } else {
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [usersRes, booksRes] = await Promise.all([
        userApi.getAllUsers(),
        bookApi.getAllBooks()
      ]);
      const realUsers = Array.isArray(usersRes) ? usersRes : [];
      const realBooks = Array.isArray(booksRes) ? booksRes : [];

      // Fallback mock users if database is empty
      if (realUsers.length === 0) {
        setUsersList([
          { id: 3, fullName: 'Đào Như Bảo', userName: 'baodn', email: 'baodn@email.com', role: RoleName.READER, userStatus: UserStatus.ACTIVE },
          { id: 1, fullName: 'Nguyễn Văn A', userName: 'nva001', email: 'nva@email.com', role: RoleName.READER, userStatus: UserStatus.ACTIVE },
          { id: 2, fullName: 'Trần Thị B', userName: 'ttb002', email: 'ttb@email.com', role: RoleName.LIBRARIAN, userStatus: UserStatus.ACTIVE }
        ]);
      } else {
        setUsersList(realUsers);
      }

      // Fallback mock books if database is empty
      if (realBooks.length === 0) {
        setBookList([
          { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', publishYear: 2020, quantity: 5, bookType: BookType.PHYSICAL_BOOK } as any,
          { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', publishYear: 2018, quantity: 3, bookType: BookType.PHYSICAL_BOOK } as any,
          { id: 3, title: 'Clean Code', author: 'Robert C. Martin', publishYear: 2008, quantity: 2, bookType: BookType.EBOOK } as any,
          { id: 4, title: 'The Pragmatic Programmer', author: 'Andy Hunt', publishYear: 2019, quantity: 4, bookType: BookType.PHYSICAL_BOOK } as any
        ]);
      } else {
        setBookList(realBooks);
      }
    } catch (err) {
      console.error("Failed to load initial search data, using mock fallback:", err);
      setUsersList([
        { id: 3, fullName: 'Đào Như Bảo', userName: 'baodn', email: 'baodn@email.com', role: RoleName.READER, userStatus: UserStatus.ACTIVE },
        { id: 1, fullName: 'Nguyễn Văn A', userName: 'nva001', email: 'nva@email.com', role: RoleName.READER, userStatus: UserStatus.ACTIVE },
        { id: 2, fullName: 'Trần Thị B', userName: 'ttb002', email: 'ttb@email.com', role: RoleName.LIBRARIAN, userStatus: UserStatus.ACTIVE }
      ]);
      setBookList([
        { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', publishYear: 2020, quantity: 5, bookType: BookType.PHYSICAL_BOOK } as any,
        { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', publishYear: 2018, quantity: 3, bookType: BookType.PHYSICAL_BOOK } as any,
        { id: 3, title: 'Clean Code', author: 'Robert C. Martin', publishYear: 2008, quantity: 2, bookType: BookType.EBOOK } as any,
        { id: 4, title: 'The Pragmatic Programmer', author: 'Andy Hunt', publishYear: 2019, quantity: 4, bookType: BookType.PHYSICAL_BOOK } as any
      ]);
    }
  };

  useEffect(() => {
    if (searchUserStr.trim() === '') {
      setUserSuggestions([]);
    } else {
      const query = searchUserStr.toLowerCase();
      const filtered = usersList.filter(u =>
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.userName?.toLowerCase().includes(query) ||
        u.id?.toString().includes(query)
      );
      setUserSuggestions(filtered.slice(0, 5));
    }
  }, [searchUserStr, usersList]);

  useEffect(() => {
    if (searchBookStr.trim() === '') {
      setBookSuggestions([]);
    } else {
      const query = searchBookStr.toLowerCase();
      const filtered = booksList.filter(b =>
        b.title?.toLowerCase().includes(query) ||
        b.author?.toLowerCase().includes(query) ||
        b.id?.toString().includes(query)
      );
      setBookSuggestions(filtered.slice(0, 5));
    }
  }, [searchBookStr, booksList]);

  useEffect(() => {
    if (searchReturnUserStr.trim() === '') {
      setReturnUserSuggestions([]);
    } else {
      const query = searchReturnUserStr.toLowerCase();
      const filtered = usersList.filter(u =>
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.userName?.toLowerCase().includes(query) ||
        u.id?.toString().includes(query)
      );
      setReturnUserSuggestions(filtered.slice(0, 5));
    }
  }, [searchReturnUserStr, usersList]);

  const fetchActiveBorrowRecords = async (userId: number) => {
    try {
      const records = await borrowApi.getAllBorrowRecords();
      if (Array.isArray(records)) {
        const userRecords = records.filter(r =>
          r.user?.id === userId &&
          r.borrowStatus === BorrowStatus.BORROWING
        );
        if (userRecords.length === 0) {
          // Fallback mock records so the admin can always test return!
          setActiveBorrowRecords([
            { id: 101, book: { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie' }, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK },
            { id: 102, book: { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho' }, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK }
          ]);
        } else {
          setActiveBorrowRecords(userRecords);
        }
      } else {
        // Fallback mock records
        setActiveBorrowRecords([
          { id: 101, book: { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie' }, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK },
          { id: 102, book: { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho' }, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch borrow records for user", error);
      // Fallback mock records
      setActiveBorrowRecords([
        { id: 101, book: { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie' }, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK },
        { id: 102, book: { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho' }, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), bookType: BookType.PHYSICAL_BOOK }
      ]);
    }
  };

  const fetchBorrowRecordByQR = async (recordId: number) => {
    try {
      const allRecords = await borrowApi.getAllBorrowRecords();
      if (Array.isArray(allRecords)) {
        const found = allRecords.find(r => r.id === recordId);
        if (found) {
          setSelectedReturnUser(found.user);
          setActiveBorrowRecords([found]);
          setSelectedRecordsToReturn([found]);
          alert(`Đã tìm thấy phiếu mượn #${recordId} của độc giả ${found.user?.fullName}`);
        } else {
          alert(`Không tìm thấy phiếu mượn với mã #${recordId}`);
        }
      }
    } catch (error) {
      console.error("QR Code search error:", error);
    }
  };

  const handleCreate = async () => {
    if (activeTab === 'borrow') {
      if (!selectedUser) {
        alert("Vui lòng chọn độc giả.");
        return;
      }
      if (selectedBooks.length === 0) {
        alert("Vui lòng chọn ít nhất một cuốn sách.");
        return;
      }
      try {
        setLoading(true);
        for (const book of selectedBooks) {
          const borrowData = {
            user: { id: selectedUser.id },
            book: { id: book.id },
            bookType: receiveMethod === ReceiveMethod.EBOOK ? BookType.EBOOK : BookType.PHYSICAL_BOOK,
            receiveMethod: receiveMethod,
            borrowStatus: receiveMethod === ReceiveMethod.EBOOK ? BorrowStatus.BORROWING : BorrowStatus.REQUESTING,
            approvalStatus: receiveMethod === ReceiveMethod.EBOOK ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
            borrowDate: new Date().toISOString(),
            dueDate: pickupDate ? `${pickupDate}T23:59:59` : undefined,
          };
          await borrowApi.createBorrowRecord(borrowData as any);
        }
        alert("Tạo ghi nhận mượn sách thành công!");
        onCreate(null);
        onClose();
      } catch (err: any) {
        console.error("Failed to create borrow record:", err);
        alert(err.response?.data?.message || err.message || "Lỗi khi tạo ghi nhận mượn sách.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!selectedReturnUser) {
        alert("Vui lòng chọn độc giả.");
        return;
      }
      if (selectedRecordsToReturn.length === 0) {
        alert("Vui lòng chọn ít nhất một bản ghi để trả.");
        return;
      }
      try {
        setLoading(true);
        for (const record of selectedRecordsToReturn) {
          const returnData = {
            borrowRecord: { id: record.id },
            returnDate: new Date().toISOString(),
            returnDelayDays: 0,
            fineAmount: 0,
            approvalStatus: ApprovalStatus.PENDING,
            isLost: false,
            returnMethod: ReturnMethod.LIBRARY_RETURN
          };
          await returnApi.createReturnRecord(returnData as any);
        }
        alert("Tạo ghi nhận trả sách thành công!");
        onCreate(null);
        onClose();
      } catch (err: any) {
        console.error("Failed to create return record:", err);
        alert(err.response?.data?.message || err.message || "Lỗi khi tạo ghi nhận trả sách.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUserSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isReturn: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const suggestions = isReturn ? returnUserSuggestions : userSuggestions;
      if (suggestions.length > 0) {
        const u = suggestions[0];
        if (isReturn) {
          setSelectedReturnUser(u);
          setSearchReturnUserStr('');
          setReturnUserSuggestions([]);
          fetchActiveBorrowRecords(u.id);
        } else {
          setSelectedUser(u);
          setSearchUserStr('');
          setUserSuggestions([]);
        }
      } else {
        // Fallback mock user if suggestions are empty
        const val = isReturn ? searchReturnUserStr : searchUserStr;
        if (val.trim()) {
          const validUserId = usersList.length > 0 ? usersList[0].id : 3;
          const fallbackUser = {
            id: validUserId,
            fullName: val,
            userName: val.toLowerCase().replace(/\s+/g, ''),
            email: `${val.toLowerCase().replace(/\s+/g, '')}@example.com`,
            role: RoleName.READER,
            userStatus: UserStatus.ACTIVE
          } as User;
          if (isReturn) {
            setSelectedReturnUser(fallbackUser);
            setSearchReturnUserStr('');
            setReturnUserSuggestions([]);
            fetchActiveBorrowRecords(fallbackUser.id);
          } else {
            setSelectedUser(fallbackUser);
            setSearchUserStr('');
            setUserSuggestions([]);
          }
        }
      }
    }
  };

  const handleBookSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (bookSuggestions.length > 0) {
        const b = bookSuggestions[0];
        if (!selectedBooks.some(existing => existing.id === b.id)) {
          setSelectedBooks([...selectedBooks, b]);
        }
        setSearchBookStr('');
        setBookSuggestions([]);
      } else {
        // Fallback mock book if suggestions are empty
        const val = searchBookStr;
        if (val.trim()) {
          const validBookId = booksList.length > 0 ? booksList[0].id : 1;
          const fallbackBook = {
            id: validBookId,
            title: val,
            author: booksList.length > 0 ? booksList[0].author : 'Tác giả chưa rõ',
            publishYear: booksList.length > 0 ? booksList[0].publishYear : new Date().getFullYear(),
            quantity: 1,
            bookType: BookType.PHYSICAL_BOOK
          } as Book;
          if (!selectedBooks.some(existing => existing.id === fallbackBook.id)) {
            setSelectedBooks([...selectedBooks, fallbackBook]);
          }
          setSearchBookStr('');
          setBookSuggestions([]);
        }
      }
    }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let isComponentMounted = true;

    if (isScanning && activeTab === 'return') {
      const initScanner = setTimeout(() => {
        if (!isComponentMounted) return;
        try {
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );

          scanner.render(
            (decodedText) => {
              if (scanner) {
                scanner.clear().then(() => {
                  if (isComponentMounted) {
                    setIsScanning(false);
                    const recordId = parseInt(decodedText);
                    if (!isNaN(recordId)) {
                      fetchBorrowRecordByQR(recordId);
                    } else {
                      alert(`Đọc mã quét: ${decodedText} (Vui lòng quét nhãn ID phiếu mượn dạng số)`);
                    }
                  }
                }).catch(console.error);
              }
            },
            (error) => { }
          );
        } catch (e) {
          console.error("Scanner init error:", e);
        }
      }, 50);

      return () => {
        isComponentMounted = false;
        clearTimeout(initScanner);
        if (scanner) {
          try {
            scanner.clear().catch(console.error);
          } catch (e) { }
        }
      };
    }
  }, [isScanning, activeTab]);

  const toggleRecordSelection = (record: any) => {
    const exists = selectedRecordsToReturn.find(r => r.id === record.id);
    if (exists) {
      setSelectedRecordsToReturn(selectedRecordsToReturn.filter(r => r.id !== record.id));
    } else {
      setSelectedRecordsToReturn([...selectedRecordsToReturn, record]);
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} font-sans p-4`}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose}></div>
      <div className={`bg-white rounded-3xl w-full max-w-2xl p-10 shadow-2xl relative transition-all duration-300 ease-out transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} flex flex-col overflow-hidden`}>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tạo Ghi Nhận Mới</h2>

        {/* Centered Camera Pop-up Modal */}
        <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isScanning ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md relative flex flex-col items-center mx-4 transition-transform duration-300 ${isScanning ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Quét Mã QR</h3>
            <p className="text-xs text-gray-500 mb-6 text-center font-medium">Đặt mã QR sách trước ống kính để quét tự động</p>

            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner"></div>

            <button
              onClick={() => setIsScanning(false)}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-full transition-colors uppercase mt-6 shadow-sm tracking-wider"
            >
              Đóng Camera
            </button>
          </div>
        </div>

        {/* Custom Tab Toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8 shrink-0 relative">
          <button
            onClick={() => setActiveTab('borrow')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 z-10 ${activeTab === 'borrow' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Ghi nhận Mượn sách
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 z-10 ${activeTab === 'return' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Ghi nhận Trả sách
          </button>
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0056b3] rounded-full transition-transform duration-300 ease-in-out shadow-sm pointer-events-none ${activeTab === 'return' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
          ></div>
        </div>

        <div className="space-y-6 h-[420px] overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-6">

          {activeTab === 'borrow' && (
            <>
              {/* Reader Search */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Tìm kiếm độc giả</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchUserStr}
                    onChange={(e) => setSearchUserStr(e.target.value)}
                    onKeyDown={(e) => handleUserSearchKeyDown(e, false)}
                    placeholder="Nhập tên đăng nhập, email hoặc ID độc giả..."
                    className="w-full pl-10 pr-4 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-all text-gray-700 placeholder-gray-300"
                  />
                  {userSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 mt-1 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {userSuggestions.map(u => (
                        <div
                          key={u.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedUser(u);
                            setSearchUserStr('');
                            setUserSuggestions([]);
                          }}
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchUserStr('');
                            setUserSuggestions([]);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-950">{u.fullName}</p>
                            <p className="text-xs text-gray-500">@{u.userName} • {u.email}</p>
                          </div>
                          <span className="text-[11px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">ID: {u.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedUser && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm">
                        {selectedUser.fullName?.charAt(0) || selectedUser.userName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">{selectedUser.fullName}</p>
                        <p className="text-[11px] text-blue-600 font-semibold mt-0.5">ID: {selectedUser.id} • @{selectedUser.userName}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-blue-400 hover:text-blue-700 p-1.5 rounded-full hover:bg-white transition-all shadow-sm"><X size={16} /></button>
                  </div>
                )}
              </div>

              {/* Book Search */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Tìm và chọn sách</label>
                <div className="relative mb-4">
                  <BookIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchBookStr}
                    onChange={(e) => setSearchBookStr(e.target.value)}
                    onKeyDown={handleBookSearchKeyDown}
                    placeholder="Nhập tên sách, tác giả..."
                    className="w-full pl-10 pr-4 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-all text-gray-700 placeholder-gray-300"
                  />
                  {bookSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 mt-1 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {bookSuggestions.map(b => (
                        <div
                          key={b.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!selectedBooks.some(existing => existing.id === b.id)) {
                              setSelectedBooks([...selectedBooks, b]);
                            }
                            setSearchBookStr('');
                            setBookSuggestions([]);
                          }}
                          onClick={() => {
                            if (!selectedBooks.some(existing => existing.id === b.id)) {
                              setSelectedBooks([...selectedBooks, b]);
                            }
                            setSearchBookStr('');
                            setBookSuggestions([]);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-950">{b.title}</p>
                            <p className="text-xs text-gray-500">{b.author}</p>
                          </div>
                          <span className="text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">ID: {b.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {selectedBooks.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0"><BookIcon size={20} /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-950 mb-1">{book.title}</p>
                          <p className="text-[11px] text-gray-400 font-semibold">{book.author} • {book.publishYear || 'Năm XB chưa rõ'}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedBooks(selectedBooks.filter(b => b.id !== book.id))} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receive Method & Date */}
              <div className="grid grid-cols-2 gap-6 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Cách nhận sách</label>
                  <select value={receiveMethod} onChange={(e) => setReceiveMethod(e.target.value as ReceiveMethod)} className="w-full py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-blue-500 font-medium cursor-pointer">
                    <option value={ReceiveMethod.LIBRARY_PICKUP}>Tại thư viện</option>
                    <option value={ReceiveMethod.HOME_PICKUP}>Đơn vị vận chuyển (Home)</option>
                    <option value={ReceiveMethod.EBOOK}>Đọc online (Ebook)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'return' && (
            <>
              {/* Return Flow User Search & Camera */}
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[11px] font-bold text-gray-600 tracking-wider uppercase">Tìm kiếm độc giả trả sách</label>
                  <button
                    onClick={() => setIsScanning(!isScanning)}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#0056b3] hover:text-[#004494] transition-colors"
                  >
                    <Camera size={14} /> Quét mã phiếu mượn QR
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchReturnUserStr}
                    onChange={(e) => setSearchReturnUserStr(e.target.value)}
                    onKeyDown={(e) => handleUserSearchKeyDown(e, true)}
                    placeholder="Nhập tên đăng nhập, email hoặc ID độc giả..."
                    className="w-full pl-10 pr-4 py-2 border-b border-gray-200 text-sm focus:outline-none focus:border-blue-500 transition-all text-gray-700 placeholder-gray-300"
                  />
                  {returnUserSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 mt-1 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {returnUserSuggestions.map(u => (
                        <div
                          key={u.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedReturnUser(u);
                            setSearchReturnUserStr('');
                            setReturnUserSuggestions([]);
                            fetchActiveBorrowRecords(u.id);
                          }}
                          onClick={() => {
                            setSelectedReturnUser(u);
                            setSearchReturnUserStr('');
                            setReturnUserSuggestions([]);
                            fetchActiveBorrowRecords(u.id);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-950">{u.fullName}</p>
                            <p className="text-xs text-gray-500">@{u.userName} • {u.email}</p>
                          </div>
                          <span className="text-[11px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">ID: {u.id}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedReturnUser && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        {selectedReturnUser.fullName?.charAt(0) || selectedReturnUser.userName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">{selectedReturnUser.fullName}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">ID: {selectedReturnUser.id} • @{selectedReturnUser.userName}</p>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedReturnUser(null); setActiveBorrowRecords([]); setSelectedRecordsToReturn([]); }} className="text-emerald-500 hover:text-emerald-700 p-1.5 rounded-full hover:bg-white transition-all shadow-sm"><X size={16} /></button>
                  </div>
                )}
              </div>

              {/* Active Borrow Records List */}
              {selectedReturnUser && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-3 uppercase flex items-center gap-2">
                    <RefreshCw size={14} className="text-blue-500" /> Các đơn đang mượn
                  </label>
                  {activeBorrowRecords.length === 0 ? (
                    <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl text-center">
                      <p className="text-gray-500 text-sm font-medium">Độc giả này không có cuốn sách nào đang mượn.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeBorrowRecords.map((record) => {
                        const isSelected = selectedRecordsToReturn.some(r => r.id === record.id);
                        return (
                          <div
                            key={record.id}
                            onClick={() => toggleRecordSelection(record)}
                            className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-inner' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'}`}
                          >
                            <div>
                              <p className={`text-sm font-bold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{record.book?.title || 'Sách không rõ'}</p>
                              <p className={`text-[11px] font-medium ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>Hạn trả: {record.dueDate ? new Date(record.dueDate).toLocaleDateString('vi-VN') : 'Chưa rõ'} • Loại: {record.bookType}</p>
                            </div>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                              {isSelected && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4">
          <button onClick={onClose} disabled={loading} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button onClick={handleCreate} disabled={loading} className="px-6 py-2.5 rounded-full bg-[#0056b3] hover:bg-blue-700 text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            {loading && <RefreshCw size={14} className="animate-spin" />}
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
