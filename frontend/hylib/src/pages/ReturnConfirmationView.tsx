import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { bookApi } from '../api/bookApi';
import { userAddressApi } from '../api/userAddressApi';
import { userApi } from '../api/userApi';
import { Book, BorrowedBook } from '../types';

interface ReturnConfirmationViewProps {
  onBack: () => void;
  onConfirm: (paymentMethod: string, amount: string, returnMethod: string) => void;
  borrowedBook: BorrowedBook | null;
}

const ReturnConfirmationView = ({ onBack, onConfirm, borrowedBook }: ReturnConfirmationViewProps) => {
  const [paymentMethod, setPaymentMethod] = useState('Thanh toán qua ngân hàng');
  const [showPaymentMenu, setShowPaymentMenu] = useState(false);
  const [showDeliveryMenu, setShowDeliveryMenu] = useState(false);

  const [bookData, setBookData] = useState<Book | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Return method state
  const [returnMethod, setReturnMethod] = useState<'library' | 'shipping'>('library');

  // Shipping fee
  const shippingCost = '15.000 VNĐ';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (borrowedBook?.id) {
          const bookRes = await bookApi.getBookById(borrowedBook.id);
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
  }, [borrowedBook]);

  if (!borrowedBook) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy thông tin sách cần trả.
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="w-full max-w-none px-4 md:px-12 lg:px-16 py-12"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Xác nhận trả sách</h1>
      <div className="space-y-8">
        
        {returnMethod === 'shipping' && (
          <div className="glass-panel rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Địa chỉ nhận sách (Thu gom tận nơi)</label>
            </div>
            <div className="space-y-3 mt-4">
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  onClick={() => setSelectedAddressId(address.id)} 
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-[#1e3b2b] bg-white/80' : 'border-white/60 bg-white/40 hover:bg-white/60'}`}
                >
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
                    {selectedAddressId === address.id && (
                      <div className="w-5 h-5 rounded-full bg-[#1e3b2b] flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin người trả</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm md:text-base">Họ và tên</span>
                <span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.fullName || 'Đang cập nhật'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm md:text-base">Số điện thoại</span>
                <span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.phoneNum || 'Đang cập nhật'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium text-sm md:text-base">Email</span>
                <span className="text-gray-900 font-bold text-base md:text-lg text-right">{userData.email || 'Đang cập nhật'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel rounded-[2.5rem] p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Tóm tắt đơn sách trả</h2>
          <div className="flex items-start gap-6 border-b border-gray-50 pb-8 mb-8">
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-100 shadow-md">
              <img src={bookData?.imageUrl || `https://picsum.photos/seed/${borrowedBook.id}/200/300`} alt="Book" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{bookData?.title || 'Đang tải...'}</h3>
              <p className="text-gray-400 font-bold text-sm">{bookData?.author || '...'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium text-lg">Hình thức sách</span>
              <span className="text-gray-900 font-bold text-lg">{borrowedBook.type === 'Sách giấy' ? 'Sách giấy' : 'Ebook'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium text-lg">Hình thức trả sách</span>
              <div className="relative z-30">
                <button 
                  type="button"
                  onClick={() => setShowDeliveryMenu(!showDeliveryMenu)} 
                  className="bg-white/50 border border-white/60 backdrop-blur-md rounded-2xl px-6 py-3 font-bold text-gray-900 text-sm flex items-center space-x-3 hover:bg-white/80 transition-all shadow-sm"
                >
                  <span>{returnMethod === 'library' ? 'Tại thư viện' : 'Qua đơn vị vận chuyển'}</span>
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
                          onClick={() => { setReturnMethod(item.key as 'library' | 'shipping'); setShowDeliveryMenu(false); }} 
                          className={`w-full text-left px-6 py-4 text-sm font-bold hover:bg-white/80 ${returnMethod === item.key ? 'text-[#1e3b2b]' : 'text-gray-600'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium text-lg">Hạn trả ban đầu</span>
              <span className="text-gray-900 font-bold text-lg">{new Date(borrowedBook.expiryDate).toLocaleDateString('vi-VN')}</span>
            </div>
            
            {returnMethod === 'shipping' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium text-lg">Phí thu gom tận nơi</span>
                  <span className="text-gray-900 font-bold text-lg">{shippingCost}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium text-lg">Phương thức thanh toán phí</span>
                  <div className="relative z-20">
                    <button 
                      type="button" 
                      onClick={() => setShowPaymentMenu(!showPaymentMenu)} 
                      className="bg-white/50 border border-white/60 backdrop-blur-md rounded-2xl px-6 py-3 font-bold text-gray-900 text-sm flex items-center space-x-3 hover:bg-white/80 transition-all shadow-sm"
                    >
                      <span>{paymentMethod}</span>
                      <ChevronDown size={18} className={`transition-transform ${showPaymentMenu ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showPaymentMenu && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: 10 }} 
                          className="absolute right-0 bottom-full mb-3 w-64 glass-panel rounded-2xl shadow-xl overflow-hidden z-20"
                        >
                          {['Thanh toán qua ngân hàng', 'Thanh toán tiền mặt'].map((method) => (
                            <button 
                              key={method} 
                              type="button" 
                              onClick={() => { setPaymentMethod(method); setShowPaymentMenu(false); }} 
                              className={`w-full text-left px-6 py-4 text-sm font-bold hover:bg-white/80 ${paymentMethod === method ? 'text-[#1e3b2b]' : 'text-gray-600'}`}
                            >
                              {method}
                            </button>
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
          <div className="flex items-baseline gap-6">
            <span className="text-3xl font-bold text-gray-900">Tổng cộng</span>
            <span className="text-4xl font-bold text-[#1e3b2b]">{returnMethod === 'shipping' ? shippingCost : 'Miễn phí'}</span>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto">
            <button onClick={onBack} className="flex-1 md:flex-none px-12 py-5 font-bold text-gray-400 hover:text-gray-900 text-lg">Hủy</button>
            <button 
              type="button"
              onClick={() => {
                const amount = returnMethod === 'shipping' ? shippingCost : 'Miễn phí';
                onConfirm(paymentMethod, amount, returnMethod);
              }} 
              className="flex-1 md:flex-none bg-[#1e3b2b] text-white px-16 py-5 rounded-full font-bold shadow-md shadow-[#1e3b2b]/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-xl transition-all"
            >
              Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReturnConfirmationView;
