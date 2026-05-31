import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Search, ChevronDown, Edit, Plus, ChevronLeft, ChevronRight, Trash2, Filter } from 'lucide-react';
import { User, RoleName, UserStatus } from '../../types';
import { userApi } from '../../api/userApi';

export default function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterType, setFilterType] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // In a real scenario, this will hit the backend. For now, it might return empty or mock data.
      const response = await userApi.getAllUsers();
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        // Fallback mock data matching User interface if backend is not ready
        setUsers([
          {
            id: 1,
            userName: 'nva001',
            fullName: 'Nguyễn Văn A',
            email: 'nva@email.com',
            phoneNum: '0901234567',
            avatarUrl: '',
            role: RoleName.READER,
            userStatus: UserStatus.ACTIVE
          },
          {
            id: 2,
            userName: 'ttb002',
            fullName: 'Trần Thị B',
            email: 'ttb@email.com',
            phoneNum: '0987654321',
            avatarUrl: '',
            role: RoleName.ADMIN,
            userStatus: UserStatus.ACTIVE
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleAddUser = async (newUser: User, password?: string) => {
    try {
      const createdUser = await userApi.createUser({
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNum: newUser.phoneNum,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        userStatus: newUser.userStatus,
        password: password || 'password123'
      });
      if (createdUser) {
        setUsers([createdUser, ...users]);
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to create user', error);
      alert('Không thể tạo người dùng. Tên đăng nhập hoặc email có thể đã tồn tại!');
    }
  };

  const toggleStatus = async (id: number, newStatus: UserStatus) => {
    try {
      const user = users.find(u => u.id === id);
      if (user) {
        const updated = await userApi.updateUser(id, {
          fullName: user.fullName,
          email: user.email,
          phoneNum: user.phoneNum,
          avatarUrl: user.avatarUrl,
          role: user.role,
          userStatus: newStatus
        });
        if (updated) {
          setUsers(users.map(u => u.id === id ? updated : u));
        } else {
          fetchUsers();
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleUpdateRole = async (updatedUser: User) => {
    try {
      const updated = await userApi.updateUser(updatedUser.id, {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNum: updatedUser.phoneNum,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        userStatus: updatedUser.userStatus
      });
      if (updated) {
        setUsers(users.map(u => u.id === updatedUser.id ? updated : u));
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await userApi.deleteUser(selectedUser.id);
        setUsers(users.filter(user => user.id !== selectedUser.id));
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const getAccountTypeStyle = (role: RoleName) => {
    switch (role) {
      // case RoleName.ADMIN:
      //   return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
      // case RoleName.LIBRARIAN:
      //   return 'bg-blue-50 text-[#0056b3] border-blue-200 hover:bg-blue-100';
      case RoleName.GUEST:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
      case RoleName.READER:
        return 'bg-[#fff8e1] text-[#f57f17] border-orange-200 hover:bg-[#fff3cd]';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
    }
  };

  const getRoleChevronStyle = (role: RoleName) => {
    switch (role) {
      // case RoleName.ADMIN:
      //   return 'text-purple-600';
      // case RoleName.LIBRARIAN:
      //   return 'text-blue-600';
      case RoleName.GUEST:
        return 'text-gray-500';
      case RoleName.READER:
        return 'text-[#f57f17]';
      default:
        return 'text-gray-500';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filterType === 'Tất cả' || user.role === filterType;
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#f8f9fb]">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header />

        <div className="p-8 flex-1 overflow-y-auto flex flex-col">
          {/* Page Header */}
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>

            <div className="flex justify-between items-center">
              <div className="flex-1"></div>
              <div className="flex gap-3 items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-all shadow-sm"
                  />
                </div>

                <div className="relative inline-block">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-full pl-10 pr-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:border-[#0066cc] cursor-pointer"
                  >
                    <option value="Tất cả">Lọc: Tất cả</option>
                    <option value={RoleName.READER}>Reader</option>
                    {/* <option value={RoleName.ADMIN}>Admin</option> */}
                    <option value={RoleName.LIBRARIAN}>Librarian</option>
                    <option value={RoleName.GUEST}>Guest</option>
                  </select>
                  <Filter size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-5 py-2 rounded-full font-medium transition-colors flex items-center gap-2 text-sm shadow-md"
                >
                  <Plus size={18} />
                  Thêm người dùng
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
              <div className="overflow-x-auto flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-10 bg-white shadow-sm">
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-5">ID</th>
                      <th className="px-6 py-5">NGƯỜI DÙNG</th>
                      <th className="px-6 py-5">THÔNG TIN LIÊN HỆ</th>
                      <th className="px-6 py-5">VAI TRÒ</th>
                      <th className="px-6 py-5">TRẠNG THÁI</th>
                      <th className="px-6 py-5 text-center">THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-gray-700">
                    {filteredUsers.map((user, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
                        <td className="px-6 py-5 font-bold text-gray-500">#{user.id}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-gray-500 text-lg">{user.fullName.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">@{user.userName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{user.phoneNum}</span>
                            <span className="text-gray-500 text-xs">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="relative inline-block">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole({ ...user, role: e.target.value as RoleName })}
                              className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${getAccountTypeStyle(user.role)}`}
                            >
                              <option value={RoleName.READER}>Reader</option>
                              {/* <option value={RoleName.ADMIN}>Admin</option> */}
                              {/* <option value={RoleName.LIBRARIAN}>Librarian</option> */}
                              <option value={RoleName.GUEST}>Guest</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                              <ChevronDown size={14} className={getRoleChevronStyle(user.role)} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="relative inline-block">
                            <select
                              value={user.userStatus}
                              onChange={(e) => toggleStatus(user.id, e.target.value as UserStatus)}
                              className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${user.userStatus === UserStatus.ACTIVE
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : user.userStatus === UserStatus.BANNED
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                              <option value={UserStatus.ACTIVE}>Active</option>
                              <option value={UserStatus.INACTIVE}>Inactive</option>
                              <option value={UserStatus.BANNED}>Banned</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                              <ChevronDown size={14} className={
                                user.userStatus === UserStatus.ACTIVE ? 'text-green-600' :
                                  user.userStatus === UserStatus.BANNED ? 'text-red-600' : 'text-gray-500'
                              } />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-4 text-gray-400">
                            <button onClick={() => openEditModal(user)} className="hover:text-gray-600 transition-colors" title="Sửa thông tin"><Edit size={18} /></button>
                            <button onClick={() => openDeleteModal(user)} className="hover:text-red-500 transition-colors" title="Xoá người dùng"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 bg-white">
                <span>Hiển thị 1 đến {filteredUsers.length} trong số {filteredUsers.length} người dùng</span>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><ChevronLeft size={16} /></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0056b3] text-white font-medium">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleUpdateRole}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

