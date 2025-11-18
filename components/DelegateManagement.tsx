
import React, { useState, useMemo, useEffect } from 'react';
import type { User, Delegate, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';


export const UserStaffModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any, userId?: number) => void;
    userToEdit: User | null;
    delegateToEdit: Delegate | null;
    allowedRoles?: Role[];
}> = ({ isOpen, onClose, onSave, userToEdit, delegateToEdit, allowedRoles }) => {
    
    const [formData, setFormData] = useState({
        fullName: '', phone: '', email: '',
        username: '', password: '', confirmPassword: '', role: 'delegate' as Role
    });

    useEffect(() => {
        const defaultRole = allowedRoles ? allowedRoles[0] : 'delegate';
        if (isOpen && userToEdit) {
            setFormData({
                fullName: userToEdit.fullName || '',
                phone: delegateToEdit?.phone || '',
                email: delegateToEdit?.email || '',
                username: userToEdit.username || '',
                password: '',
                confirmPassword: '',
                role: userToEdit.role || defaultRole
            });
        } else {
             setFormData({
                fullName: '', phone: '', email: '',
                username: '', password: '', confirmPassword: '', role: defaultRole
             });
        }
    }, [isOpen, userToEdit, delegateToEdit, allowedRoles]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("كلمتا المرور غير متطابقتين.");
            return;
        }
        if (!userToEdit && !formData.password) {
            alert("كلمة المرور مطلوبة للمستخدم الجديد.");
            return;
        }
        onSave(formData, userToEdit?.id);
        onClose();
    };
    
    const allRoleOptions: { value: Role; label: string }[] = [
        { value: 'delegate', label: '🤝 مندوب' },
        { value: 'manager', label: '📝 مسؤول تسجيل' },
        { value: 'admin', label: '🎯 مدير نظام' },
    ];

    const roleOptions = allowedRoles ? allRoleOptions.filter(opt => allowedRoles.includes(opt.value)) : allRoleOptions;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl my-8">
                <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-xl font-bold">{userToEdit ? `تعديل بيانات: ${userToEdit.fullName}` : 'إضافة مستخدم/موظف جديد'}</h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:opacity-80 transition-opacity">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-primary)] border-b border-[var(--color-primary-light)] pb-2 mb-3">🔷 البيانات الشخصية</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="الاسم الكامل" id="fullName" value={formData.fullName} onChange={handleChange} />
                            <InputField label="رقم الهاتف" id="phone" value={formData.phone} onChange={handleChange} type="tel" />
                            <InputField label="البريد الإلكتروني" id="email" value={formData.email} onChange={handleChange} type="email" className="md:col-span-2"/>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-secondary)] border-b border-[var(--color-secondary-light)] pb-2 mb-3">🔐 حساب النظام</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <InputField label="اسم المستخدم" id="username" value={formData.username} onChange={handleChange} />
                           <div>
                                <label htmlFor="role" className="block font-semibold mb-2 text-[var(--color-text-base)]">الصلاحية:</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)]">
                                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                           </div>
                           <InputField label="كلمة المرور" id="password" type="password" value={formData.password} onChange={handleChange} placeholder={userToEdit ? "اتركه فارغاً لعدم التغيير" : ""} required={!userToEdit} />
                           <InputField label="تأكيد كلمة المرور" id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required={!userToEdit && !!formData.password}/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-[var(--color-border)] text-[var(--color-text-base)] font-bold py-2 px-6 rounded-lg hover:brightness-95 transition-all">إلغاء</button>
                        <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-6 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const InputField: React.FC<{ label: string; id: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, required?: boolean, className?: string }> = ({ label, id, type = 'text', value, onChange, placeholder, required=true, className='' }) => (
    <div className={className}>
        <label htmlFor={id} className="block font-semibold mb-2 text-[var(--color-text-base)]">{label}:</label>
        <input type={type} id={id} name={id} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)]" />
    </div>
);


const Notification: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const baseClasses = "p-4 rounded-md text-[var(--color-primary-text)] font-bold mb-4 flex items-center gap-2 whitespace-pre-wrap";
    const typeClasses = { success: "bg-[var(--color-secondary)]", error: "bg-[var(--color-primary)]" };
    const icon = type === 'success' ? '✅ 🔶' : '❌ 🔷';
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{icon} {message}</div>;
}

export const DelegateManagement: React.FC = () => {
  const { users, delegates, addUser, updateUser, toggleUserStatus } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<Role | ''>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'active' | 'inactive'>('');
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const delegateMap = useMemo(() => new Map(delegates.map(d => [d.userId, d])), [delegates]);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.fullName])), [users]);
  
  const roleLabels: Record<Role, string> = { admin: 'مدير نظام', manager: 'مدير تسجيل', delegate: 'مندوب' };

  const handleSave = (data: any, userId?: number) => {
    if (userId) { // Editing
        updateUser(userId, data);
        setNotification({ message: `✅ تم تحديث بيانات ${data.fullName} بنجاح!`, type: 'success' });
    } else { // Adding
        const newUser = addUser(data);
        setNotification({ 
            message: `✅ تم إضافة المستخدم بنجاح!\n📋 الاسم: ${newUser.fullName}\n📞 الهاتف: ${data.phone || 'N/A'}\n🔐 حساب النظام: ${newUser.username}\n🎯 الصلاحية: ${roleLabels[newUser.role]}`, 
            type: 'success' 
        });
    }
    setTimeout(() => setNotification(null), 7000);
  };
  
  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const filteredUsers = useMemo(() => {
    return users
      .map(user => ({...user, delegate: delegateMap.get(user.id)}))
      .filter(user => {
        const matchesSearch = searchTerm === '' ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.delegate?.phone?.includes(searchTerm) ?? false);
        
        const matchesRole = filterRole === '' || user.role === filterRole;

        const matchesStatus = filterStatus === '' ||
          (filterStatus === 'active' && user.isActive) ||
          (filterStatus === 'inactive' && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
      });
  }, [users, delegates, searchTerm, filterRole, filterStatus, delegateMap]);

  return (
    <div>
        <UserStaffModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            userToEdit={editingUser}
            delegateToEdit={editingUser ? delegateMap.get(editingUser.id) ?? null : null}
        />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[var(--color-primary)]">🔷🔶 إدارة المستخدمين والموظفين 🔶🔷</h2>
        <button onClick={openAddModal} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 flex items-center gap-2 shadow w-full md:w-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>إضافة مستخدم/موظف</span>
        </button>
      </div>
      
      {notification && <Notification message={notification.message} type={notification.type} />}

       <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <input
                type="text"
                placeholder="ابحث بالاسم، اسم المستخدم، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)] md:col-span-3"
            />
             <select value={filterRole} onChange={e => setFilterRole(e.target.value as Role | '')} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)] text-[var(--color-text-base)]">
                <option value="">كل الصلاحيات</option>
                <option value="admin">مدير نظام</option>
                <option value="manager">مسؤول تسجيل</option>
                <option value="delegate">مندوب</option>
             </select>
             <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)] text-[var(--color-text-base)]">
                <option value="">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
             </select>
        </div>
        
        {/* Mobile Card View */}
        <div className="space-y-4 md:hidden">
            {filteredUsers.map(user => (
                <div key={user.id} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-primary)]">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-[var(--color-primary)] text-lg">{user.fullName}</p>
                            <p className="text-sm text-[var(--color-text-muted)] font-mono">@{user.username}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-[var(--color-success-light)] text-[var(--color-success-text)]' : 'bg-gray-200 text-gray-800'}`}>
                            {user.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-sm space-y-2 text-[var(--color-text-base)]">
                        <p><strong>الهاتف:</strong> {user.delegate?.phone || '-'}</p>
                        <p><strong>الصلاحية:</strong> {roleLabels[user.role]}</p>
                        <p><strong>مسجل بواسطة:</strong> {user.referredById ? userMap.get(user.referredById) : '-'}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex justify-end gap-4">
                        <button onClick={() => openEditModal(user)} className="text-blue-600 font-semibold text-sm">تعديل</button>
                        <button onClick={() => toggleUserStatus(user.id)} className="text-red-600 font-semibold text-sm">
                            {user.isActive ? 'تعطيل' : 'تفعيل'}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block rounded-t-lg border border-[var(--color-border)]">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
              <tr>
                <th className="p-3 font-semibold whitespace-nowrap">الاسم الكامل</th>
                <th className="p-3 font-semibold whitespace-nowrap">اسم المستخدم</th>
                <th className="p-3 font-semibold whitespace-nowrap">الهاتف</th>
                <th className="p-3 font-semibold whitespace-nowrap">الصلاحية</th>
                <th className="p-3 font-semibold whitespace-nowrap">مسجل بواسطة</th>
                <th className="p-3 font-semibold whitespace-nowrap">الحالة</th>
                <th className="p-3 font-semibold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-text-base)] hover:bg-blue-50 transition-colors`}>
                  <td className="p-3 font-bold text-[var(--color-primary)]">{user.fullName}</td>
                  <td className="p-3 font-mono">{user.username}</td>
                  <td className="p-3">{user.delegate?.phone || '-'}</td>
                  <td className="p-3">{roleLabels[user.role]}</td>
                  <td className="p-3">{user.referredById ? userMap.get(user.referredById) : '-'}</td>
                  <td className="p-3">
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${user.isActive ? 'bg-[var(--color-success-light)] text-[var(--color-success-text)]' : 'bg-gray-200 text-gray-800'}`}>
                        {user.isActive ? '✅ نشط' : '🚫 غير نشط'}
                    </span>
                  </td>
                  <td className="p-3 space-x-2 space-x-reverse whitespace-nowrap">
                     <button onClick={() => openEditModal(user)} className="text-blue-600 hover:underline text-sm font-bold">تعديل</button>
                     <button onClick={() => toggleUserStatus(user.id)} className="text-red-600 hover:underline text-sm font-bold">
                        {user.isActive ? 'تعطيل' : 'تفعيل'}
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {filteredUsers.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)]">لا توجد نتائج مطابقة للبحث.</div>}
        </div>
      </div>
    </div>
  );
};
