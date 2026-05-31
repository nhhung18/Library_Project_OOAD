import React, { useEffect, useState } from 'react';
import { BorrowRecord, ReturnRecord, ReceiveMethod, ReturnMethod } from '../../types';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BorrowRecord | ReturnRecord | null;
  type: 'borrow' | 'return';
  onSave: (id: number, data: any) => void;
}

export default function EditRecordModal({ isOpen, onClose, record, type, onSave }: EditRecordModalProps) {
  const [dueDate, setDueDate] = useState('');
  const [renew, setRenew] = useState(0);
  const [receiveMethod, setReceiveMethod] = useState<ReceiveMethod>(ReceiveMethod.LIBRARY_PICKUP);
  
  const [fineAmount, setFineAmount] = useState(0);
  const [isLost, setIsLost] = useState(false);
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (record) {
      if (type === 'borrow') {
        const borrowRec = record as BorrowRecord;
        setDueDate(borrowRec.dueDate ? borrowRec.dueDate.split('T')[0] : '');
        setRenew(borrowRec.renew || 0);
        setReceiveMethod(borrowRec.receiveMethod || ReceiveMethod.LIBRARY_PICKUP);
      } else {
        const returnRec = record as ReturnRecord;
        setFineAmount(returnRec.fineAmount || 0);
        setIsLost(returnRec.isLost || false);
      }
    }
  }, [record, type, isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (type === 'borrow') {
      onSave(record.id, {
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        renew,
        receiveMethod
      });
    } else {
      onSave(record.id, {
        ...record,
        fineAmount,
        isLost
      });
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} font-sans`}>
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      <div className={`bg-white rounded-3xl w-[450px] p-10 shadow-2xl relative transition-all duration-300 ease-out transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === 'borrow' ? 'Sửa yêu cầu mượn' : 'Sửa yêu cầu trả'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">Mã đơn: {record?.id}</p>

        <form onSubmit={handleSave} className="space-y-6">
          {type === 'borrow' ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Hạn trả sách</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#0056b3] transition-colors text-sm" 
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Số lần gia hạn</label>
                <input 
                  type="number" 
                  min="0"
                  value={renew} 
                  onChange={e => setRenew(parseInt(e.target.value) || 0)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#0056b3] transition-colors text-sm" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Cách nhận sách</label>
                <select 
                  value={receiveMethod} 
                  onChange={e => setReceiveMethod(e.target.value as ReceiveMethod)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#0056b3] transition-colors bg-transparent cursor-pointer text-sm font-medium"
                >
                  <option value={ReceiveMethod.LIBRARY_PICKUP}>Nhận tại thư viện</option>
                  <option value={ReceiveMethod.HOME_PICKUP}>Giao hàng (Qua ĐVVC)</option>
                  <option value={ReceiveMethod.EBOOK}>Ebook (Online)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 tracking-wider mb-2 uppercase">Phí phạt (VNĐ)</label>
                <input 
                  type="number" 
                  min="0"
                  value={fineAmount} 
                  onChange={e => setFineAmount(parseInt(e.target.value) || 0)}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#0056b3] transition-colors text-sm" 
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="isLost"
                  checked={isLost} 
                  onChange={e => setIsLost(e.target.checked)}
                  className="w-4 h-4 text-[#0056b3] rounded border-gray-300 focus:ring-[#0056b3]" 
                />
                <label htmlFor="isLost" className="text-sm font-medium text-gray-700 cursor-pointer">Báo mất sách</label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-6 mt-4">
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-full bg-[#0056b3] hover:bg-blue-700 text-sm font-bold text-white transition-colors shadow-md"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
