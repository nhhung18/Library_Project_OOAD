import React, { useEffect, useState } from 'react';
import { ReturnRecord, PaymentMethod, PaymentCalculationResp, BorrowRecord } from '../../types';
import { CheckCircle2, QrCode, Banknote, X, Loader2 } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ReturnRecord | null;
  borrowRecords?: BorrowRecord[];
  onConfirm: (id: number, method: PaymentMethod) => void;
}

export default function PaymentModal({ isOpen, onClose, record, borrowRecords = [], onConfirm }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [calcData, setCalcData] = useState<PaymentCalculationResp | null>(null);
  const [isLoadingCalc, setIsLoadingCalc] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setIsVisible(true);
      setPaymentMethod(PaymentMethod.CASH);
      setIsProcessing(false);
      setCalcData(null);
      setShowQr(false);
      fetchCalculation(record.id);
    } else {
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen, record]);

  const fetchCalculation = async (id: number) => {
    setIsLoadingCalc(true);
    try {
      const res: any = await paymentApi.calculateReturnPayment(id);
      setCalcData(res);
    } catch (error) {
      console.error("Lỗi lấy thông tin thanh toán:", error);
    } finally {
      setIsLoadingCalc(false);
    }
  };

  if (!isOpen && !isVisible) return null;
  if (!record) return null;

  const borrowRecord = record.borrowRecord || borrowRecords.find(r => r.id === (record as any).borrowRecordId);
  const user = borrowRecord?.user;

  const handleConfirm = async () => {
    setIsProcessing(true);
    await onConfirm(record.id, paymentMethod);
    setIsProcessing(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-300 font-sans ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

      <div className={`bg-white rounded-3xl w-[500px] shadow-2xl relative transition-all duration-400 ease-out transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'} flex flex-col max-h-[90vh] overflow-hidden border border-gray-100`}>
        {/* Header */}
        <div className="p-8 pb-6 border-b border-gray-100 relative bg-gradient-to-br from-blue-50/50 to-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <Banknote size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Đơn trả sách #{record.id} • {user?.userName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar relative min-h-[300px]">
          {isLoadingCalc ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-500">Đang tính toán chi phí...</p>
            </div>
          ) : calcData ? (
            <>
              <div className="space-y-4 mb-8">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chi tiết khoản thu</h3>

                <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                  <span className="text-sm text-gray-600 font-medium">Phí trả muộn ({record.returnDelayDays || 0} ngày)</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(calcData.lateFee)}</span>
                </div>

                {record.damageLevel && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                    <span className="text-sm text-gray-600 font-medium">Phí đền bù hư hỏng ({record.damageLevel.levelName})</span>
                    <span className="text-sm font-bold text-orange-600">{formatCurrency(calcData.damageFee)}</span>
                  </div>
                )}

                {record.isLost && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                    <span className="text-sm text-gray-600 font-medium">Phí làm mất sách</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(calcData.lostFee)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-4 bg-gray-50 px-4 rounded-2xl mt-4">
                  <span className="text-base font-bold text-gray-900">Tổng cần thanh toán</span>
                  <span className="text-2xl font-black text-[#0066cc]">{formatCurrency(calcData.totalAmount)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <p>Không có dữ liệu thanh toán.</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phương thức thanh toán</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === PaymentMethod.CASH
                    ? 'border-[#0066cc] bg-blue-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
              >
                <div className={`p-3 rounded-full ${paymentMethod === PaymentMethod.CASH ? 'bg-[#0066cc] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Banknote size={20} />
                </div>
                <span className={`text-sm font-bold ${paymentMethod === PaymentMethod.CASH ? 'text-[#0066cc]' : 'text-gray-600'}`}>Tiền mặt</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod(PaymentMethod.BANKING);
                  setShowQr(true);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${paymentMethod === PaymentMethod.BANKING
                    ? 'border-[#0066cc] bg-blue-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
              >
                <div className={`p-3 rounded-full ${paymentMethod === PaymentMethod.BANKING ? 'bg-[#0066cc] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <QrCode size={20} />
                </div>
                <span className={`text-sm font-bold ${paymentMethod === PaymentMethod.BANKING ? 'text-[#0066cc]' : 'text-gray-600'}`}>Chuyển khoản</span>
              </button>
            </div>

            {paymentMethod === PaymentMethod.BANKING && (
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <CheckCircle2 size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-800 font-medium leading-relaxed mb-2">
                    Vui lòng yêu cầu độc giả quét mã QR tại quầy. Sau khi nhận được tiền, hãy bấm Xác nhận ở bên dưới.
                  </p>
                  {calcData && (
                    <button
                      type="button"
                      onClick={() => setShowQr(true)}
                      className="text-xs font-bold text-[#0066cc] hover:underline flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <QrCode size={14} /> Xem lại mã QR thanh toán
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || isLoadingCalc || !calcData || calcData.totalAmount === 0}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#0066cc] hover:bg-[#0052a3] text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Xác nhận đã thu tiền</span>
            )}
          </button>
        </div>
      </div>

      {/* QR Code Pop-up Overlay */}
      {showQr && calcData && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] transition-all duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowQr(false)}></div>
          <div className="bg-white rounded-3xl w-[400px] p-6 shadow-2xl relative border border-gray-100 transform scale-100 transition-all">
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Mã QR Thanh Toán</h3>
              <p className="text-xs text-gray-500 mb-4">Quét mã bằng ứng dụng ngân hàng của bạn</p>

              {/* QR Image from VietQR */}
              <div className="w-[200px] h-[200px] mx-auto bg-gray-50 rounded-2xl border border-gray-100 p-2 flex items-center justify-center shadow-inner mb-4 overflow-hidden">
                <img
                  src={`https://img.vietqr.io/image/VCB-1028374829-compact.png?amount=${calcData.totalAmount}&addInfo=${encodeURIComponent(`Hylib Pay ${record.id}`)}&accountName=${encodeURIComponent("THU VIEN HYLIB")}`}
                  alt="VietQR"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Transfer Details */}
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Ngân hàng</span>
                  <span className="font-bold text-gray-900 text-right">Vietcombank (VCB)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Số tài khoản</span>
                  <span className="font-bold text-gray-900 text-right">1028 3748 29</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tên tài khoản</span>
                  <span className="font-bold text-gray-900 text-right text-ellipsis overflow-hidden uppercase">THU VIEN HYLIB</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Số tiền</span>
                  <span className="font-bold text-[#0066cc] text-right">{formatCurrency(calcData.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Nội dung</span>
                  <span className="font-bold text-gray-900 text-right font-mono">Hylib Pay {record.id}</span>
                </div>
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
}
