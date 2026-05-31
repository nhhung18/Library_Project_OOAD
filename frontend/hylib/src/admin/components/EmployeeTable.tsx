import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { User, RoleName, UserStatus } from '../../types';
import { userApi } from '../../api/userApi';

interface EmployeeTableProps {
  refreshTrigger: number;
  onDelete: (emp: User) => void;
  onEdit: (emp: User) => void;
  searchQuery: string;
  statusFilter: string;
  roleFilter: string;
}

export default function EmployeeTable({ 
  refreshTrigger, 
  onDelete, 
  onEdit,
  searchQuery,
  statusFilter,
  roleFilter
}: EmployeeTableProps) {
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    fetchLibrarians();
  }, [refreshTrigger]);

  const fetchLibrarians = async () => {
    try {
      const response = await userApi.getLibrarians();
      if (Array.isArray(response)) {
        setEmployees(response);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching librarians:", error);
    }
  };

  const toggleStatus = async (id: number, newStatus: UserStatus) => {
    try {
      const userToUpdate = employees.find(u => u.id === id);
      if (userToUpdate) {
        await userApi.updateUser(id, {
          fullName: userToUpdate.fullName,
          email: userToUpdate.email,
          phoneNum: userToUpdate.phoneNum,
          avatarUrl: userToUpdate.avatarUrl,
          role: userToUpdate.role,
          userStatus: newStatus
        });
        fetchLibrarians();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const getAccountTypeStyle = (role: string) => {
    switch (role) {
      case RoleName.ADMIN:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case RoleName.LIBRARIAN:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case RoleName.READER:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleChevronStyle = (role: string) => {
    switch (role) {
      case RoleName.ADMIN: return 'text-purple-600';
      case RoleName.LIBRARIAN: return 'text-blue-600';
      case RoleName.READER: return 'text-emerald-600';
      default: return 'text-gray-500';
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.id?.toString().includes(searchQuery);
    
    // Normalize status strings since the filters might be passed as 'ĐANG MỞ' / 'ĐÃ KHÓA' from old parent or UserStatus
    // We should map them correctly if the parent is passing Vietnamese labels, but for now we match UserStatus if needed.
    // If the parent passes 'Tất cả', it matches all. 
    // Wait, the parent EmployeeManagement has "ĐANG MỞ" and "ĐÃ KHÓA" which we might need to map to ACTIVE/BANNED.
    let mappedStatusFilter = statusFilter;
    if (statusFilter === 'ĐANG MỞ') mappedStatusFilter = UserStatus.ACTIVE;
    if (statusFilter === 'ĐÃ KHÓA') mappedStatusFilter = UserStatus.INACTIVE; // or BANNED

    const matchesStatus = statusFilter === 'Tất cả' || emp.userStatus === mappedStatusFilter;
    
    // Similar for roles if parent passes Vietnamese roles like 'THỦ THƯ' -> 'LIBRARIAN'
    let mappedRoleFilter = roleFilter;
    if (roleFilter === 'THỦ THƯ') mappedRoleFilter = RoleName.LIBRARIAN;
    if (roleFilter === 'QTV') mappedRoleFilter = RoleName.ADMIN;

    const matchesRole = roleFilter === 'Tất cả' || emp.role === mappedRoleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm min-h-0">
      <div className="overflow-x-auto flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-white shadow-sm">
            <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-5">ID</th>
              <th className="px-6 py-5">NHÂN VIÊN</th>
              <th className="px-6 py-5">THÔNG TIN LIÊN HỆ</th>
              <th className="px-6 py-5">VAI TRÒ</th>
              <th className="px-6 py-5">TRẠNG THÁI</th>
              <th className="px-6 py-5 text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-gray-700">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                  Không tìm thấy nhân viên nào.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((user, index) => (
                <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
                  <td className="px-6 py-5 font-bold text-gray-500">#{user.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-gray-500 text-lg">{user.fullName?.charAt(0) || '?'}</span>
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
                      <span className="font-medium">{user.phoneNum || 'Chưa cập nhật'}</span>
                      <span className="text-gray-500 text-xs">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative inline-block">
                      <select
                        value={user.role}
                        onChange={async (e) => {
                          const newRole = e.target.value as RoleName;
                          try {
                            await userApi.updateUser(user.id, {
                              fullName: user.fullName,
                              email: user.email,
                              phoneNum: user.phoneNum,
                              avatarUrl: user.avatarUrl,
                              role: newRole,
                              userStatus: user.userStatus
                            });
                            fetchLibrarians();
                          } catch (error) {
                            console.error("Error updating role:", error);
                          }
                        }}
                        className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${getAccountTypeStyle(user.role)}`}
                      >
                        <option value={RoleName.ADMIN}>Admin</option>
                        <option value={RoleName.LIBRARIAN}>Librarian</option>
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
                        className={`appearance-none outline-none cursor-pointer text-xs font-bold rounded-full px-3 py-1.5 pr-8 border transition-colors ${
                          user.userStatus === UserStatus.ACTIVE 
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
                      <button onClick={() => onEdit(user)} className="hover:text-gray-600 transition-colors" title="Sửa thông tin"><Edit2 size={18} /></button>
                      <button onClick={() => onDelete(user)} className="hover:text-red-500 transition-colors" title="Xoá nhân viên"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 bg-white shrink-0">
        <span>Hiển thị 1 đến {filteredEmployees.length} trong số {filteredEmployees.length} nhân viên</span>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><ChevronLeft size={16} /></button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0056b3] text-white font-medium">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
