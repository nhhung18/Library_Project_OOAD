import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Edit2, Check } from 'lucide-react';
import { bookApi } from '../api/bookApi';
import { userAddressApi } from '../api/userAddressApi';
import { userApi } from '../api/userApi';
import { Book } from '../types';

interface BorrowConfirmationViewProps {
  onBack: () => void;
  onConfirm: (paymentMethod: string, amount: string, deliveryMethod: string) => void;
  borrowMode: 'ebook' | 'offline';
  bookId: string;
}

const BorrowConfirmationView = ({ onBack, onConfirm, borrowMode, bookId }: BorrowConfirmationViewProps) => {
  const [paymentMethod, setPaymentMethod] = useState('Thanh toán qua ngân hàng');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showDeliveryMenu, setShowDeliveryMenu] = useState(false);

  const [bookData, setBookData] = useState<Book | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (bookId) {
          const bookRes = await bookApi.getBookById(Number(bookId));
          setBookData(bookRes as any);
        }
        
        // Fetch Mock User ID 3 Info
        const userRes = await userApi.getUserById(3);
        setUserData(userRes);

        const addressRes = await userAddressApi.getUserAddresses(3); // Mock user ID 3
        if (Array.isArray(addressRes)) {
          setAddresses(addressRes);
          const defaultAddress = addressRes.find((a: any) => a.isDefault || a.default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (addressRes.length > 0) {
            setSelectedAddressId(addressRes[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [bookId]);

  const [deliveryMethod, setDeliveryMethod] = useState<'library' | 'shipping'>('library');

  // Set cứng phí vận chuyển theo yêu cầu
  const shippingPenaltyCost = '15.000 VNĐ';

  const handleSaveAddress = () => {
    setUserInfo(prev => ({ ...prev, address: tempAddress }));
    setIsEditingAddress(false);
    // Ideally, call userApi.updateUser(userId, { address: tempAddress }) here.
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-none px-4 md:px-12 lg:px-16 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Xác nhận mượn</h1>
      <div className="space-y-8">
        {borrowMode === 'offline' && (
          <div className="glass-panel rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Địa chỉ nhận sách</label>
            </div>
            <div className="space-y-3 mt-4">
              {addresses.map((address) => (
                <div key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-[#1e3b2b] bg-white/80' : 'border-white/60 bg-white/40 hover:bg-white/60'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{address.receiverName}</span>
                        <span className="text-sm text-gray-500">| {address.phone}</span>
                        {(address.isDefault || address.default) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-widest ml-2">Mặc định</span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 text-sm">{address.addressLine}, {address.ward}</p>
                    </div>
                    {selectedAddressId === address.id && <div className="w-5 h-5 rounded-full bg-[#1e3b2b] flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="text-gray-500 italic text-sm">Chưa có địa chỉ. Vui lòng cập nhật trong hồ sơ.</div>
              )}
            </div>
          </div>
        )}

        {userData && (
          <div className="glass-panel rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin người mượn</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-sm md:text-base">Họ và tên</span><span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.fullName || 'Đang cập nhật'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-sm md:text-base">Số điện thoại</span><span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.phone || 'Đang cập nhật'}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-sm md:text-base">Email</span><span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.email || 'Đang cập nhật'}</span></div>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-[2.5rem] p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tóm tắt đơn hàng</h2>
          <div className="flex items-start gap-6 border-b border-gray-50 pb-8 mb-8">
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 shadow-md"><img src={bookData?.imageUrl || `https://picsum.photos/seed/${bookId}/200/300`} alt="Book" className="w-full h-full object-cover" /></div>
            <div><h3 className="text-xl font-bold text-gray-900">{bookData?.title || 'Đang tải...'}</h3><p className="text-gray-400 font-bold text-sm">{bookData?.author || '...'}</p></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-lg">Hình thức</span><span className="text-gray-900 font-bold text-lg">{borrowMode === 'offline' ? 'Sách giấy - Đến thư viện lấy sách' : 'Ebook - Đọc trực tuyến'}</span></div>
            
            {borrowMode === 'offline' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-lg">Hình thức nhận sách</span>
                <div className="relative z-30">
                  <button 
                    type="button"
                    onClick={() => setShowDeliveryMenu(!showDeliveryMenu)} 
                    className="bg-white/50 border border-white/60 backdrop-blur-md rounded-2xl px-6 py-3 font-bold text-gray-900 text-sm flex items-center space-x-3 hover:bg-white/80 transition-all shadow-sm"
                  >
                    <span>{deliveryMethod === 'library' ? 'Tại thư viện' : 'Qua đơn vị vận chuyển'}</span>
                    <ChevronDown size={18} className={`transition-transform ${showDeliveryMenu ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showDeliveryMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="absolute right-0 top-full mt-3 w-64 glass-panel rounded-2xl shadow-xl overflow-hidden z-20"
                      >
                        {[
                          { key: 'library', label: 'Tại thư viện' },
                          { key: 'shipping', label: 'Qua đơn vị vận chuyển' }
                        ].map((item) => (
                          <button 
                            key={item.key} 
                            type="button"
                            onClick={() => { setDeliveryMethod(item.key as 'library' | 'shipping'); setShowDeliveryMenu(false); }} 
                            className={`w-full text-left px-6 py-4 text-sm font-bold hover:bg-white/80 ${deliveryMethod === item.key ? 'text-[#1e3b2b]' : 'text-gray-600'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-lg">Số tiền</span><span className="text-green-600 font-bold text-lg">Miễn phí</span></div>
            
            {borrowMode === 'offline' && deliveryMethod === 'shipping' && (
              <>
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-lg">Phí vận chuyển</span><span className="text-gray-900 font-bold text-lg">{shippingPenaltyCost}</span></div>
                
                <div className="flex justify-between items-center"><span className="text-gray-500 font-medium text-lg">Phương thức thanh toán</span>
                <div className="relative z-20">
                    <button type="button" onClick={() => setShowPaymentMenu(!showPaymentMenu)} className="bg-white/50 border border-white/60 backdrop-blur-md rounded-2xl px-6 py-3 font-bold text-gray-900 text-sm flex items-center space-x-3 hover:bg-white/80 transition-all shadow-sm">
                      <span>{paymentMethod}</span><ChevronDown size={18} className={`transition-transform ${showPaymentMenu ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showPaymentMenu && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 bottom-full mb-3 w-64 glass-panel rounded-2xl shadow-xl overflow-hidden z-20">
                          {['Thanh toán qua ngân hàng', 'Thanh toán tiền mặt'].map((method) => (
                            <button key={method} type="button" onClick={() => { setPaymentMethod(method); setShowPaymentMenu(false); }} className={`w-full text-left px-6 py-4 text-sm font-bold hover:bg-white/80 ${paymentMethod === method ? 'text-[#1e3b2b]' : 'text-gray-600'}`}>{method}</button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
          <div className="flex items-baseline gap-6"><span className="text-3xl font-bold text-gray-900">Tổng cộng</span><span className="text-4xl font-bold text-[#1e3b2b]">{borrowMode === 'offline' && deliveryMethod === 'shipping' ? shippingPenaltyCost : 'Miễn phí'}</span></div>
          <div className="flex items-center gap-6 w-full md:w-auto">
            <button onClick={onBack} className="flex-1 md:flex-none px-12 py-5 font-bold text-gray-400 hover:text-gray-900 text-lg">Hủy</button>
            <button 
              type="button"
              onClick={() => {
                const amount = borrowMode === 'offline' && deliveryMethod === 'shipping' ? shippingPenaltyCost : 'Miễn phí';
                onConfirm(paymentMethod, amount, deliveryMethod);
              }} 
              className="flex-1 md:flex-none bg-[#1e3b2b] text-white px-16 py-5 rounded-full font-bold shadow-md shadow-[#1e3b2b]/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-xl transition-all"
            >
              Xác nhận mượn
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BorrowConfirmationView;
