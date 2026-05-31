import React, { useState, useEffect, startTransition } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

// Components
import Header from './components/Header';
import { LoginModal, RegisterModal, OTPModal } from './components/AuthModals';
import { ToastNotification } from './components/ToastNotification';

// Pages
import HomeView from './pages/HomeView';
import SupportView from './pages/SupportView';
import BooksView from './pages/BooksView';
import MyBooksView from './pages/MyBooksView';
import FavoritesView from './pages/FavoritesView';
import CartView from './pages/CartView';
import MembershipView from './pages/MembershipView';
import MembershipDetailView from './pages/MembershipDetailView';
import ProfileView from './pages/ProfileView';
import BookDetailView from './pages/BookDetailView';
import LateFinePaymentView from './pages/LateFinePaymentView';
import ReaderView from './pages/ReaderView';
import BankPaymentView from './pages/BankPaymentView';
import BorrowConfirmationView from './pages/BorrowConfirmationView';
import ReturnConfirmationView from './pages/ReturnConfirmationView';

// Types
import { Notification, UserProfile, Book, BorrowedBook, BorrowRecord } from './types';

import AdminApp from './admin/App';
import { borrowApi } from './api/borrowApi';
import { returnApi } from './api/returnApi';
import { shipmentApi } from './api/shipmentApi';
import { cartApi } from './api/cartApi';
import { BookType } from './types';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActivePageName = (path: string) => {
    if (path === '/') return 'Khám phá';
    if (path === '/support') return 'Hỗ trợ';
    if (path === '/books') return 'Sách';
    if (path.startsWith('/books/')) return 'Chi tiết sách';
    if (path === '/my-books') return 'Sách của tôi';
    if (path === '/favorites') return 'Yêu thích';
    if (path === '/cart') return 'Giỏ sách';
    if (path === '/membership') return 'Thẻ thành viên';
    if (path === '/membership/detail') return 'Chi tiết thẻ thành viên';
    if (path === '/profile') return 'Cài đặt tài khoản';
    if (path === '/payment/fine') return 'Nộp phạt';
    if (path.startsWith('/reader/')) return 'Đọc sách';
    if (path === '/payment/bank') return 'Thanh toán qua ngân hàng';
    if (path === '/borrow-confirm') return 'Xác nhận mượn';
    if (path === '/return-confirm') return 'Xác nhận trả';
    return 'Khám phá';
  };
  const activePage = getActivePageName(location.pathname);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isOTPOpen, setIsOTPOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Đăng nhập thành công!');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [borrowMode, setBorrowMode] = useState<'ebook' | 'offline'>('ebook');
  const [selectedBorrowedBook, setSelectedBorrowedBook] = useState<BorrowedBook | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('30.000 VNĐ');
  const [paymentBackPage, setPaymentBackPage] = useState('Xác nhận mượn');
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('Mượn thành công!');
  const [lateFineReturnMethod, setLateFineReturnMethod] = useState('Trả tại thư viện');
  const [upgradePlan, setUpgradePlan] = useState<string | null>(null);
  const [successConfirmText, setSuccessConfirmText] = useState('Hoàn thành');
  const [currentMembershipPlan, setCurrentMembershipPlan] = useState<string | null>(null);
  const [membershipExpiry, setMembershipExpiry] = useState('12/05/2027');
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Hết hạn vào ngày mai',
      message: 'Cuốn "The Art of Stillness" của bạn sẽ hết hạn vào ngày mai. Hãy gia hạn hoặc trả sách ngay.',
      time: '2 phút trước',
      isRead: false,
      type: 'warning',
      targetPage: 'Sách của tôi'
    },
    {
      id: '2',
      title: 'Yêu cầu được chấp nhận',
      message: 'Yêu cầu mượn cuốn "Design Systems" đã thành công. Bạn có thể bắt đầu đọc ngay.',
      time: '1 giờ trước',
      isRead: false,
      type: 'success',
      targetPage: 'Sách của tôi'
    },
    {
      id: '3',
      title: 'Sách mới trong kho',
      message: 'Cuốn "A New Earth" vừa cập bến. Khám phá nội dung ngay để không bỏ lỡ.',
      time: '5 giờ trước',
      isRead: true,
      type: 'info',
      targetPage: 'Chi tiết sách',
      targetId: 'earth'
    },
  ]);

  const handleNotificationClick = (notif: Notification) => {
    if (notif.targetPage === 'Chi tiết sách' && notif.targetId) {
      setSelectedBookId(notif.targetId);
      navigate(`/books/${notif.targetId}`);
    } else if (notif.targetPage) {
      handleSetActivePage(notif.targetPage);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // User Profile State
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'ĐÀO NHƯ BẢO',
    email: 'a48009@thanglong.edu.vn',
    phone: '0325 784 777',
    birthDate: '01/01/1990',
    address: '123 Đường Sách, Quận 1, TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&h=256&auto=format&fit=crop'
  });

  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([
    { id: 1, title: 'The Art of Stillness', image: 'https://picsum.photos/seed/stillness/100/100', type: 'Ebook' },
    { id: 2, title: 'Thinking, Fast and Slow', image: 'https://picsum.photos/seed/think/100/100', type: 'Sách giấy' },
  ]);

  const [cartBooks, setCartBooks] = useState<any[]>([
    { id: 1, title: 'The Art of Stillness', image: 'https://picsum.photos/seed/stillness/100/100', type: 'Ebook' },
    { id: 2, title: 'Thinking, Fast and Slow', image: 'https://picsum.photos/seed/think/100/100', type: 'Sách giấy' },
  ]);

  const [books, setBooks] = useState<BorrowedBook[]>([]);

  const fetchBorrowRecords = async () => {
    if (isLoggedIn) {
      try {
        const [borrowResponse, returnResponse] = await Promise.all([
          borrowApi.getAllBorrowRecords(),
          returnApi.getAllReturnRecords()
        ]);

        const returnRecords = Array.isArray(returnResponse) ? returnResponse : [];

        if (Array.isArray(borrowResponse)) {
          const userRecords = borrowResponse.filter((record: BorrowRecord) => record.user?.id === 3);
          const fetchedBooks: BorrowedBook[] = userRecords.map((record: BorrowRecord) => {
            let statusLabel = '';
            let statusColor = 'text-gray-900';

            if (record.borrowStatus === 'BORROWING') {
              statusLabel = 'Đang mượn';
              statusColor = 'text-blue-500';
            } else if (record.borrowStatus === 'RETURNED') {
              statusLabel = 'Đã trả sách';
              statusColor = 'text-green-500';
            } else if (record.borrowStatus === 'REQUESTING') {
              statusLabel = 'Chờ duyệt';
              statusColor = 'text-yellow-600';
            } else if (record.borrowStatus === 'AUTO_RETURNED') {
              statusLabel = 'Tự động trả';
              statusColor = 'text-red-500';
            } else {
              statusLabel = record.borrowStatus;
            }

            // Find corresponding return record
            const matchingReturn = returnRecords.find((r: any) => r.borrowRecord?.id === record.id);

            let actions: string[] = [];
            if (record.approvalStatus === 'REJECTED') {
              actions = ['Xóa'];
            } else if (record.borrowStatus === 'RETURNED') {
              actions = ['Đọc disabled', 'Trả sách disabled', 'Xóa'];
            } else if (record.borrowStatus === 'OVERDUE') {
              actions = ['Thanh toán'];
            } else {
              actions = ['Gia hạn', 'Trả sách'];
              if (record.bookType === 'EBOOK' || record.bookType === 'BOTH') {
                actions.unshift('Đọc');
              }
              if (record.approvalStatus === 'PENDING') {
                actions = ['Hủy'];
              }
            }

            return {
              id: record.book.id,
              recordId: record.id,
              returnRecordId: matchingReturn?.id,
              image: record.book.imageUrl || `https://picsum.photos/seed/${record.book.id}/400/533`,
              title: record.book.title,
              author: record.book.author,
              type: record.bookType === 'EBOOK' ? 'Ebook' : 'Sách giấy',
              expiryDate: record.dueDate,
              renewCount: `${record.renew}/2`,
              status: statusLabel,
              statusColor: statusColor,
              approvalStatus: record.approvalStatus,
              actions: actions,
              // Add missing Book fields from backend model to conform to BorrowedBook intersection type
              publisher: record.book.publisher,
              publishYear: record.book.publishYear,
              category: record.book.category,
              description: record.book.description,
              bookType: record.book.bookType,
              likes: record.book.likes,
              condition: record.book.condition,
              quantity: record.book.quantity,
              bookUrl: record.book.bookUrl,
              imageUrl: record.book.imageUrl,
              avgRating: record.book.avgRating,
              replacementPrice: record.book.replacementPrice,
            };
          });
          setBooks(fetchedBooks);
        }
      } catch (error) {
        console.error("Failed to fetch borrow records", error);
      }
    }
  };

  const handleDeleteRecord = async (book: BorrowedBook) => {
    try {
      if (book.recordId) {
        await borrowApi.deleteBorrowRecord(book.recordId);
        setBooks(prev => prev.filter(b => b.recordId !== book.recordId));
      }
    } catch (error) {
      console.error("Failed to delete record", error);
    }
  };

  const fetchCartItems = async () => {
    if (isLoggedIn) {
      try {
        const cart = await cartApi.getCartByUserId(3); // Mock user ID 3
        if (cart && cart.id) {
          const items = await cartApi.getCartItemsByCartId(cart.id);
          const mapped = items.map(item => ({
            id: item.id,
            bookId: item.bookId,
            title: item.book?.title || 'Sách không rõ',
            image: item.book?.imageUrl || `https://picsum.photos/seed/${item.bookId}/100/100`,
            type: item.bookType === 'EBOOK' ? 'Ebook' : 'Sách giấy',
          }));
          setCartBooks(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch cart items", error);
      }
    } else {
      setCartBooks([]);
    }
  };

  const handleAddToCart = async (bookId: number, type: 'Ebook' | 'Sách giấy') => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const cart = await cartApi.getCartByUserId(3);
      if (cart && cart.id) {
        const isAlreadyInCart = cartBooks.some(b => b.bookId === bookId && b.type === type);
        if (isAlreadyInCart) {
          setSuccessMessage('Cuốn sách này đã có trong giỏ hàng!');
          setIsSuccessOpen(true);
          return;
        }

        const bookType = type === 'Ebook' ? BookType.EBOOK : BookType.PHYSICAL_BOOK;
        await cartApi.createCartItem({
          cartId: cart.id,
          bookId: bookId,
          bookType: bookType,
        });

        await fetchCartItems();
        setSuccessMessage('Đã thêm sách vào giỏ hàng thành công!');
        setIsSuccessOpen(true);
      }
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      setSuccessMessage(error?.response?.data?.message || 'Không thể thêm sách vào giỏ hàng.');
      setIsSuccessOpen(true);
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    try {
      await cartApi.deleteCartItem(cartItemId);
      await fetchCartItems();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      const cart = await cartApi.getCartByUserId(3);
      if (cart && cart.id) {
        const items = await cartApi.getCartItemsByCartId(cart.id);
        await Promise.all(items.map(item => cartApi.deleteCartItem(item.id)));
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleUpdateCartItemType = async (cartItemId: number, newType: 'Ebook' | 'Sách giấy') => {
    try {
      const bookType = newType === 'Ebook' ? 'EBOOK' : 'PHYSICAL_BOOK';
      await cartApi.updateCartItem(cartItemId, { bookType: bookType as any });
      await fetchCartItems();
    } catch (error) {
      console.error('Failed to update cart item type:', error);
    }
  };

  useEffect(() => {
    fetchBorrowRecords();
    fetchCartItems();
  }, [isLoggedIn]);

  const handleSetActivePage = (page: string) => {
    const protectedPages = ['Sách của tôi', 'Yêu thích', 'Giỏ sách', 'Thẻ thành viên', 'Cài đặt tài khoản'];
    if (!isLoggedIn && protectedPages.includes(page)) {
      setIsLoginOpen(true);
    } else {
      const pageToPath: Record<string, string> = {
        'Khám phá': '/',
        'Hỗ trợ': '/support',
        'Sách': '/books',
        'Sách của tôi': '/my-books',
        'Yêu thích': '/favorites',
        'Giỏ sách': '/cart',
        'Thẻ thành viên': '/membership',
        'Chi tiết thẻ thành viên': '/membership/detail',
        'Cài đặt tài khoản': '/profile',
        'Chi tiết sách': `/books/${selectedBookId || 'default'}`,
        'Nộp phạt': '/payment/fine',
        'Đọc sách': `/reader/${selectedBookId || 'default'}`,
        'Thanh toán qua ngân hàng': '/payment/bank',
        'Xác nhận mượn': '/borrow-confirm',
        'Xác nhận trả': '/return-confirm',
      };
      navigate(pageToPath[page] || '/');
    }
  };

  const handleBookClick = (id: number | string) => {
    setSelectedBookId(id.toString());
    navigate(`/books/${id}`);
  };

  const handleConfirmBorrow = async (paymentMethod: string, amount: string = '30.000 VNĐ', deliveryMethod: string = 'library') => {
    try {
      // Call API to create borrow record
      const borrowData = {
        user: { id: 3 }, // Mock user ID 3
        book: { id: Number(selectedBookId) },
        bookType: borrowMode === 'ebook' ? 'EBOOK' : 'PHYSICAL_BOOK',
        receiveMethod: deliveryMethod === 'shipping' ? 'HOME_PICKUP' : 'LIBRARY_PICKUP',
      };

      const borrowResponse = await borrowApi.createBorrowRecord(borrowData as any);

      if (borrowMode === 'offline' && deliveryMethod === 'shipping') {
        try {
          await shipmentApi.createShipment({
            borrowRecordId: borrowResponse.id,
            shippingFee: 15000,
            shipmentStatus: 'WAITING_CONFIRMATION'
          } as any);
        } catch (shipmentError) {
          console.error('Failed to create shipment:', shipmentError);
        }
      }

      const successMsg = 'Mượn sách thành công! Vui lòng kiểm tra trạng thái trong mục Sách của tôi.';
      setSuccessConfirmText('Hoàn thành');

      if (borrowMode === 'offline' && deliveryMethod === 'shipping' && paymentMethod === 'Thanh toán qua ngân hàng') {
        setPaymentAmount(amount);
        setPaymentBackPage('Xác nhận mượn');
        setPaymentSuccessMessage(successMsg);
        handleSetActivePage('Thanh toán qua ngân hàng');
      } else {
        setSuccessMessage(successMsg);
        handleClearCart();
        setIsSuccessOpen(true);
        handleSetActivePage('Sách của tôi');
      }

      // Refresh borrow records
      fetchBorrowRecords();

    } catch (error) {
      console.error('Failed to create borrow record:', error);
      setSuccessMessage('Mượn sách thất bại. Vui lòng thử lại.');
      setIsSuccessOpen(true);
    }
  };

  const handleConfirmLateFine = (paymentMethod: string, amount: string, returnMethodChoice: string) => {
    setLateFineReturnMethod(returnMethodChoice);
    const successMsg = 'Trả sách thành công. Cảm ơn bạn đọc!';

    if (paymentMethod === 'Thanh toán qua ngân hàng') {
      setPaymentAmount(amount);
      setPaymentBackPage('Nộp phạt');
      setPaymentSuccessMessage(successMsg);
      handleSetActivePage('Thanh toán qua ngân hàng');
    } else {
      setBooks(prev => prev.map(book => book.id === '4' ? { ...book, status: 'Đã trả sách', statusColor: 'text-green-500', actions: ['Trả sách disabled'] } : book));
      setSuccessMessage(successMsg);
      setIsSuccessOpen(true);
      handleSetActivePage('Sách của tôi');
    }
  };

  const handlePaymentComplete = () => {
    if (paymentBackPage === 'Nộp phạt') {
      setBooks(prev => prev.map(book => book.id === '4' ? { ...book, status: 'Đã trả sách', statusColor: 'text-green-500', actions: ['Trả sách disabled'] } : book));
    } else if (paymentBackPage === 'Thẻ thành viên') {
      setCurrentMembershipPlan(upgradePlan);
    } else {
      handleClearCart();
    }
    fetchBorrowRecords();
    setSuccessMessage(paymentSuccessMessage);
    setIsSuccessOpen(true);
    if (paymentBackPage === 'Thẻ thành viên') handleSetActivePage('Thẻ thành viên');
    else handleSetActivePage('Sách của tôi');
  };

  const handleUpgradePlan = (plan: { name: string, price: string }) => {
    setUpgradePlan(plan.name);
    setPaymentAmount(plan.price);
    setPaymentBackPage('Thẻ thành viên');
    setPaymentSuccessMessage(`Nâng cấp gói ${plan.name} thành công!`);
    setSuccessConfirmText('Bắt đầu ngay');
    handleSetActivePage('Thanh toán qua ngân hàng');
  };

  const handleLateReturn = (id?: number) => {
    setPaymentAmount('45.000 VNĐ'); // Late fee example
    setPaymentBackPage('Sách của tôi');
    setPaymentSuccessMessage('Thanh toán phí trễ hạn thành công!');
    setSuccessConfirmText('Đóng');
    handleSetActivePage('Thanh toán qua ngân hàng');
  };

  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true);
    setIsLoginOpen(false);
    if (email === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setSuccessMessage('Đăng nhập thành công!');
    setSuccessConfirmText('Khám phá ngay');
    setIsSuccessOpen(true);
    handleSetActivePage('Khám phá');
  };

  const handleReturnSuccess = (customMessage?: string) => {
    setSuccessMessage(customMessage || 'Trả trên hệ thống thành công! Cảm ơn bạn đọc!');
    setIsSuccessOpen(true);
  };

  const handleRenewSuccess = () => {
    setSuccessMessage('Gia hạn thành công!');
    setIsSuccessOpen(true);
  };

  const handleRenew = async (recordId: number) => {
    try {
      const recordToRenew = books.find(b => b.recordId === recordId);
      if (recordToRenew) {
        const currentCount = parseInt(recordToRenew.renewCount.split('/')[0]);
        if (currentCount < 2) {
          await borrowApi.updateBorrowRecord(recordId, { renew: currentCount + 1 });
          await fetchBorrowRecords();
          handleRenewSuccess();
        }
      }
    } catch (error) {
      console.error('Failed to renew book:', error);
      setSuccessMessage('Gia hạn thất bại. Vui lòng thử lại.');
      setIsSuccessOpen(true);
    }
  };

  const handleReturnEbook = async (recordId: number) => {
    try {
      const returnData = {
        borrowRecord: { id: recordId },
        returnMethod: 'LIBRARY_RETURN',
      };

      await returnApi.createReturnRecord(returnData as any);
      setSuccessMessage('Trả sách Ebook thành công!');
      setIsSuccessOpen(true);
      await fetchBorrowRecords();
    } catch (error) {
      console.error('Failed to return ebook:', error);
      setSuccessMessage('Trả sách thất bại. Vui lòng thử lại.');
      setIsSuccessOpen(true);
    }
  };

  const handleConfirmReturn = async (paymentMethod: string, amount: string, deliveryMethod: string) => {
    try {
      if (!selectedBorrowedBook || !selectedBorrowedBook.recordId) return;

      const returnData = {
        borrowRecord: { id: selectedBorrowedBook.recordId },
        returnMethod: deliveryMethod === 'shipping' ? 'HOME_RETURN' : 'LIBRARY_RETURN',
      };

      const returnResponse = await returnApi.createReturnRecord(returnData as any);

      if (selectedBorrowedBook.type === 'Sách giấy' && deliveryMethod === 'shipping') {
        try {
          await shipmentApi.createShipment({
            returnRecordId: returnResponse.id,
            shippingFee: 15000,
            shipmentStatus: 'WAITING_CONFIRMATION'
          } as any);
        } catch (shipmentError) {
          console.error('Failed to create return shipment:', shipmentError);
        }
      }

      const successMsg = 'Yêu cầu trả sách thành công! Vui lòng chờ thư viện phê duyệt.';
      setSuccessConfirmText('Hoàn thành');

      if (selectedBorrowedBook.type === 'Sách giấy' && deliveryMethod === 'shipping' && paymentMethod === 'Thanh toán qua ngân hàng') {
        setPaymentAmount(amount);
        setPaymentBackPage('Sách của tôi');
        setPaymentSuccessMessage(successMsg);
        handleSetActivePage('Thanh toán qua ngân hàng');
      } else {
        setSuccessMessage(successMsg);
        setIsSuccessOpen(true);
        handleSetActivePage('Sách của tôi');
      }

      await fetchBorrowRecords();

    } catch (error) {
      console.error('Failed to create return record:', error);
      setSuccessMessage('Trả sách thất bại. Vui lòng thử lại.');
      setIsSuccessOpen(true);
    }
  };

  if (isAdmin) {
    return <AdminApp />;
  }

  return (
    <div className="min-h-screen bg-sand font-sans text-ink antialiased selection:bg-forest/20 selection:text-forest relative">
      <div className="bg-noise"></div>

      <main className="transition-all duration-300 w-full">
        <Header
          activePage={activePage}
          setActivePage={handleSetActivePage}
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setIsLoginOpen(true)}
          onRegisterClick={() => setIsRegisterOpen(true)}
          onProfileClick={() => {
            if (isLoggedIn) {
              handleSetActivePage('Cài đặt tài khoản');
            } else {
              setIsLoginOpen(true);
            }
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          markAsRead={markAsRead}
          clearAllNotifications={clearAllNotifications}
          onNotificationClick={handleNotificationClick}
          onBookClick={handleBookClick}
        />

        <Routes>
          <Route path="/support" element={<SupportView onBack={() => handleSetActivePage('Khám phá')} />} />
          <Route path="/books" element={<BooksView onBookClick={handleBookClick} onBack={() => handleSetActivePage('Khám phá')} searchQuery={searchQuery} />} />
          <Route path="/my-books" element={<MyBooksView books={books} setBooks={setBooks} onReturnSuccess={handleReturnSuccess} onReadClick={(id) => { setSelectedBookId(id.toString()); handleSetActivePage('Đọc sách'); }} onRowClick={handleBookClick} onRenewSuccess={handleRenewSuccess} onLateReturn={() => handleSetActivePage('Nộp phạt')} onNavigateTo={(page) => handleSetActivePage(page)} onBack={() => handleSetActivePage('Khám phá')} onDeleteRecord={handleDeleteRecord} onRenew={handleRenew} onReturnInitiate={(book) => { setSelectedBorrowedBook(book); handleSetActivePage('Xác nhận trả'); }} onReturnEbook={handleReturnEbook} />} />
          <Route path="/payment/fine" element={<LateFinePaymentView onBack={() => handleSetActivePage('Sách của tôi')} onConfirm={handleConfirmLateFine} />} />
          <Route path="/reader/:id" element={<ReaderView onBack={() => handleSetActivePage('Sách của tôi')} />} />
          <Route path="/favorites" element={<FavoritesView books={favoriteBooks} setBooks={setFavoriteBooks} cartBooks={cartBooks} setCartBooks={setCartBooks} onNavigateToCart={() => handleSetActivePage('Giỏ sách')} onBack={() => handleSetActivePage('Khám phá')} />} />
          <Route path="/cart" element={<CartView books={cartBooks} onRemoveItem={handleRemoveFromCart} onClearCart={handleClearCart} onUpdateItemType={handleUpdateCartItemType} onBorrowTrigger={(mode) => { setBorrowMode(mode); handleSetActivePage('Xác nhận mượn'); }} onBack={() => handleSetActivePage('Khám phá')} />} />
          <Route path="/membership" element={<MembershipView onUpgrade={handleUpgradePlan} currentPlan={currentMembershipPlan} onViewDetail={(plan) => { setUpgradePlan(plan); handleSetActivePage('Chi tiết thẻ thành viên'); }} onBack={() => handleSetActivePage('Khám phá')} />} />
          <Route path="/membership/detail" element={<MembershipDetailView plan={upgradePlan || 'Standard'} expiryDate={membershipExpiry} onBack={() => handleSetActivePage('Thẻ thành viên')} onUpgradePremium={() => { setUpgradePlan('Premium'); setPaymentAmount('300.000 VNĐ'); setPaymentBackPage('Thẻ thành viên'); setPaymentSuccessMessage('Nâng cấp thành công!'); setSuccessConfirmText('Bắt đầu ngay'); handleSetActivePage('Thanh toán qua ngân hàng'); }} onCancel={() => { setCurrentMembershipPlan(null); setSuccessMessage('Hủy thành công'); setIsSuccessOpen(true); }} onRenew={() => { const parts = membershipExpiry.split('/'); setMembershipExpiry(`${parts[0]}/${parts[1]}/${parseInt(parts[2]) + 1}`); setSuccessMessage('Gia hạn thành công!'); setIsSuccessOpen(true); }} />} />
          <Route path="/profile" element={<ProfileView onBack={() => handleSetActivePage('Khám phá')} profile={profile} setProfile={setProfile} />} />
          <Route path="/books/:id" element={<BookDetailView isLoggedIn={isLoggedIn} onRequireLogin={() => setIsLoginOpen(true)} bookId={selectedBookId || ''} onBack={() => handleSetActivePage('Khám phá')} onStartBorrow={(mode) => { setBorrowMode(mode); handleSetActivePage('Xác nhận mượn'); }} borrowedInfo={books.find(b => b.id.toString() === selectedBookId && b.status !== 'Đã trả sách' && b.approvalStatus !== 'REJECTED')} onRenew={handleRenew} onRead={(id) => { setSelectedBookId(id.toString()); handleSetActivePage('Đọc sách'); }} onAddToCart={handleAddToCart} cartBooks={cartBooks} />} />
          <Route path="/borrow-confirm" element={<BorrowConfirmationView bookId={selectedBookId || ''} borrowMode={borrowMode} onBack={() => handleSetActivePage('Chi tiết sách')} onConfirm={handleConfirmBorrow} />} />
          <Route path="/return-confirm" element={<ReturnConfirmationView borrowedBook={selectedBorrowedBook} onBack={() => handleSetActivePage('Sách của tôi')} onConfirm={handleConfirmReturn} />} />
          <Route path="/payment/bank" element={<BankPaymentView onBack={() => handleSetActivePage(paymentBackPage)} onComplete={handlePaymentComplete} amount={paymentAmount} />} />
          <Route path="/" element={<HomeView onLoginClick={() => setIsLoginOpen(true)} onRegisterClick={() => setIsRegisterOpen(true)} isLoggedIn={isLoggedIn} onBookClick={handleBookClick} />} />
        </Routes>
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }} onRegisterSuccess={() => { setIsRegisterOpen(false); setIsOTPOpen(true); }} />
      <OTPModal isOpen={isOTPOpen} onClose={() => setIsOTPOpen(false)} onBack={() => { setIsOTPOpen(false); setIsRegisterOpen(true); }} onVerifySuccess={() => { setIsLoggedIn(true); setIsOTPOpen(false); setSuccessMessage('Đăng ký thành công!'); setSuccessConfirmText('Khám phá ngay'); setIsSuccessOpen(true); handleSetActivePage('Khám phá'); }} />
      <ToastNotification isOpen={isSuccessOpen} onClose={() => { setIsSuccessOpen(false); }} message={successMessage} />
    </div>
  );
}
