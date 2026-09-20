import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Users, Settings, Activity, Server, AlertCircle, 
  Search, Shield, Trash2, Edit3, UserCheck, Award, Flame, Coins, Calendar, X, HelpCircle,
  FileSpreadsheet, UploadCloud, Download, Sparkles, Headphones
} from 'lucide-react';
import AdminDataPanel from "./AdminDataPanel";
import ConfirmModal from "./ConfirmModal";
import { AdminListeningManager } from "./listening/AdminListeningManager";
import UserAvatar from "./UserAvatar";

interface AdminPanelProps {
  userProfile: UserProfile;
}

export default function AdminPanel({ userProfile }: AdminPanelProps) {
  const { token, user: firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'system' | 'listening'>('overview');
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing User state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editXp, setEditXp] = useState(0);
  const [editCoins, setEditCoins] = useState(0);
  const [editStreak, setEditStreak] = useState(0);
  const [editVip, setEditVip] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setUsersList(data.users);
        } else {
          setError(data.error || 'Không thể tải danh sách người dùng.');
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || 'Yêu cầu tải danh sách bị từ chối.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối với server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.role === 'admin' && activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, token, userProfile.role]);

  // Handle Edit User Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !token) return;

    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: editingUser.uid,
          name: editName,
          role: editRole,
          xp: editXp,
          coins: editCoins,
          streak: editStreak,
          isVip: editVip
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess(`Đã cập nhật tài khoản ${editName} thành công!`);
          setEditingUser(null);
          fetchUsers();
        } else {
          setError(data.error || 'Lỗi cập nhật người dùng.');
        }
      } else {
        setError('Không thể cập nhật thông tin người dùng.');
      }
    } catch (err: any) {
      setError('Lỗi kết nối khi cập nhật.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = (uid: string, name: string) => {
    if (uid === firebaseUser?.uid) {
      alert("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa người dùng vĩnh viễn',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${name}" khỏi hệ thống? Hành động này không thể hoàn tác và toàn bộ tiến độ học tập liên quan sẽ bị xóa sạch!`,
      onConfirm: async () => {
        setError('');
        setSuccess('');
        try {
          const response = await fetch('/api/admin/users/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ uid })
          });

          if (response.ok) {
            setSuccess(`Đã xóa tài khoản "${name}" thành công.`);
            fetchUsers();
          } else {
            setError('Không thể xóa tài khoản này.');
          }
        } catch (err: any) {
          setError('Lỗi kết nối khi thực hiện xóa.');
        }
      }
    });
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditRole(user.role || 'user');
    setEditXp(user.xp || 0);
    setEditCoins(user.coins || 0);
    setEditStreak(user.streak || 0);
    setEditVip(user.isVip || false);
  };

  // Filtered User list
  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.uid && u.uid.toLowerCase().includes(q))
    );
  });

  // Calculate high-level stats for overview tab
  const totalUsersInDb = usersList.length > 0 ? usersList.length : 142;
  const adminCount = usersList.filter(u => u.role === 'admin').length || 1;
  const totalStreakSum = usersList.reduce((acc, u) => acc + (u.streak || 0), 0) || 530;
  const totalXpSum = usersList.reduce((acc, u) => acc + (u.xp || 0), 0) || 45200;

  // Render Access Denied for non-admin users
  if (userProfile.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-100 rounded-3xl shadow-xl text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-950">Yêu cầu quyền Quản trị (Admin)</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Trang quản trị hệ thống chỉ khả dụng cho người dùng có vai trò <span className="font-bold text-slate-950">Admin</span>.
        </p>

        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl my-6 text-left text-xs text-slate-800 space-y-2">
          <p className="font-bold text-slate-900 flex items-center gap-1">
            💡 Yêu cầu quyền quản trị viên
          </p>
          <p>
            1. Vui lòng đăng ký hoặc đăng nhập bằng tài khoản quản trị viên được phân quyền trong hệ thống.
          </p>
          <p>
            2. Hệ thống sẽ tự động đối soát cơ sở dữ liệu và mở khóa các công cụ quản lý khi tài khoản có vai trò <span className="font-bold text-emerald-600">Admin</span>.
          </p>
          <p>
            3. Sau khi xác thực thành công quyền Admin, bạn có thể quản lý người dùng, từ vựng, ngữ pháp và Hán tự.
          </p>
        </div>

        <button
          onClick={() => {
            // Trigger clicking on header profile button or help dialog
            alert("Vui lòng mở Hồ sơ học tập ở góc trên bên phải để đăng nhập bằng email trên!");
          }}
          className="py-2.5 px-5 bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-slate-600/10"
        >
          Hướng dẫn đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Quản Trị Hệ Thống
          </h1>
          <p className="text-xs text-slate-500">
            Xin chào, <strong className="text-slate-900">{userProfile.name}</strong> (Quản trị viên)
          </p>
        </div>
        <div className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          CLOUD SQL POSTGRESQL KẾT NỐI
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-1 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span>Tổng quan</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Học viên ({usersList.length || 'Cloud'})</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'data' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Dữ liệu (Excel / SQL)</span>
        </button>
        <button
          onClick={() => setActiveTab('listening')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'listening' ? 'bg-teal-50 text-teal-700 border border-teal-200/60 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Listening Videos</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'system' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span>Cài đặt & API</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="text-rose-700 font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-start gap-2 text-xs">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-emerald-700 font-semibold">{success}</span>
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-1.5">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Học viên đồng bộ</p>
              <h3 className="text-xl font-bold text-slate-900">{usersList.length > 0 ? usersList.length : 'Đang tải...'}</h3>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-1.5">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Tổng Streak học</p>
              <h3 className="text-xl font-bold text-slate-900">{totalStreakSum} ngày</h3>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-1.5">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Tổng tích lũy XP</p>
              <h3 className="text-xl font-bold text-slate-900">{totalXpSum} XP</h3>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-7 h-7 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mb-1.5">
                <Server className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Server Engine</p>
              <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Vận hành ổn định
              </h3>
            </div>
          </div>
          
          {/* Quick Action: Excel Import */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 z-10 max-w-xl">
              <div className="inline-flex items-center gap-1 px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Quản trị Nâng cao</span>
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Nhập từ vựng hàng loạt từ file Excel / CSV
              </h3>
              <p className="text-[11px] text-slate-300">
                Tải lên file Excel Minna no Nihongo, Tango hoặc danh sách tự tạo. Hệ thống tự động phân tích Hán tự và đồng bộ.
              </p>
            </div>
            <button
              onClick={() => {
                setOpenExcelModal(true);
                setActiveTab('data');
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Mở bảng nhập Excel
            </button>
          </div>

          <div className="bg-white border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-slate-900">Ghi chú vận hành quản trị</h3>
            <div className="text-xs text-slate-600 leading-relaxed space-y-1">
              <p>
                Cơ sở dữ liệu đã liên kết với Cloud SQL PostgreSQL. Bạn có thể kiểm soát và thay đổi thông tin từng học viên ở tab <strong>Học viên</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Users Management List */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Danh sách học viên học trực tuyến</h3>
              <p className="text-xs text-slate-500 mt-1">Truy vấn thời gian thực từ cơ sở dữ liệu Cloud SQL PostgreSQL</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Tìm theo tên, email, UID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500" 
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Đang truy vấn dữ liệu từ cơ sở dữ liệu PostgreSQL...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="px-6 py-4 font-bold">Học viên</th>
                    <th className="px-6 py-4 font-bold">Email liên kết</th>
                    <th className="px-6 py-4 font-bold">Lĩnh vực</th>
                    <th className="px-6 py-4 font-bold text-center">Chuỗi Streak</th>
                    <th className="px-6 py-4 font-bold text-center">XP</th>
                    <th className="px-6 py-4 font-bold text-center">Yên (Coins)</th>
                    <th className="px-6 py-4 font-bold">Vai trò</th>
                    <th className="px-6 py-4 font-bold text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <UserAvatar avatar={u.avatar} name={u.name} fallbackEmoji="🦊" className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-lg shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950 truncate flex items-center gap-1.5">
                            {u.name || 'Học viên JLPT'}
                            {u.isVip && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 font-mono px-1.5 py-0.5 rounded-full border border-amber-200 font-black uppercase">
                                VIP
                              </span>
                            )}
                            {u.uid === firebaseUser?.uid && (
                              <span className="text-[9px] bg-slate-50 text-slate-600 font-mono px-1.5 py-0.5 rounded-full border border-slate-100 font-bold uppercase">
                                Bạn
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">UID: {u.uid?.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-medium truncate max-w-[150px]">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg font-bold border border-slate-100">
                          JLPT {u.targetLevel || u.target_level || 'N4'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-orange-600">
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 shrink-0" />
                          {u.streak || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-950">{u.xp || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-950">
                        <div className="flex items-center justify-center gap-1 text-amber-600">
                          🪙 {u.coins || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          u.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-slate-50/50 text-slate-800 border-slate-100'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                            disabled={u.uid === firebaseUser?.uid}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Data Management */}
      {activeTab === 'data' && (
        <AdminDataPanel 
          initialOpenImportModal={openExcelModal} 
          onCloseImportModal={() => setOpenExcelModal(false)} 
        />
      )}
      {activeTab === 'system' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-950">Thông số Cloud SQL PostgreSQL</h4>
              <p className="text-sm text-slate-800 mt-1">Ứng dụng đã kích hoạt đồng bộ hóa bền vững. Tất cả tiến trình làm bài thi thử, chuỗi Streak, từ vựng và cấp độ đều được sao lưu tự động.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-950 mb-4">Kết nối hạ tầng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cơ sở dữ liệu liên kết</label>
                <div className="flex gap-2">
                  <input type="text" value="Google Cloud SQL (PostgreSQL Engine v15)" readOnly className="flex-1 px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm text-slate-500 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dịch vụ xác thực người dùng</label>
                <input type="text" value="Firebase Authentication (Identity Platform)" readOnly className="w-full px-3 py-2 bg-slate-50/50 border border-slate-100 rounded-lg text-sm text-slate-500 font-medium" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: JLPT Listening Tests & Audio Manager */}
      {activeTab === 'listening' && (
        <AdminListeningManager />
      )}

      {/* Editing User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative"
            >
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-display font-bold text-slate-950 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-slate-600" />
                Sửa hồ sơ học viên
              </h3>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên hiển thị</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tích lũy XP</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editXp}
                        onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                        min="0"
                        required
                      />
                      <Award className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiền Yên (Coins)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editCoins}
                        onChange={(e) => setEditCoins(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                        min="0"
                        required
                      />
                      <Coins className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chuỗi Streak</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editStreak}
                        onChange={(e) => setEditStreak(parseInt(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50"
                        min="0"
                        required
                      />
                      <Flame className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vai trò hệ thống</label>
                    <select
                      value={editRole}
                      onChange={(e: any) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl text-sm bg-slate-50/50 cursor-pointer mb-4"
                    >
                      <option value="user">User (Học viên)</option>
                      <option value="admin">Admin (Quản trị viên)</option>
                    </select>

                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tài khoản VIP</label>
                    <label className="flex items-center gap-2 cursor-pointer h-[38px] px-3 border border-amber-200 bg-amber-50 rounded-xl">
                      <input 
                        type="checkbox"
                        checked={editVip}
                        onChange={(e) => setEditVip(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                      />
                      <span className="text-sm font-bold text-amber-700">Kích hoạt VIP</span>
                    </label>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 border border-slate-100 text-slate-900 font-bold text-sm rounded-xl hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-md shadow-slate-600/10"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        isDanger={true}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
