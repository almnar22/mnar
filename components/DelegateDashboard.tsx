
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppHeader } from './AppHeader';
import type { Delegate, Student, Role, Commission, BankAccount, User } from '../types';
import { CommissionStatus, StudentStatus } from '../types';
import { RegistrationForm } from './StudentManagement';
import { UserStaffModal } from './DelegateManagement';

interface DelegateDashboardProps {
    delegates: Delegate[];
    students: Student[];
    commissions: Commission[];
    onAddStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
}

type DelegateView = 'dashboard' | 'students' | 'addStudent' | 'addDelegate' | 'commissions' | 'bankAccount' | 'profile' | 'myNetwork' | 'changePassword';

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: 'primary' | 'secondary' }> = ({ title, value, icon, color }) => {
    const colorClasses = {
      primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-[var(--color-secondary)]',
    };
    return (
      <div className={`p-6 rounded-lg shadow-md border-t-4 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--color-text-base)]">{title}</p>
            <p className={`text-3xl font-bold ${color === 'secondary' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-primary)]'}`}>{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    );
};

const TabButton: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 whitespace-nowrap md:flex-initial md:w-auto flex items-center justify-center gap-2 p-3 font-bold rounded-t-lg transition-colors ${
            isActive
                ? 'bg-[var(--color-card)] text-[var(--color-primary)]'
                : 'bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-border)]'
        }`}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);


const Notification: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const baseClasses = "p-4 rounded-md text-[var(--color-primary-text)] font-bold mb-4 flex items-center gap-2 whitespace-pre-wrap";
    const typeClasses = { success: "bg-[var(--color-secondary)]", error: "bg-[var(--color-primary)]" };
    const icon = type === 'success' ? '✅ 🔶' : '❌ 🔷';
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{icon} {message}</div>;
}

const commissionStatusStyles: Record<CommissionStatus, { classes: string, label: string, icon: string }> = {
    [CommissionStatus.Pending]: { classes: 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)]', label: 'معلقة', icon: '⏳' },
    [CommissionStatus.Confirmed]: { classes: 'bg-blue-100 text-blue-800', label: 'مؤكدة', icon: '✅' },
    [CommissionStatus.Paid]: { classes: 'bg-[var(--color-success-light)] text-[var(--color-success-text)]', label: 'مدفوعة', icon: '💰' },
    [CommissionStatus.Cancelled]: { classes: 'bg-red-100 text-red-800', label: 'ملغاة', icon: '❌' },
};

const studentStatusStyles: Record<StudentStatus, { classes: string, label: string, icon: string }> = {
    [StudentStatus.Registered]: { classes: 'bg-green-100 text-green-800', label: 'مسجل', icon: '✅' },
    [StudentStatus.FeesPaid]: { classes: 'bg-sky-100 text-sky-800', label: 'مدفوع الرسوم', icon: '💰' },
    [StudentStatus.Studying]: { classes: 'bg-amber-100 text-amber-800', label: 'مستمر', icon: '📚' },
    [StudentStatus.OnHold]: { classes: 'bg-gray-200 text-gray-800', label: 'متوقف', icon: '⏸️' },
    [StudentStatus.Dropped]: { classes: 'bg-rose-200 text-rose-800', label: 'منقطع', icon: '❌' },
    [StudentStatus.Completed]: { classes: 'bg-purple-100 text-purple-800', label: 'مكتمل', icon: '🎓' },
};


export const DelegateDashboard: React.FC<DelegateDashboardProps> = ({ delegates, students, commissions, onAddStudent }) => {
    const { currentUser, users, logout, addUser, updateUser, bankAccounts, addOrUpdateBankAccount, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState<DelegateView>('dashboard');
    const [isAddDelegateModalOpen, setIsAddDelegateModalOpen] = useState(false);
    const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

    const [bankDetails, setBankDetails] = useState({ bankName: '', accountHolder: '', bankAccount: '' });
    const [profileDetails, setProfileDetails] = useState({ fullName: '', email: '' });
    const [passwordDetails, setPasswordDetails] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    const delegateProfile = currentUser ? delegates.find(d => d.userId === currentUser.id) : undefined;
    
    useEffect(() => {
        if(delegateProfile) {
            const account = bankAccounts.find(ba => ba.delegateId === delegateProfile.id);
            setBankDetails({
                bankName: account?.bankName || '',
                accountHolder: account?.accountHolder || '',
                bankAccount: account?.bankAccount || '',
            });
            setProfileDetails({
                fullName: delegateProfile.fullName,
                email: delegateProfile.email || ''
            });
        }
    }, [delegateProfile, bankAccounts]);
    
    const myNetwork = useMemo(() => {
        if (!currentUser) return [];
        const myRecruits = users.filter(u => u.referredById === currentUser.id);
        return myRecruits.map(user => {
            const delegateInfo = delegates.find(d => d.userId === user.id);
            return {
                ...user,
                phone: delegateInfo?.phone || '-',
                students: delegateInfo?.students || 0,
            }
        });
    }, [users, delegates, currentUser]);


    if (!currentUser || !delegateProfile) return null;

    const myStudents = students.filter(s => s.delegateId === delegateProfile.id);
    const myCommissions = commissions.filter(c => c.delegateId === delegateProfile.id);

    const handleSaveDelegate = (data: any) => {
        const newUser = addUser(data, currentUser.id); // Pass current user's ID as referrer
        setNotification({ 
            message: `✅ تم إضافة المندوب بنجاح!\n📋 الاسم: ${newUser.fullName}\n🔐 حساب النظام: ${newUser.username}`, 
            type: 'success' 
        });
        setTimeout(() => setNotification(null), 7000);
        setIsAddDelegateModalOpen(false);
    };

    const handleBankDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addOrUpdateBankAccount({ delegateId: delegateProfile.id, ...bankDetails });
        setNotification({ message: '✅ تم تحديث بيانات حسابك البنكي بنجاح!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
    };
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(currentUser.id, { ...currentUser, ...profileDetails });
        setNotification({ message: '✅ تم تحديث بياناتك الشخصية بنجاح!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
            setNotification({ message: '❌ كلمات المرور الجديدة غير متطابقة.', type: 'error' });
            return;
        }
        if (passwordDetails.newPassword.length < 6) {
             setNotification({ message: '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل.', type: 'error' });
             return;
        }

        try {
            await changePassword(currentUser.id, passwordDetails.currentPassword, passwordDetails.newPassword);
            setNotification({ message: '✅ تم تغيير كلمة المرور بنجاح!', type: 'success' });
            setPasswordDetails({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
             setNotification({ message: `❌ ${err.message}`, type: 'error' });
        }
         setTimeout(() => setNotification(null), 3000);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <StatCard title="الطلاب المسجلين" value={delegateProfile.students} icon="👥" color="primary" />
                        <StatCard title="العمولات (الإجمالي)" value={`${myCommissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()} ريال`} icon="💰" color="secondary" />
                    </div>
                );
            case 'students':
                return (
                    <div className="bg-[var(--color-card)] p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">قائمة الطلاب المسجلين عن طريقك:</h3>
                        
                        {/* Mobile Card View */}
                        <div className="space-y-4 md:hidden">
                            {myStudents.map((student) => (
                                <div key={student.id} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-primary)]">
                                    <p className="font-bold text-[var(--color-primary)] text-lg">{`${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`}</p>
                                    <p className="text-sm text-[var(--color-text-muted)]">{student.phone}</p>
                                    <div className="mt-2 pt-2 border-t border-[var(--color-border)] text-sm space-y-1">
                                        <p><strong>الدورة:</strong> {student.course}</p>
                                        <p><strong>التسجيل:</strong> {student.registrationDate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-right">
                                <thead className="bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                    <tr>
                                        <th className="p-3 font-semibold">الاسم الرباعي</th>
                                        <th className="p-3 font-semibold">الهاتف</th>
                                        <th className="p-3 font-semibold">الدورة</th>
                                        <th className="p-3 font-semibold">تاريخ التسجيل</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myStudents.map((student, index) => (
                                        <tr key={student.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-primary)]`}>
                                            <td className="p-3">{`${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`}</td>
                                            <td className="p-3">{student.phone}</td>
                                            <td className="p-3">{student.course}</td>
                                            <td className="p-3">{student.registrationDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {myStudents.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)]">لم تقم بتسجيل أي طالب بعد.</div>}
                    </div>
                );
            case 'addStudent':
                return <RegistrationForm delegates={delegates} students={students} onAddStudent={onAddStudent} onRegistrationSuccess={() => setActiveTab('students')} delegateLockId={delegateProfile.id} />;
            case 'addDelegate':
                 return (
                    <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md text-center">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">🤝 إضافة مندوب جديد</h3>
                        <p className="text-[var(--color-text-muted)] mb-6">
                            يمكنك إضافة مندوبين جدد إلى فريقك. سيتم تسجيلك كمرجع لهم.
                        </p>
                        <button onClick={() => setIsAddDelegateModalOpen(true)} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-8 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 shadow-lg">
                            فتح نموذج إضافة مندوب
                        </button>
                    </div>
                );
            case 'commissions':
                return (
                     <div className="bg-[var(--color-card)] p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">سجل العمولات الخاص بك:</h3>
                        
                        {/* Mobile Card View */}
                        <div className="space-y-4 md:hidden">
                            {myCommissions.map((commission) => (
                                <div key={commission.id} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-secondary)]">
                                     <div className="flex justify-between items-start">
                                        <p className="font-bold text-[var(--color-primary)] text-lg">{commission.studentName}</p>
                                        <p className="text-lg font-bold text-[var(--color-secondary)]">{commission.amount} ريال</p>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-[var(--color-border)] grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <label className="font-semibold block">حالة العمولة:</label>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${commissionStatusStyles[commission.status].classes}`}>{commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}</span>
                                        </div>
                                         <div>
                                            <label className="font-semibold block">حالة الطالب:</label>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${studentStatusStyles[commission.studentStatus].classes}`}>{studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-2">تاريخ الإنشاء: {commission.createdDate}</p>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden md:block">
                           <table className="w-full text-right">
                               <thead className="bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                   <tr>
                                       <th className="p-3 font-semibold">الطالب</th>
                                       <th className="p-3 font-semibold">المبلغ</th>
                                       <th className="p-3 font-semibold">حالة العمولة</th>
                                       <th className="p-3 font-semibold">حالة الطالب</th>
                                       <th className="p-3 font-semibold">تاريخ الإنشاء</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {myCommissions.map((commission, index) => (
                                       <tr key={commission.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-primary)]`}>
                                           <td className="p-3">{commission.studentName}</td>
                                           <td className="p-3 font-bold">{commission.amount} ريال</td>
                                           <td className="p-3"><span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${commissionStatusStyles[commission.status].classes}`}>{commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}</span></td>
                                           <td className="p-3"><span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${studentStatusStyles[commission.studentStatus].classes}`}>{studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}</span></td>
                                           <td className="p-3">{commission.createdDate}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                        </div>
                        {myCommissions.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)]">لا توجد عمولات مسجلة لك بعد.</div>}
                   </div>
                );
            case 'myNetwork':
                return (
                     <div className="bg-[var(--color-card)] p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">🌐 شبكة المندوبين المسجلين بواسطتي</h3>
                        
                        {/* Mobile Card View */}
                         <div className="space-y-4 md:hidden">
                            {myNetwork.map((rep) => (
                                <div key={rep.id} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-primary)]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-[var(--color-primary)] text-lg">{rep.fullName}</p>
                                            <p className="text-sm text-[var(--color-text-muted)]">{rep.phone}</p>
                                        </div>
                                        <span className={`font-semibold text-xs px-2 py-1 rounded-full ${rep.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                                            {rep.isActive ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-[var(--color-border)] text-sm grid grid-cols-2 gap-2">
                                        <p><strong>تاريخ التسجيل:</strong> {rep.createdDate}</p>
                                        <p><strong>عدد الطلاب:</strong> <span className="font-bold">{rep.students}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden md:block">
                           <table className="w-full text-right">
                               <thead className="bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                   <tr>
                                       <th className="p-3 font-semibold">الاسم</th>
                                       <th className="p-3 font-semibold">الهاتف</th>
                                       <th className="p-3 font-semibold">الحالة</th>
                                       <th className="p-3 font-semibold">تاريخ التسجيل</th>
                                       <th className="p-3 font-semibold">عدد الطلاب</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {myNetwork.map((rep, index) => (
                                       <tr key={rep.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)]`}>
                                           <td className="p-3 font-bold text-[var(--color-primary)]">{rep.fullName}</td>
                                           <td className="p-3">{rep.phone}</td>
                                           <td className="p-3">
                                                <span className={`font-semibold ${rep.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                    {rep.isActive ? '🟢 نشط' : '🔴 غير نشط'}
                                                </span>
                                           </td>
                                           <td className="p-3">{rep.createdDate}</td>
                                           <td className="p-3 font-semibold text-center">{rep.students}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                        </div>
                        {myNetwork.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)]">لم تقم بتسجيل أي مندوبين بعد.</div>}
                   </div>
                );
            case 'bankAccount':
                 return (
                     <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">🏦 حسابي البنكي</h3>
                        <p className="text-[var(--color-text-muted)] mb-6">أدخل بيانات حسابك البنكي لاستلام العمولات.</p>
                        <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="bankName" className="block font-semibold mb-2">اسم البنك:</label>
                                <input type="text" id="bankName" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div>
                                <label htmlFor="accountHolder" className="block font-semibold mb-2">اسم صاحب الحساب:</label>
                                <input type="text" id="accountHolder" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div>
                                <label htmlFor="bankAccount" className="block font-semibold mb-2">رقم الحساب / IBAN:</label>
                                <input type="text" id="bankAccount" value={bankDetails.bankAccount} onChange={e => setBankDetails({...bankDetails, bankAccount: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div className="text-center pt-4">
                                <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-8 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">حفظ البيانات</button>
                            </div>
                        </form>
                    </div>
                 );
            case 'profile':
                return (
                    <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                       <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">👤 بياناتي الشخصية</h3>
                       <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                               <label htmlFor="fullName" className="block font-semibold mb-2">الاسم الكامل:</label>
                               <input type="text" id="fullName" value={profileDetails.fullName} onChange={e => setProfileDetails({...profileDetails, fullName: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                           </div>
                           <div>
                               <label htmlFor="email" className="block font-semibold mb-2">البريد الإلكتروني:</label>
                               <input type="email" id="email" value={profileDetails.email} onChange={e => setProfileDetails({...profileDetails, email: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                           </div>
                           <div className="text-center pt-4">
                               <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-8 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">تحديث البيانات</button>
                           </div>
                       </form>
                   </div>
                );
            case 'changePassword':
                 return (
                     <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">🔐 تغيير كلمة المرور</h3>
                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="currentPassword" className="block font-semibold mb-2">كلمة المرور الحالية:</label>
                                <input type="password" id="currentPassword" value={passwordDetails.currentPassword} onChange={e => setPasswordDetails({...passwordDetails, currentPassword: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block font-semibold mb-2">كلمة المرور الجديدة:</label>
                                <input type="password" id="newPassword" value={passwordDetails.newPassword} onChange={e => setPasswordDetails({...passwordDetails, newPassword: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block font-semibold mb-2">تأكيد كلمة المرور الجديدة:</label>
                                <input type="password" id="confirmPassword" value={passwordDetails.confirmPassword} onChange={e => setPasswordDetails({...passwordDetails, confirmPassword: e.target.value})} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-card)]" />
                            </div>
                            <div className="text-center pt-4">
                                <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-8 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">تغيير كلمة المرور</button>
                            </div>
                        </form>
                    </div>
                 );
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)]">
             <UserStaffModal isOpen={isAddDelegateModalOpen} onClose={() => setIsAddDelegateModalOpen(false)} onSave={handleSaveDelegate} userToEdit={null} delegateToEdit={null} allowedRoles={['delegate']} />
            <header className="bg-[var(--color-card)] shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-[var(--color-primary)]">🤝 لوحة تحكم المندوب</h1>
                <div className="flex items-center gap-4">
                    <span className="font-semibold hidden sm:inline">{currentUser.fullName}</span>
                    <button onClick={logout} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 flex items-center gap-2">
                        <span className="hidden sm:inline">تسجيل الخروج</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </header>
            <main className="p-4 md:p-8">
                <AppHeader />
                <div className="mt-8">
                    <div className="overflow-x-auto">
                        <div className="flex border-b-2 border-[var(--color-primary)] mb-6">
                            <TabButton label="لوحة التحكم" icon="📊" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                            <TabButton label="طلابي" icon="👥" isActive={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                            <TabButton label="سجل عمولاتي" icon="💰" isActive={activeTab === 'commissions'} onClick={() => setActiveTab('commissions')} />
                            <TabButton label="شبكتي" icon="🌐" isActive={activeTab === 'myNetwork'} onClick={() => setActiveTab('myNetwork')} />
                            <TabButton label="تسجيل طالب" icon="📝" isActive={activeTab === 'addStudent'} onClick={() => setActiveTab('addStudent')} />
                            <TabButton label="إضافة مندوب" icon="🤝" isActive={activeTab === 'addDelegate'} onClick={() => setActiveTab('addDelegate')} />
                            <TabButton label="حسابي البنكي" icon="🏦" isActive={activeTab === 'bankAccount'} onClick={() => setActiveTab('bankAccount')} />
                            <TabButton label="بياناتي" icon="👤" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                            <TabButton label="كلمة المرور" icon="🔐" isActive={activeTab === 'changePassword'} onClick={() => setActiveTab('changePassword')} />
                        </div>
                    </div>
                     {notification && <Notification message={notification.message} type={notification.type} />}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};
