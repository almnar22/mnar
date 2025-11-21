
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AppHeader } from './AppHeader';
import type { Delegate, Student, Role, Commission, BankAccount, User, CourseObject } from '../types';
import { CommissionStatus, StudentStatus } from '../types';
import { RegistrationForm } from './StudentManagement';
import { UserStaffModal } from './DelegateManagement';

interface DelegateDashboardProps {
    delegates: Delegate[];
    students: Student[];
    commissions: Commission[];
    courses: CourseObject[];
    onAddStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
}

type DelegateView = 'dashboard' | 'students' | 'addStudent' | 'addDelegate' | 'commissions' | 'bankAccount' | 'profile' | 'myNetwork' | 'changePassword';

const ProgressBar: React.FC<{ percentage: number; colorClass?: string }> = ({ percentage, colorClass }) => {
    let finalColor = colorClass;
    if (!finalColor) {
        finalColor = 'bg-green-500';
        if (percentage < 30) finalColor = 'bg-red-500';
        else if (percentage < 70) finalColor = 'bg-orange-500';
    }

    return (
        <div className="w-full bg-white/50 rounded-full h-2.5 mt-2 overflow-hidden border border-white/30 shadow-inner">
            <div className={`${finalColor} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const Notification: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const baseClasses = "p-4 rounded-xl text-[var(--color-primary-text)] font-bold mb-4 flex items-center gap-3 shadow-sm animate-fade-in";
    const typeClasses = { success: "bg-[var(--color-secondary)]", error: "bg-[var(--color-primary)]" };
    const icon = type === 'success' ? '✅' : '⚠️';
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{icon} {message}</div>;
}

const commissionStatusStyles: Record<CommissionStatus, { classes: string, label: string, icon: string }> = {
    [CommissionStatus.Pending]: { classes: 'bg-amber-50 text-amber-700 border-amber-200', label: 'معلقة', icon: '⏳' },
    [CommissionStatus.Confirmed]: { classes: 'bg-blue-50 text-blue-700 border-blue-200', label: 'مؤكدة', icon: '✅' },
    [CommissionStatus.Paid]: { classes: 'bg-green-50 text-green-700 border-green-200', label: 'مدفوعة', icon: '💰' },
    [CommissionStatus.Cancelled]: { classes: 'bg-red-50 text-red-700 border-red-200', label: 'ملغاة', icon: '❌' },
};

const studentStatusStyles: Record<StudentStatus, { classes: string, label: string, icon: string }> = {
    [StudentStatus.Registered]: { classes: 'bg-green-100 text-green-800', label: 'مسجل', icon: '✅' },
    [StudentStatus.FeesPaid]: { classes: 'bg-sky-100 text-sky-800', label: 'مدفوع الرسوم', icon: '💰' },
    [StudentStatus.Studying]: { classes: 'bg-amber-100 text-amber-800', label: 'مستمر', icon: '📚' },
    [StudentStatus.OnHold]: { classes: 'bg-gray-200 text-gray-800', label: 'متوقف', icon: '⏸️' },
    [StudentStatus.Dropped]: { classes: 'bg-rose-200 text-rose-800', label: 'منقطع', icon: '❌' },
    [StudentStatus.Completed]: { classes: 'bg-purple-100 text-purple-800', label: 'مكتمل', icon: '🎓' },
};

// --- New Components for Grid Layout ---

const StatItem: React.FC<{ label: string, value: number | string, icon: string }> = ({ label, value, icon }) => (
    <div className="flex-1 flex flex-col items-center p-2 relative group cursor-default">
        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform drop-shadow-md text-white/90">{icon}</div>
        <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-0.5 opacity-80">{label}</span>
        <span className="text-xl font-black text-white tracking-tight drop-shadow-sm">{value}</span>
    </div>
);

const QuickStatsBar: React.FC<{ stats: { students: number, commissions: number, network: number, pending: number } }> = ({ stats }) => (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-xl shadow-blue-900/20 border border-white/10 p-5 mb-6 text-white relative overflow-hidden group">
        {/* Decorative elements for premium look */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-3xl opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full mix-blend-overlay filter blur-3xl opacity-20 pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex justify-between items-center divide-x divide-x-reverse divide-white/10 relative z-10">
            <StatItem label="الطلاب" value={stats.students} icon="👥" />
            <StatItem label="العمولات" value={stats.commissions} icon="💰" />
            <StatItem label="الشبكة" value={stats.network} icon="🌐" />
            <StatItem label="معلق" value={stats.pending} icon="⏳" />
        </div>
    </div>
);

// Reorganized Menu Grid (2 Rows x 4 Columns)
const DelegateMenu: React.FC<{ onItemClick: (view: DelegateView) => void }> = ({ onItemClick }) => {
    
    const MenuButton: React.FC<{ 
        id: DelegateView, 
        label: string, 
        icon: string, 
        iconBg: string,
        iconColor: string
    }> = ({ id, label, icon, iconBg, iconColor }) => (
        <button 
            onClick={() => onItemClick(id)}
            className="flex flex-col items-center justify-center py-3 px-1 bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-full"
        >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full ${iconBg} ${iconColor} flex items-center justify-center text-lg md:text-xl mb-2 shadow-inner group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-[var(--color-text-base)] text-center leading-tight">{label}</span>
        </button>
    );

    return (
        <div className="space-y-3 animate-fade-in-up mb-8">
            {/* Row 1: Main Actions */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                 <MenuButton id="addStudent" label="تسجيل طالب" icon="📝" iconBg="bg-green-100" iconColor="text-green-600" />
                 <MenuButton id="students" label="سجل طلابي" icon="👥" iconBg="bg-blue-100" iconColor="text-blue-600" />
                 <MenuButton id="commissions" label="عمولاتي" icon="💰" iconBg="bg-amber-100" iconColor="text-amber-600" />
                 <MenuButton id="myNetwork" label="شبكتي" icon="🌐" iconBg="bg-purple-100" iconColor="text-purple-600" />
            </div>

            {/* Row 2: Settings & Tools */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                 <MenuButton id="addDelegate" label="إضافة مندوب" icon="🤝" iconBg="bg-teal-100" iconColor="text-teal-600" />
                 <MenuButton id="bankAccount" label="الحساب البنكي" icon="🏦" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
                 <MenuButton id="profile" label="بياناتي" icon="👤" iconBg="bg-gray-100" iconColor="text-gray-600" />
                 <MenuButton id="changePassword" label="كلمة المرور" icon="🔐" iconBg="bg-rose-100" iconColor="text-rose-600" />
            </div>
        </div>
    );
};

export const DelegateDashboard: React.FC<DelegateDashboardProps> = ({ delegates, students, commissions, courses, onAddStudent }) => {
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

    // Filter courses
    const activeCourses = courses.filter(c => c.status === 'active');
    const upcomingCourses = courses.filter(c => c.status === 'upcoming');
    const availableCourses = courses.filter(c => c.enrollment_open && c.current_students < c.max_students)
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());


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

    const getDaysDifference = (dateStr: string) => {
        if (!dateStr) return 0;
        const target = new Date(dateStr);
        const now = new Date();
        const diffTime = target.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };
    
    const calculateProgress = (course: CourseObject) => {
        if (course.status === 'upcoming') return 0;
        if (course.status === 'completed') return 100;
        
        const start = new Date(course.start_date).getTime();
        const end = new Date(course.end_date).getTime();
        const now = new Date().getTime();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const total = end - start;
        const current = now - start;
        return total === 0 ? 0 : Math.min(100, Math.max(0, Math.round((current / total) * 100)));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                const stats = {
                    students: delegateProfile.students,
                    commissions: myCommissions.reduce((sum, c) => sum + c.amount, 0),
                    network: myNetwork.length,
                    pending: myCommissions.filter(c => c.status === CommissionStatus.Pending).length
                };

                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Elegant Stats Bar */}
                        <QuickStatsBar stats={stats} />

                        {/* Main Menu Grid - Redesigned (2 Rows x 4 Cols) */}
                        <DelegateMenu onItemClick={setActiveTab} />

                        {/* Active Courses - Redesigned Match Manager Dashboard */}
                        {activeCourses.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                                    <span>🟢</span> الدورات النشطة حالياً
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeCourses.map(course => {
                                        const progress = calculateProgress(course);
                                        const remainingDays = Math.max(0, getDaysDifference(course.end_date));
                                        
                                        return (
                                            <div key={course.id} className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
                                                 {/* Decorative background shape */}
                                                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>

                                                <div className="p-5 relative z-10">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                         <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">📚</div>
                                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{course.name}</h4>
                                                         </div>
                                                        <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-1 rounded-full shadow-sm">نشطة</span>
                                                    </div>
                                                    
                                                    {/* Progress */}
                                                    <div className="mb-4 bg-white/60 p-3 rounded-xl border border-emerald-100 backdrop-blur-sm">
                                                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                                            <span className="flex items-center gap-1">⏳ التقدم</span>
                                                            <span className="text-emerald-700">{progress}%</span>
                                                        </div>
                                                        <ProgressBar percentage={progress} colorClass="bg-emerald-500" />
                                                    </div>

                                                    {/* Details List */}
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                                                            <span className="text-gray-600 text-xs font-bold flex items-center gap-2">
                                                                <span>🌙</span> الوقت:
                                                            </span>
                                                            <span className="font-bold text-gray-800">{course.time_slot}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center border-b border-emerald-200/50 pb-2">
                                                            <span className="text-gray-600 text-xs font-bold flex items-center gap-2">
                                                                <span>👥</span> الطلاب:
                                                            </span>
                                                            <span className="font-bold text-gray-800">{course.current_students}/{course.max_students}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-1">
                                                            <span className="text-gray-600 text-xs font-bold flex items-center gap-2">
                                                                <span>📅</span> المتبقي:
                                                            </span>
                                                            <span className={`font-bold ${remainingDays < 5 ? 'text-red-500' : 'text-gray-800'}`}>{remainingDays} يوم</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer Action */}
                                                <div className="px-4 py-3 bg-emerald-100/50 border-t border-emerald-100 text-center opacity-90 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setActiveTab('students')}
                                                        className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center justify-center gap-1 w-full"
                                                    >
                                                       <span>📋</span> متابعة الطلاب
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Available Courses - Redesigned Match Manager Dashboard */}
                         {availableCourses.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                                    <span>🚀</span> فرص تسجيل متاحة
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {availableCourses.slice(0, 8).map(course => {
                                        const seatsLeft = course.max_students - course.current_students;
                                        return (
                                             <div key={course.id} className="bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
                                                {/* Decorative background shape */}
                                                 <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>

                                                <div className="p-5 relative z-10">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start mb-4">
                                                         <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">🎯</div>
                                                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{course.name}</h4>
                                                         </div>
                                                        <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-1 rounded-full shadow-sm">متاح</span>
                                                    </div>
                                                    
                                                    {/* Seats Banner */}
                                                    <div className="mb-4 bg-white/60 p-3 rounded-xl border border-orange-100 backdrop-blur-sm text-center">
                                                        <p className="text-xs text-orange-600 font-bold uppercase mb-1">المقاعد المتاحة</p>
                                                        <p className="text-2xl font-black text-orange-800">{seatsLeft} <span className="text-sm font-medium">مقعد</span></p>
                                                    </div>
                                                    
                                                    {/* Details List */}
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between items-center border-b border-orange-200/50 pb-2">
                                                            <span className="text-gray-600 text-xs font-bold flex items-center gap-2">
                                                                <span>⏰</span> الوقت:
                                                            </span>
                                                            <span className="font-bold text-gray-800">{course.time_slot}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-1">
                                                            <span className="text-gray-600 text-xs font-bold flex items-center gap-2">
                                                                <span>📅</span> التاريخ:
                                                            </span>
                                                            <span className="font-bold text-gray-800 text-xs">{course.start_date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Footer Action */}
                                                <div className="px-4 py-3 bg-orange-100/50 border-t border-orange-100 text-center opacity-90 group-hover:opacity-100 transition-opacity">
                                                     <button 
                                                        onClick={() => setActiveTab('addStudent')}
                                                        className="text-xs font-bold text-orange-800 hover:text-orange-900 flex items-center justify-center gap-1 w-full"
                                                    >
                                                       <span>📝</span> تسجيل طالب
                                                    </button>
                                                </div>
                                             </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'students':
                return (
                    <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden animate-fade-in">
                         <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">قائمة طلابي</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">✕ إغلاق</button>
                        </div>
                        
                        <div className="p-6">
                            {/* Mobile Card View */}
                            <div className="space-y-4 md:hidden">
                                {myStudents.map((student) => (
                                    <div key={student.id} className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-border)]">
                                        <div className="flex justify-between mb-2">
                                            <p className="font-bold text-[var(--color-primary)]">{student.firstName} {student.lastName}</p>
                                            <span className="text-xs text-gray-500">#{student.id}</span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-muted)] mb-2">{student.phone}</p>
                                        <div className="flex justify-between items-center text-xs bg-white p-2 rounded border border-gray-100">
                                            <span className="font-bold text-gray-700">{student.course}</span>
                                            <span className="text-gray-500">{student.registrationDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Desktop Table View */}
                            <div className="overflow-x-auto hidden md:block">
                                <table className="w-full text-right">
                                    <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                                        <tr>
                                            <th className="p-4 rounded-r-lg">الاسم الرباعي</th>
                                            <th className="p-4">الهاتف</th>
                                            <th className="p-4">الدورة</th>
                                            <th className="p-4 rounded-l-lg">تاريخ التسجيل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-[var(--color-text-base)]">
                                        {myStudents.map((student, index) => (
                                            <tr key={student.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
                                                <td className="p-4 font-medium">{student.firstName} {student.secondName} {student.thirdName} {student.lastName}</td>
                                                <td className="p-4 font-mono">{student.phone}</td>
                                                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">{student.course}</span></td>
                                                <td className="p-4 font-mono text-gray-500">{student.registrationDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {myStudents.length === 0 && <div className="text-center p-12 text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-lg mt-4 border border-dashed border-[var(--color-border)]">لا يوجد طلاب مسجلين.</div>}
                        </div>
                    </div>
                );
            case 'addStudent':
                return (
                    <div className="animate-fade-in">
                        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-primary)]" onClick={() => setActiveTab('dashboard')}>
                             <span>⬅</span> العودة للرئيسية
                        </div>
                        <RegistrationForm delegates={delegates} students={students} onAddStudent={onAddStudent} onRegistrationSuccess={() => setActiveTab('students')} delegateLockId={delegateProfile.id} />
                    </div>
                );
            case 'addDelegate':
                 return (
                    <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] p-8 max-w-2xl mx-auto text-center animate-fade-in">
                         <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🤝</div>
                         <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">توسيع فريقك</h3>
                         <p className="text-[var(--color-text-muted)] mb-8">
                            قم بإضافة مندوبين جدد تحت إشرافك لزيادة شبكتك وتحقيق المزيد من النجاحات.
                        </p>
                        <button onClick={() => setIsAddDelegateModalOpen(true)} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-8 rounded-xl hover:bg-[var(--color-secondary-hover)] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            تسجيل مندوب جديد
                        </button>
                        <button onClick={() => setActiveTab('dashboard')} className="block mx-auto mt-4 text-sm text-[var(--color-text-muted)] hover:underline">إلغاء</button>
                    </div>
                );
            case 'commissions':
                return (
                     <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">سجل العمولات</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">✕ إغلاق</button>
                        </div>
                        
                        <div className="p-6">
                            {/* Mobile Card View */}
                            <div className="space-y-4 md:hidden">
                                {myCommissions.map((commission) => (
                                    <div key={commission.id} className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-border)]">
                                         <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-[var(--color-primary)]">{commission.studentName}</span>
                                            <span className="text-lg font-black text-[var(--color-secondary)]">{commission.amount} ر.س</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                            <div className={`px-2 py-1 rounded border flex items-center gap-1 ${commissionStatusStyles[commission.status].classes}`}>
                                                {commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}
                                            </div>
                                             <div className={`px-2 py-1 rounded border flex items-center gap-1 ${studentStatusStyles[commission.studentStatus].classes}`}>
                                                {studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] text-left font-mono">{commission.createdDate}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="overflow-x-auto hidden md:block">
                               <table className="w-full text-right">
                                   <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                                       <tr>
                                           <th className="p-4 rounded-r-lg">الطالب</th>
                                           <th className="p-4">المبلغ</th>
                                           <th className="p-4">حالة العمولة</th>
                                           <th className="p-4">حالة الطالب</th>
                                           <th className="p-4 rounded-l-lg">تاريخ الإنشاء</th>
                                       </tr>
                                   </thead>
                                   <tbody className="text-sm">
                                       {myCommissions.map((commission, index) => (
                                           <tr key={commission.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
                                               <td className="p-4 font-medium text-[var(--color-text-base)]">{commission.studentName}</td>
                                               <td className="p-4 font-bold text-[var(--color-secondary)]">{commission.amount} ريال</td>
                                               <td className="p-4"><span className={`px-2 py-1 rounded-md border text-xs font-bold flex w-fit items-center gap-1 ${commissionStatusStyles[commission.status].classes}`}>{commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}</span></td>
                                               <td className="p-4"><span className={`px-2 py-1 rounded-md border text-xs font-bold flex w-fit items-center gap-1 ${studentStatusStyles[commission.studentStatus].classes}`}>{studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}</span></td>
                                               <td className="p-4 font-mono text-gray-500">{commission.createdDate}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                            </div>
                            {myCommissions.length === 0 && <div className="text-center p-12 text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-lg mt-4 border border-dashed border-[var(--color-border)]">لا توجد عمولات.</div>}
                       </div>
                   </div>
                );
            case 'myNetwork':
                return (
                     <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden animate-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">🌐 شبكتي</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">✕ إغلاق</button>
                        </div>
                        
                        <div className="p-6">
                             {/* Mobile Card View */}
                             <div className="space-y-4 md:hidden">
                                {myNetwork.map((rep) => (
                                    <div key={rep.id} className="bg-[var(--color-background)] p-4 rounded-lg border border-[var(--color-border)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-[var(--color-primary)]">{rep.fullName}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{rep.phone}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${rep.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                {rep.isActive ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-t border-[var(--color-border)] pt-2 mt-2">
                                            <span className="text-[var(--color-text-muted)]">الطلاب: <span className="font-bold text-[var(--color-text-base)]">{rep.students}</span></span>
                                            <span className="text-xs font-mono text-[var(--color-text-muted)]">{rep.createdDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="overflow-x-auto hidden md:block">
                               <table className="w-full text-right">
                                   <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-bold">
                                       <tr>
                                           <th className="p-4 rounded-r-lg">الاسم</th>
                                           <th className="p-4">الهاتف</th>
                                           <th className="p-4">الحالة</th>
                                           <th className="p-4">عدد الطلاب</th>
                                           <th className="p-4 rounded-l-lg">تاريخ التسجيل</th>
                                       </tr>
                                   </thead>
                                   <tbody className="text-sm">
                                       {myNetwork.map((rep, index) => (
                                           <tr key={rep.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
                                               <td className="p-4 font-medium text-[var(--color-text-base)]">{rep.fullName}</td>
                                               <td className="p-4 font-mono">{rep.phone}</td>
                                               <td className="p-4">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${rep.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                        {rep.isActive ? 'نشط' : 'غير نشط'}
                                                    </span>
                                               </td>
                                               <td className="p-4 font-bold text-center">{rep.students}</td>
                                               <td className="p-4 font-mono text-gray-500">{rep.createdDate}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                            </div>
                            {myNetwork.length === 0 && <div className="text-center p-12 text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-lg mt-4 border border-dashed border-[var(--color-border)]">شبكتك فارغة حالياً.</div>}
                       </div>
                   </div>
                );
            case 'bankAccount':
                 return (
                     <div className="bg-[var(--color-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)] max-w-2xl mx-auto animate-fade-in">
                         <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">🏦 بيانات الحساب البنكي</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">إلغاء</button>
                        </div>
                        
                        <form onSubmit={handleBankDetailsSubmit} className="space-y-5">
                             <div>
                                <label htmlFor="bankName" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">اسم البنك</label>
                                <input type="text" id="bankName" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" placeholder="مثال: بنك الراجحي" />
                            </div>
                            <div>
                                <label htmlFor="accountHolder" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">اسم صاحب الحساب</label>
                                <input type="text" id="accountHolder" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" placeholder="الاسم كما يظهر في البطاقة" />
                            </div>
                            <div>
                                <label htmlFor="bankAccount" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">رقم الآيبان (IBAN)</label>
                                <input type="text" id="bankAccount" value={bankDetails.bankAccount} onChange={e => setBankDetails({...bankDetails, bankAccount: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)] font-mono text-sm" placeholder="SA..." />
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-8 rounded-xl hover:bg-[var(--color-secondary-hover)] transition-all shadow-md">حفظ التغييرات</button>
                            </div>
                        </form>
                    </div>
                 );
            case 'profile':
                return (
                    <div className="bg-[var(--color-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)] max-w-2xl mx-auto animate-fade-in">
                        <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">👤 الملف الشخصي</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">إلغاء</button>
                        </div>
                       <form onSubmit={handleProfileSubmit} className="space-y-5">
                            <div>
                               <label htmlFor="fullName" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">الاسم الكامل</label>
                               <input type="text" id="fullName" value={profileDetails.fullName} onChange={e => setProfileDetails({...profileDetails, fullName: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" />
                           </div>
                           <div>
                               <label htmlFor="email" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">البريد الإلكتروني</label>
                               <input type="email" id="email" value={profileDetails.email} onChange={e => setProfileDetails({...profileDetails, email: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" />
                           </div>
                           <div className="pt-6">
                               <button type="submit" className="w-full bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-8 rounded-xl hover:bg-[var(--color-secondary-hover)] transition-all shadow-md">حفظ البيانات</button>
                           </div>
                       </form>
                   </div>
                );
            case 'changePassword':
                 return (
                     <div className="bg-[var(--color-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)] max-w-2xl mx-auto animate-fade-in">
                        <div className="flex justify-between items-center mb-8 border-b border-[var(--color-border)] pb-4">
                            <h3 className="text-xl font-bold text-[var(--color-primary)]">🔐 الأمان</h3>
                            <button onClick={() => setActiveTab('dashboard')} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">إلغاء</button>
                        </div>
                        <form onSubmit={handlePasswordChangeSubmit} className="space-y-5">
                             <div>
                                <label htmlFor="currentPassword" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">كلمة المرور الحالية</label>
                                <input type="password" id="currentPassword" value={passwordDetails.currentPassword} onChange={e => setPasswordDetails({...passwordDetails, currentPassword: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">كلمة المرور الجديدة</label>
                                <input type="password" id="newPassword" value={passwordDetails.newPassword} onChange={e => setPasswordDetails({...passwordDetails, newPassword: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block font-bold text-sm text-[var(--color-text-muted)] mb-1">تأكيد كلمة المرور</label>
                                <input type="password" id="confirmPassword" value={passwordDetails.confirmPassword} onChange={e => setPasswordDetails({...passwordDetails, confirmPassword: e.target.value})} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)]" />
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition-all shadow-md">تغيير كلمة المرور</button>
                            </div>
                        </form>
                    </div>
                 );
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)] font-sans">
             <UserStaffModal isOpen={isAddDelegateModalOpen} onClose={() => setIsAddDelegateModalOpen(false)} onSave={handleSaveDelegate} userToEdit={null} delegateToEdit={null} allowedRoles={['delegate']} />
            <header className="bg-[var(--color-card)] shadow-sm border-b border-[var(--color-border)] p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-xl">🎓</div>
                    <div>
                        <h1 className="text-base md:text-lg font-bold text-[var(--color-primary)] leading-tight">نظام المندوب</h1>
                        <p className="text-[10px] text-[var(--color-text-muted)]">لوحة التحكم</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-[var(--color-text-base)]">{currentUser.fullName}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">المندوب</p>
                    </div>
                    <button onClick={logout} className="bg-red-50 text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-100 transition-colors duration-300 flex items-center gap-2 text-xs md:text-sm border border-red-100">
                        <span className="hidden sm:inline">تسجيل الخروج</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </header>
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <AppHeader />
                </div>
                <div className="mt-4">
                     {notification && <Notification message={notification.message} type={notification.type} />}
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};
