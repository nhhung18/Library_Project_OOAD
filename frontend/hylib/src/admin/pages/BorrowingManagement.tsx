import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Search, Globe, Store, CheckCircle2, XCircle, ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';
import CreateRequestModal from '../components/CreateBorrowRequestModal';
import { BorrowRecord, ReturnRecord, ApprovalStatus, BorrowStatus, ReceiveMethod, ReturnMethod, ShipmentStatus, Shipment, BookType } from '../../types';
import { borrowApi } from '../../api/borrowApi';
import { returnApi } from '../../api/returnApi';
import { shipmentApi } from '../../api/shipmentApi';
import { paymentApi } from '../../api/paymentApi';
import EditRecordModal from '../components/EditRecordModal';
import BorrowRecordDetailModal from '../components/BorrowRecordDetailModal';
import PaymentModal from '../components/PaymentModal';
import { PaymentMethod } from '../../types';

export default function BorrowingManagement() {
  const [activeTab, setActiveTab] = useState('Yêu cầu mượn');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BorrowRecord | ReturnRecord | null>(null);
  const [editingType, setEditingType] = useState<'borrow' | 'return'>('borrow');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<BorrowRecord | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<ReturnRecord | null>(null);

  const tabs = ['Yêu cầu mượn', 'Yêu cầu trả', 'Đang mượn', 'Đã trả', 'Đã hủy', 'Giao hàng'];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [borrowResponse, returnResponse, shipmentResponse] = await Promise.all([
        borrowApi.getAllBorrowRecords(),
        returnApi.getAllReturnRecords(),
        shipmentApi.getAllShipments()
      ]);
      setRecords(Array.isArray(borrowResponse) ? borrowResponse : []);
      setReturnRecords(Array.isArray(returnResponse) ? returnResponse : []);
      setShipments(Array.isArray(shipmentResponse) ? shipmentResponse : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const newRequests = records.filter(r => r?.approvalStatus === ApprovalStatus.PENDING);
  const returnRequests = returnRecords.filter(r => r?.approvalStatus === ApprovalStatus.PENDING);
  const borrowing = records.filter(r => r?.approvalStatus === ApprovalStatus.APPROVED && (r?.borrowStatus === BorrowStatus.BORROWING || r?.borrowStatus === BorrowStatus.REQUESTING));
  const approvedReturns = returnRecords.filter(r => r?.approvalStatus === ApprovalStatus.APPROVED);
  const cancelled = records.filter(r => r?.approvalStatus === ApprovalStatus.REJECTED);
  const delivering = shipments;

  const handleCreateRequest = async (newRequest: any) => {
    // Integrate creation when backend creates records
    fetchData();
  };

  const handleUpdateApprovalStatus = async (id: number, newStatus: string) => {
    try {
      const record = records.find(r => r.id === id);
      if (record) {
        const updatedBorrowStatus = newStatus === ApprovalStatus.APPROVED
          ? BorrowStatus.BORROWING
          : newStatus === ApprovalStatus.PENDING
            ? BorrowStatus.REQUESTING
            : record.borrowStatus;

        await borrowApi.updateBorrowRecord(id, {
          ...record,
          approvalStatus: newStatus as ApprovalStatus,
          borrowStatus: updatedBorrowStatus
        });
        fetchData();

        // Auto switch tab based on new approval status
        if (newStatus === ApprovalStatus.APPROVED) {
          setActiveTab('Đang mượn');
        } else if (newStatus === ApprovalStatus.REJECTED) {
          setActiveTab('Đã hủy');
        } else if (newStatus === ApprovalStatus.PENDING) {
          setActiveTab('Yêu cầu mượn');
        }
      }
    } catch (error) {
      console.error('Update approval status failed', error);
    }
  };

  const handleUpdateBorrowStatus = async (id: number, newStatus: string) => {
    try {
      const record = records.find(r => r.id === id);
      if (record) {
        await borrowApi.updateBorrowRecord(id, { ...record, borrowStatus: newStatus as BorrowStatus });
        fetchData();

        // Auto switch tab based on new borrow status
        if (newStatus === BorrowStatus.RETURNED || newStatus === BorrowStatus.AUTO_RETURNED) {
          setActiveTab('Đã trả');
        } else if (newStatus === BorrowStatus.BORROWING) {
          setActiveTab('Đang mượn');
        } else if (newStatus === BorrowStatus.REQUESTING) {
          setActiveTab('Yêu cầu mượn');
        }
      }
    } catch (error) {
      console.error('Update borrow status failed', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await borrowApi.deleteBorrowRecord(id);
        fetchData();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const handleUpdateReturnApproval = async (id: number, newStatus: string) => {
    try {
      const record = returnRecords.find(r => r.id === id);
      if (record) {
        await returnApi.updateReturnRecord(id, {
          ...record,
          approvalStatus: newStatus as ApprovalStatus,
        });
        fetchData();
        if (newStatus === ApprovalStatus.APPROVED) {
          setActiveTab('Đã trả');
        } else if (newStatus === ApprovalStatus.REJECTED) {
          setActiveTab('Đã hủy');
        }
      }
    } catch (error) {
      console.error('Update return approval status failed', error);
    }
  };

  const handleUpdateReturnLost = async (id: number, isLostVal: boolean) => {
    try {
      const record = returnRecords.find(r => r.id === id);
      if (record) {
        await returnApi.updateReturnRecord(id, {
          ...record,
          isLost: isLostVal,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Update return lost status failed', error);
    }
  };

  const handleUpdateReturnDamage = async (id: number, damageLevelId: number) => {
    try {
      const record = returnRecords.find(r => r.id === id);
      if (record) {
        const mockDamageLevels: Record<number, any> = {
          1: { id: 1, levelName: 'Nhẹ', percentValue: 20, description: '' },
          2: { id: 2, levelName: 'Nặng', percentValue: 50, description: '' },
          3: { id: 3, levelName: 'Rất Nặng', percentValue: 80, description: '' }
        };
        await returnApi.updateReturnRecord(id, {
          ...record,
          damageLevel: damageLevelId ? mockDamageLevels[damageLevelId] : null
        });
        fetchData();
      }
    } catch (error) {
      console.error('Update return damage level failed', error);
    }
  };

  const handleCreatePayment = (id: number) => {
    const record = returnRecords.find(r => r.id === id);
    if (record) {
      setPaymentRecord(record);
      setIsPaymentModalOpen(true);
    }
  };

  const handleConfirmPayment = async (id: number, method: PaymentMethod) => {
    try {
      await paymentApi.processReturnPayment(id, { paymentMethod: method });
      console.log(`Đã lưu thanh toán cho đơn ${id} qua ${method} vào database`);
      await fetchData();
      setActiveTab('Đã trả');
    } catch (error) {
      console.error('Lỗi khi lưu thanh toán:', error);
      alert('Đã xảy ra lỗi khi tạo hóa đơn thanh toán.');
    }
  };

  const handleDeleteReturn = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu trả này?')) {
      try {
        await returnApi.deleteReturnRecord(id);
        fetchData();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const handleEditRecord = (record: BorrowRecord | ReturnRecord, type: 'borrow' | 'return') => {
    setEditingRecord(record);
    setEditingType(type);
    setIsEditModalOpen(true);
  };

  const handleViewBorrowRecord = (record: BorrowRecord) => {
    setViewingRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = async (id: number, data: any) => {
    try {
      if (editingType === 'borrow') {
        await borrowApi.updateBorrowRecord(id, data);
      } else {
        await returnApi.updateReturnRecord(id, data);
      }
      fetchData();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  const handleToggleDeliveringStatus = async (id: number, newStatus: string) => {
    try {
      const shipment = shipments.find(s => s.id === id);
      if (shipment) {
        await shipmentApi.updateShipment(id, { ...shipment, shipmentStatus: newStatus as ShipmentStatus });
        fetchData();
      }
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  const getApprovalStatusStyle = (status: string) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case ApprovalStatus.REJECTED: return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case ApprovalStatus.PENDING: return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
    }
  };

  const getBorrowStatusStyle = (status: string) => {
    switch (status) {
      case BorrowStatus.BORROWING: return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case BorrowStatus.RETURNED: return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case BorrowStatus.AUTO_RETURNED: return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
      case BorrowStatus.REQUESTING: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
    }
  };

  const getApprovalStatusArrowStyle = (status: string) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return 'text-green-600';
      case ApprovalStatus.REJECTED: return 'text-red-600';
      case ApprovalStatus.PENDING: return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getBorrowStatusArrowStyle = (status: string) => {
    switch (status) {
      case BorrowStatus.BORROWING: return 'text-blue-600';
      case BorrowStatus.RETURNED: return 'text-green-600';
      case BorrowStatus.AUTO_RETURNED: return 'text-teal-600';
      case BorrowStatus.REQUESTING: return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getAvatarInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredData = (data: any[]) => (data || []).filter(item =>
    item && (
      item.id?.toString().includes(searchQuery) ||
      item.user?.userName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      item.book?.title?.toLowerCase()?.includes(searchQuery.toLowerCase())
    )
  );

  const renderBorrowTable = (data: BorrowRecord[]) => (
    <table className="w-full text-left border-collapse min-w-[1100px]">
      <thead className="sticky top-0 z-10 bg-white shadow-sm">
        <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-white">
          <th className="px-6 py-5">MÃ ĐƠN</th>
          <th className="px-6 py-5">ĐỘC GIẢ</th>
          <th className="px-6 py-5">SÁCH</th>
          <th className="px-6 py-5">NGÀY MƯỢN</th>
          <th className="px-6 py-5">NGÀY TRẢ</th>
          <th className="px-6 py-5">LOẠI SÁCH</th>
          <th className="px-6 py-5">TRẠNG THÁI</th>
          <th className="px-6 py-5">PHÊ DUYỆT</th>
          <th className="px-6 py-5 text-center">GIA HẠN</th>
          <th className="px-6 py-5">NHẬN SÁCH</th>
          <th className="px-6 py-5 text-center">THAO TÁC</th>
        </tr>
      </thead>
      <tbody className="text-[13px] text-gray-700">
        {filteredData(data).length === 0 ? (
          <tr>
            <td colSpan={11} className="px-6 py-12 text-center text-gray-500 font-medium">Không tìm thấy dữ liệu.</td>
          </tr>
        ) : (
          filteredData(data).map((row: BorrowRecord, index) => (
            <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
              <td className="px-6 py-6 font-bold text-gray-500">{row.id}</td>
              <td className="px-6 py-6 font-bold text-gray-900">{row.user?.userName || 'N/A'}</td>
              <td className="px-6 py-6 text-gray-700 font-medium max-w-[200px] truncate" title={row.book?.title}>{row.book?.title || 'N/A'}</td>
              <td className="px-6 py-6 text-gray-500 font-medium">{formatDateTime(row.borrowDate)}</td>
              <td className="px-6 py-6 text-gray-500 font-medium">{formatDateTime(row.dueDate)}</td>
              <td className="px-6 py-6">
                <span className="font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs">{row.bookType === BookType.EBOOK ? 'Ebook' : 'Sách giấy'}</span>
              </td>
              <td className="px-6 py-6">
                <div className="relative inline-block">
                  <select
                    value={row.borrowStatus}
                    disabled={row.approvalStatus === ApprovalStatus.PENDING || row.approvalStatus === ApprovalStatus.REJECTED}
                    onChange={(e) => handleUpdateBorrowStatus(row.id, e.target.value)}
                    className={`appearance-none outline-none text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${row.approvalStatus === ApprovalStatus.PENDING || row.approvalStatus === ApprovalStatus.REJECTED
                      ? 'cursor-not-allowed opacity-80'
                      : 'cursor-pointer'
                      } ${getBorrowStatusStyle(row.borrowStatus)}`}
                  >
                    <option value={BorrowStatus.BORROWING}>Đang mượn</option>
                    <option value={BorrowStatus.RETURNED}>Đã trả</option>
                    <option value={BorrowStatus.AUTO_RETURNED}>Tự động trả</option>
                    <option value={BorrowStatus.REQUESTING}>Đang yêu cầu</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className={getBorrowStatusArrowStyle(row.borrowStatus)} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-6">
                <div className="relative inline-block">
                  <select
                    value={row.approvalStatus}
                    onChange={(e) => handleUpdateApprovalStatus(row.id, e.target.value)}
                    className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${getApprovalStatusStyle(row.approvalStatus)}`}
                  >
                    <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
                    <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
                    <option value={ApprovalStatus.REJECTED}>Từ chối</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className={getApprovalStatusArrowStyle(row.approvalStatus)} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-center font-bold text-gray-600">{row.renew || 0}</td>
              <td className="px-6 py-6">
                <span className="font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                  {row.receiveMethod === ReceiveMethod.EBOOK ? 'Ebook' : row.receiveMethod === ReceiveMethod.HOME_PICKUP ? 'Qua ĐVVC' : 'Thư viện'}
                </span>
              </td>
              <td className="px-6 py-6 text-center">
                <div className="flex items-center justify-center gap-4 text-gray-400">
                  <button onClick={() => handleEditRecord(row, 'borrow')} className="hover:text-gray-600 transition-colors" title="Sửa thông tin"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(row.id)} className="hover:text-red-500 transition-colors" title="Xoá yêu cầu"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const filteredReturnData = (data: any[]) => (data || []).filter(item =>
    item && (
      item.id?.toString().includes(searchQuery) ||
      item.borrowRecord?.user?.userName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      item.borrowRecord?.book?.title?.toLowerCase()?.includes(searchQuery.toLowerCase())
    )
  );

  const renderReturnTable = (data: ReturnRecord[]) => (
    <table className="w-full text-left border-collapse min-w-[1100px]">
      <thead className="sticky top-0 z-10 bg-white shadow-sm">
        <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-white">
          <th className="px-6 py-5">MÃ ĐƠN MƯỢN</th>
          <th className="px-6 py-5">NGÀY HẾT HẠN</th>
          <th className="px-6 py-5">NGÀY TRẢ</th>
          <th className="px-6 py-5 text-center">SỐ NGÀY TRỄ</th>
          <th className="px-6 py-5 text-center">PHÍ PHẠT</th>
          <th className="px-6 py-5 text-center">BÁO MẤT SÁCH</th>
          <th className="px-6 py-5 text-center">TÌNH TRẠNG SÁCH</th>
          <th className="px-6 py-5 text-center">TRẢ SÁCH</th>
          <th className="px-6 py-5">PHÊ DUYỆT</th>
          <th className="px-6 py-5 text-center">THAO TÁC</th>
        </tr>
      </thead>
      <tbody className="text-[13px] text-gray-700">
        {filteredReturnData(data).length === 0 ? (
          <tr>
            <td colSpan={10} className="px-6 py-12 text-center text-gray-500 font-medium">Không tìm thấy dữ liệu.</td>
          </tr>
        ) : (
          filteredReturnData(data).map((row: ReturnRecord, index) => (
            <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
              <td
                className="px-6 py-6 font-bold text-[#0066cc] cursor-pointer hover:underline"
                onClick={() => row.borrowRecord && handleViewBorrowRecord(row.borrowRecord)}
                title="Xem thông tin đơn mượn"
              >
                {row.borrowRecord?.id}
              </td>
              <td className="px-6 py-6 text-gray-500 font-medium">{formatDateTime(row.borrowRecord?.dueDate)}</td>
              <td className="px-6 py-6 text-gray-500 font-medium">{formatDateTime(row.returnDate)}</td>
              <td className="px-6 py-6 text-gray-500 font-medium text-center">{row.returnDelayDays || 0}</td>
              <td className="px-6 py-6 text-gray-500 font-medium text-center">{row.fineAmount || 0}</td>
              <td className="px-6 py-6 text-center">
                <div className="relative inline-block">
                  <select
                    value={row.isLost ? "true" : "false"}
                    onChange={(e) => handleUpdateReturnLost(row.id, e.target.value === "true")}
                    className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${row.isLost
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <option value="false">Không</option>
                    <option value="true">Đã mất</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className={row.isLost ? 'text-red-600' : 'text-gray-500'} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-center">
                <div className="relative inline-block text-left">
                  <select
                    value={row.damageLevel?.id || ""}
                    onChange={(e) => handleUpdateReturnDamage(row.id, parseInt(e.target.value))}
                    className="appearance-none outline-none text-xs font-bold rounded-full px-3 py-1.5 pr-8 border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <option value="">Bình thường</option>
                    <option value="1">Nhẹ - 20%</option>
                    <option value="2">Nặng - 50%</option>
                    <option value="3">Rất Nặng - 80%</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className="text-gray-500" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-center">
                <span className="font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-xs whitespace-nowrap">
                  {row.returnMethod === ReturnMethod.EBOOK ? 'Ebook' :
                    row.returnMethod === ReturnMethod.HOME_RETURN ? 'Qua ĐVVC' : 'Thư viện'}
                </span>
              </td>
              <td className="px-6 py-6">
                <div className="relative inline-block">
                  <select
                    value={row.approvalStatus}
                    onChange={(e) => handleUpdateReturnApproval(row.id, e.target.value)}
                    className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${getApprovalStatusStyle(row.approvalStatus)}`}
                  >
                    <option value={ApprovalStatus.PENDING}>Chờ duyệt</option>
                    <option value={ApprovalStatus.APPROVED}>Đã duyệt</option>
                    <option value={ApprovalStatus.REJECTED}>Từ chối</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown size={14} className={getApprovalStatusArrowStyle(row.approvalStatus)} />
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-4 text-gray-400">
                    <button onClick={() => handleEditRecord(row, 'return')} className="hover:text-gray-600 transition-colors" title="Sửa thông tin"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteReturn(row.id)} className="hover:text-red-500 transition-colors" title="Xoá yêu cầu"><Trash2 size={18} /></button>
                  </div>
                  {row.approvalStatus === ApprovalStatus.PENDING && (row.fineAmount > 0 || row.damageLevel || row.isLost) && (
                    <button
                      onClick={() => handleCreatePayment(row.id)}
                      className="border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-[10px] px-3 py-1.5 rounded-full transition-colors uppercase whitespace-nowrap"
                    >
                      Tạo thanh toán
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderDeliveringTable = () => (
    <table className="w-full text-left border-collapse min-w-[900px]">
      <thead className="sticky top-0 z-10 bg-white shadow-sm">
        <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-white">
          <th className="px-6 py-5">MÃ GIAO HÀNG</th>
          <th className="px-6 py-5">ĐỘC GIẢ</th>
          <th className="px-6 py-5">SÁCH</th>
          <th className="px-6 py-5">LIÊN HỆ</th>
          <th className="px-6 py-5 text-center">TRẠNG THÁI</th>
        </tr>
      </thead>
      <tbody className="text-[13px] text-gray-700">
        {delivering.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Không tìm thấy giao dịch.</td>
          </tr>
        ) : (
          delivering.map((row: Shipment, index) => {
            const borrowRecord = row.borrowRecord || records.find(r => r.id === row.borrowRecordId);
            const user = borrowRecord?.user;
            const book = borrowRecord?.book;
            
            return (
              <tr key={row.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
                <td className="px-6 py-6 font-bold text-gray-500">{row.trackingCode || `SHP-${row.id}`}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 shadow-inner">
                      {getAvatarInitials(user?.userName)}
                    </div>
                    <p className="font-bold text-gray-900">{user?.userName || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-6 py-6 text-gray-700 font-bold">{book?.title || 'N/A'}</td>
                <td className="px-6 py-6 text-gray-500 font-medium">{user?.email || user?.phoneNum || 'N/A'}</td>
                <td className="px-6 py-6 text-center">
                  <div className="relative inline-block text-left">
                    <select
                      value={row.shipmentStatus}
                      onChange={(e) => handleToggleDeliveringStatus(row.id, e.target.value)}
                      className="appearance-none bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold rounded-full px-3 py-1.5 pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-300"
                    >
                      <option value={ShipmentStatus.WAITING_CONFIRMATION}>Chờ xác nhận</option>
                      <option value={ShipmentStatus.WAITING_FOR_PICKUP}>Chờ lấy hàng</option>
                      <option value={ShipmentStatus.ON_DELIVERY}>Đang giao</option>
                      <option value={ShipmentStatus.DELIVERED}>Giao thành công</option>
                      <option value={ShipmentStatus.FAILED}>Thất bại</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <ChevronDown size={14} className="text-yellow-600" />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header title="Quản lý Mượn Trả Sách" />
        <div className="p-8 flex-1 overflow-y-auto flex flex-col">
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mượn/Trả Sách</h1>
            <div className="flex justify-between items-center mt-4">
              <div className="flex border-b border-gray-200 gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-[#0066cc]' : 'text-gray-400 hover:text-gray-700'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#0066cc] rounded-t-full"></span>}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-60">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                  />
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white px-5 py-2 rounded-full font-bold text-sm transition-colors shadow-md whitespace-nowrap"
                >
                  <Plus size={18} /> Tạo ghi nhận
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
              <div className="overflow-x-auto flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'Yêu cầu mượn' && renderBorrowTable(newRequests)}
                {activeTab === 'Yêu cầu trả' && renderReturnTable(returnRequests)}
                {activeTab === 'Đang mượn' && renderBorrowTable(borrowing)}
                {activeTab === 'Đã trả' && renderReturnTable(approvedReturns)}
                {activeTab === 'Đã hủy' && renderBorrowTable(cancelled)}
                {activeTab === 'Giao hàng' && renderDeliveringTable()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateRequestModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateRequest} />
      <EditRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={editingRecord}
        type={editingType}
        onSave={handleSaveEdit}
      />
      <BorrowRecordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={viewingRecord}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        record={paymentRecord}
        borrowRecords={records}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
