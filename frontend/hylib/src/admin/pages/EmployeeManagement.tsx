import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EmployeeTable from '../components/EmployeeTable';
import CreateUserModal from '../components/CreateUserModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import EditUserModal from '../components/EditUserModal';
import { userApi } from '../../api/userApi';
import { User, RoleName, UserStatus } from '../../types';
import { Search, ChevronDown, Plus, Filter } from 'lucide-react';

export default function EmployeeManagement() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteEmployeeData, setDeleteEmployeeData] = useState<any>(null);
  const [editEmployeeData, setEditEmployeeData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [roleFilter, setRoleFilter] = useState('Tất cả');

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddUser = async (data: any, password?: string) => {
    try {
      await userApi.createUser({
        userName: data.userName,
        fullName: data.fullName,
        email: data.email,
        phoneNum: data.phoneNum,
        avatarUrl: data.avatarUrl || '',
        role: data.role || RoleName.LIBRARIAN,
        userStatus: data.userStatus || UserStatus.ACTIVE,
        password: password || 'password123'
      });
      handleRefresh();
    } catch (error) {
      console.error('Failed to create employee', error);
      alert('Không thể tạo nhân viên. Tên đăng nhập hoặc email có thể đã tồn tại!');
    }
  };

  const handleUpdateRole = async (user: any) => {
    try {
      await userApi.updateUser(user.id, {
        fullName: user.fullName,
        email: user.email,
        phoneNum: user.phoneNum,
        avatarUrl: user.avatarUrl,
        role: user.role,
        userStatus: user.userStatus
      });
      handleRefresh();
    } catch (error) {
      console.error('Failed to update employee', error);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteEmployeeData) {
      await userApi.deleteUser(deleteEmployeeData.id);
      setDeleteEmployeeData(null);
      handleRefresh();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb]">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <div className="p-8 flex-1 overflow-y-auto flex flex-col">
          {/* Page Header */}
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nhân viên</h1>
            
            <div className="flex justify-between items-center">
              <div className="flex-1"></div>
              <div className="flex gap-3 items-center">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                  />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative inline-block">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-full pl-10 pr-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:border-[#0066cc] cursor-pointer"
                  >
                    <option value="Tất cả">Lọc: Trạng thái</option>
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.INACTIVE}>Inactive</option>
                    <option value={UserStatus.BANNED}>Banned</option>
                  </select>
                  <Filter size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                {/* Role Filter Dropdown */}
                <div className="relative inline-block">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-full pl-10 pr-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:border-[#0066cc] cursor-pointer"
                  >
                    <option value="Tất cả">Lọc: Quyền hạn</option>
                    <option value={RoleName.ADMIN}>Admin</option>
                    <option value={RoleName.LIBRARIAN}>Librarian</option>
                  </select>
                  <Filter size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-5 py-2 rounded-full font-medium transition-colors flex items-center gap-2 text-sm shadow-md whitespace-nowrap"
                >
                  <Plus size={18} />
                  Thêm nhân viên
                </button>
              </div>
            </div>
          </div>

          {/* Main Table Area */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <EmployeeTable 
              refreshTrigger={refreshTrigger} 
              onDelete={(emp: any) => setDeleteEmployeeData(emp)} 
              onEdit={(emp: any) => setEditEmployeeData(emp)}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              roleFilter={roleFilter}
            />
          </div>
          
        </div>
      </main>

      <CreateUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddUser} 
      />

      <ConfirmDeleteModal 
        isOpen={!!deleteEmployeeData} 
        onClose={() => setDeleteEmployeeData(null)} 
        onConfirm={handleDeleteUser}
        title="Xoá nhân viên"
        message="Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống? Hành động này không thể hoàn tác."
      />

      <EditUserModal
        isOpen={!!editEmployeeData}
        onClose={() => setEditEmployeeData(null)}
        onSave={handleUpdateRole}
        user={editEmployeeData}
      />
    </div>
  );
}
