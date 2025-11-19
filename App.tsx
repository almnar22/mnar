
import React, { useState, useMemo, useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { MainMenu } from './components/MainMenu';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/StudentManagement';
import { DelegateManagement } from './components/DelegateManagement';
import { CommissionManagement } from './components/CommissionManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { ActivityLogs } from './components/ActivityLogs';
import { CourseManagement } from './components/CourseManagement';
import { NotificationsPage } from './components/NotificationsPage';
import type { View, Student, Commission, Delegate, BackupData, CourseObject } from './types';
import { Course, Schedule, CommissionStatus, StudentStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { Login } from './components/Login';
import { DelegateDashboard } from './components/DelegateDashboard';

// Default data only used if localStorage is empty
const initialStudentsData: Student[] = [
    { id: 1, firstName: 'أحمد', secondName: 'علي', thirdName: 'محمد', lastName: 'الشهري', phone: '0511111111', course: Course.Computer, schedule: Schedule.Evening, delegateId: 3, registrationDate: '2024-07-10' },
    { id: 2, firstName: 'فاطمة', secondName: 'عبدالله', thirdName: 'حسن', lastName: 'الغامدي', phone: '0511111112', course: Course.English, schedule: Schedule.Morning, delegateId: 3, registrationDate: '2024-07-12' },
    { id: 3, firstName: 'خالد', secondName: 'سعيد', thirdName: 'عمر', lastName: 'القحطاني', phone: '0511111113', course: Course.Maintenance, schedule: Schedule.Both, delegateId: 3, registrationDate: '2024-07-15' },
];

const initialCommissions: Commission[] = [
    { id: 1, studentId: 1, delegateId: 3, studentName: 'أحمد علي محمد الشهري', course: Course.Computer, amount: 500, status: CommissionStatus.Paid, studentStatus: StudentStatus.Completed, createdDate: '2024-07-10', paidDate: '2024-07-20' },
    { id: 2, studentId: 2, delegateId: 3, studentName: 'فاطمة عبدالله حسن الغامدي', course: Course.English, amount: 500, status: CommissionStatus.Confirmed, studentStatus: StudentStatus.Studying, createdDate: '2024-07-12', confirmedDate: '2024-07-18' },
    { id: 3, studentId: 3, delegateId: 3, studentName: 'خالد سعيد عمر القحطاني', course: Course.Maintenance, amount: 500, status: CommissionStatus.Pending, studentStatus: StudentStatus.FeesPaid, createdDate: '2024-07-15' },
];

const initialCourses: CourseObject[] = [
    { id: 1, name: 'دورة الحاسوب المتقدم', description: 'دورة شاملة في أساسيات الحاسوب والأوفيس', category: 'حاسوب', duration: 4, price: 1000, current_students: 18, max_students: 25, time_slot: 'صباحي', start_date: '2024-01-10', end_date: '2024-02-20', enrollment_open: true, status: 'active' },
    { id: 2, name: 'دورة اللغة الإنجليزية', description: 'مستويات متعددة في اللغة الإنجليزية', category: 'لغات', duration: 6, price: 1200, current_students: 22, max_students: 22, time_slot: 'مسائي', start_date: '2024-01-05', end_date: '2024-02-15', enrollment_open: false, status: 'active' },
    { id: 3, name: 'دورة المحاسبة', description: 'أساسيات المحاسبة المالية والإدارية', category: 'إدارة', duration: 5, price: 1500, current_students: 12, max_students: 20, time_slot: 'صباحي', start_date: '2024-01-25', end_date: '2024-03-10', enrollment_open: true, status: 'active' },
];

const App: React.FC = () => {
  const { currentUser, delegates, incrementStudentCount, decrementStudentCount, logActivity, users, bankAccounts, restoreData } = useAuth();
  const { addNotification } = useNotification();

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- PERSISTENCE LOGIC START ---
  // Initialize state from LocalStorage or fallback to initial data
  const [students, setStudents] = useState<Student[]>(() => {
    try {
        const saved = localStorage.getItem('app_students');
        return saved ? JSON.parse(saved) : initialStudentsData;
    } catch (e) { return initialStudentsData; }
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    try {
        const saved = localStorage.getItem('app_commissions');
        return saved ? JSON.parse(saved) : initialCommissions;
    } catch (e) { return initialCommissions; }
  });

  const [courses, setCourses] = useState<CourseObject[]>(() => {
    try {
        const saved = localStorage.getItem('app_courses');
        return saved ? JSON.parse(saved) : initialCourses;
    } catch (e) { return initialCourses; }
  });

  // Save to LocalStorage whenever data changes
  useEffect(() => { localStorage.setItem('app_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('app_commissions', JSON.stringify(commissions)); }, [commissions]);
  useEffect(() => { localStorage.setItem('app_courses', JSON.stringify(courses)); }, [courses]);
  // --- PERSISTENCE LOGIC END ---

  // --- Auto Notifications Engine ---
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        const pendingCount = commissions.filter(c => c.status === CommissionStatus.Pending).length;
        if (pendingCount > 0) {
             const welcomeKey = 'welcome_notification_sent';
             if (!sessionStorage.getItem(welcomeKey)) {
                 addNotification('💰 تنبيه العمولات', `يوجد ${pendingCount} عمولة معلقة تحتاج إلى مراجعة.`, 'warning', null, 'commissions');
                 sessionStorage.setItem(welcomeKey, 'true');
             }
        }

        courses.forEach(course => {
            if (course.status === 'active') {
                const end = new Date(course.end_date);
                const now = new Date();
                const diffTime = end.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 7 && diffDays > 0) {
                    const key = `course_expiry_${course.id}_${now.getDate()}`; 
                    if (!sessionStorage.getItem(key)) {
                        addNotification('⏳ دورة تنتهي قريباً', `دورة "${course.name}" ستنتهي خلال ${diffDays} أيام.`, 'info', null, 'courses', course.id);
                        sessionStorage.setItem(key, 'true');
                    }
                }
            }
        });
    }
  }, [currentUser, commissions, courses]);

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    const newStudent: Student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      ...studentData,
      registrationDate: new Date().toISOString().split('T')[0],
    };
    setStudents(prevStudents => [newStudent, ...prevStudents]);
    incrementStudentCount(newStudent.delegateId);
    
    const newCommission: Commission = {
        id: commissions.length > 0 ? Math.max(...commissions.map(c => c.id)) + 1 : 1,
        studentId: newStudent.id,
        delegateId: newStudent.delegateId,
        studentName: `${newStudent.firstName} ${newStudent.secondName} ${newStudent.thirdName} ${newStudent.lastName}`,
        course: newStudent.course,
        amount: 500,
        status: CommissionStatus.Pending,
        studentStatus: StudentStatus.Registered,
        createdDate: newStudent.registrationDate,
    };
    setCommissions(prev => [newCommission, ...prev]);
    
    logActivity('add', 'students', `${newStudent.firstName} ${newStudent.lastName}`);
    addNotification('🎉 طالب جديد', `تم تسجيل الطالب: ${newStudent.firstName} ${newStudent.lastName} بنجاح.`, 'success', null, 'students', newStudent.id);
  };

  const handleEditStudent = (studentId: number, updatedData: Partial<Omit<Student, 'id'>>) => {
      const oldData = students.find(s => s.id === studentId);
      setStudents(prev => prev.map(s => s.id === studentId ? {...s, ...updatedData} : s));
      if(oldData) logActivity('edit', 'students', `${oldData.firstName} ${oldData.lastName} (ID: ${studentId})`);
  };
  
  const handleDeleteStudent = (studentId: number) => {
      const studentToDelete = students.find(s => s.id === studentId);
      if(studentToDelete){
          setStudents(prev => prev.filter(s => s.id !== studentId));
          setCommissions(prev => prev.filter(c => c.studentId !== studentId));
          decrementStudentCount(studentToDelete.delegateId);
          logActivity('delete', 'students', `${studentToDelete.firstName} ${studentToDelete.lastName} (ID: ${studentId})`);
          addNotification('🗑️ حذف طالب', `تم حذف الطالب ${studentToDelete.firstName} ${studentToDelete.lastName} من النظام.`, 'danger');
      }
  };
  
  const updateCommissionStatus = (commissionId: number, status: CommissionStatus) => {
      setCommissions(prev => prev.map(c => {
          if (c.id === commissionId) {
              const now = new Date().toISOString().split('T')[0];
              if (status === CommissionStatus.Paid || status === CommissionStatus.Confirmed) {
                   const delegate = delegates.find(d => d.id === c.delegateId);
                   if (delegate) {
                       addNotification(
                           status === CommissionStatus.Paid ? '💰 تم دفع العمولة' : '✅ تم تأكيد العمولة',
                           `تم تحديث حالة عمولتك للطالب ${c.studentName} إلى ${status}.`,
                           'success',
                           delegate.userId,
                           'commissions'
                       );
                   }
              }
              return {
                  ...c,
                  status,
                  confirmedDate: status === CommissionStatus.Confirmed ? now : c.confirmedDate,
                  paidDate: status === CommissionStatus.Paid ? now : c.paidDate,
              };
          }
          return c;
      }));
      logActivity('edit', 'commissions', `تحديث حالة العمولة (ID: ${commissionId}) إلى ${status}`);
  };

  const updateStudentStatus = (commissionId: number, studentStatus: StudentStatus) => {
      setCommissions(prev => prev.map(c => {
          if (c.id === commissionId) {
              const now = new Date().toISOString().split('T')[0];
              let newCommissionStatus = c.status;
              let newConfirmedDate = c.confirmedDate;
              if (studentStatus === StudentStatus.Completed && c.status !== CommissionStatus.Paid) {
                  newCommissionStatus = CommissionStatus.Confirmed;
                  newConfirmedDate = c.confirmedDate || now;
              } else if (studentStatus === StudentStatus.Dropped) {
                  newCommissionStatus = CommissionStatus.Cancelled;
              }
              return {
                  ...c,
                  studentStatus,
                  status: newCommissionStatus,
                  confirmedDate: newConfirmedDate,
              };
          }
          return c;
      }));
      logActivity('edit', 'commissions', `تحديث حالة الطالب للعمولة (ID: ${commissionId}) إلى ${studentStatus}`);
  };

  const handleAddCourse = (courseData: Omit<CourseObject, 'id' | 'current_students'>) => {
      const newCourse: CourseObject = {
          id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
          ...courseData,
          current_students: 0
      };
      setCourses(prev => [...prev, newCourse]);
      logActivity('add', 'courses', `إضافة دورة جديدة: ${newCourse.name}`);
      addNotification('📚 دورة جديدة', `تم إضافة دورة جديدة: ${newCourse.name}`, 'info');
  };

  const handleUpdateCourse = (id: number, courseData: Partial<CourseObject>) => {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...courseData } : c));
      logActivity('edit', 'courses', `تحديث دورة: ${id}`);
  };

  const handleDeleteCourse = (id: number) => {
      const courseToDelete = courses.find(c => c.id === id);
      if (courseToDelete) {
          setCourses(prev => prev.filter(c => c.id !== id));
          logActivity('delete', 'courses', `حذف دورة: ${courseToDelete.name}`);
      }
  };

  const handleCreateBackup = (): BackupData => {
      const data = { students, commissions, users, delegates, bankAccounts, courses };
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const size = (blob.size / 1024).toFixed(2) + ' KB';
      const backup: BackupData = {
          name: `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`,
          date: new Date().toISOString(),
          size: size,
          data: data
      };
      logActivity('backup', 'system', 'تم إنشاء نسخة احتياطية');
      addNotification('💾 نسخة احتياطية', 'تم إنشاء نسخة احتياطية للنظام بنجاح.', 'success');
      return backup;
  };

  const handleRestoreBackup = (data: any) => {
      if (data.students) setStudents(data.students);
      if (data.commissions) setCommissions(data.commissions);
      if (data.courses) setCourses(data.courses);
      if (data.users || data.delegates || data.bankAccounts) {
          restoreData({ users: data.users, delegates: data.delegates, bankAccounts: data.bankAccounts });
      }
      logActivity('restore', 'system', 'تم استعادة نسخة احتياطية');
      addNotification('🔄 استعادة النظام', 'تم استعادة بيانات النظام من النسخة الاحتياطية.', 'warning');
  };

  const dashboardStats = useMemo(() => {
    const activeDelegates = delegates.filter(d => d.isActive);
    const topDelegate = activeDelegates.length > 0 
      ? activeDelegates.reduce((prev, current) => (prev.students > current.students) ? prev : current)
      : null;

    return {
        totalStudents: students.length,
        pendingCommissions: commissions.filter(c => c.status === CommissionStatus.Pending).reduce((sum, c) => sum + c.amount, 0),
        paidCommissions: commissions.filter(c => c.status === CommissionStatus.Paid).reduce((sum, c) => sum + c.amount, 0),
        topDelegate: topDelegate ? `${topDelegate.fullName} (${topDelegate.students} طالب)` : 'لا يوجد',
    };
  }, [students, commissions, delegates]);


  if (!currentUser) {
    return <Login />;
  }
  
  if (currentUser.role === 'delegate') {
      return <DelegateDashboard delegates={delegates} students={students} onAddStudent={handleAddStudent} commissions={commissions} courses={courses} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard stats={dashboardStats} courses={courses} students={students} commissions={commissions} onNavigate={setActiveView} />;
      case 'students': return <StudentManagement delegates={delegates} students={students} onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onDeleteStudent={handleDeleteStudent} />;
      case 'delegates': return <DelegateManagement />;
      case 'commissions': return <CommissionManagement commissions={commissions} delegates={delegates} onUpdateCommissionStatus={updateCommissionStatus} onUpdateStudentStatus={updateStudentStatus} />;
      case 'courses': return <CourseManagement courses={courses} onAddCourse={handleAddCourse} onUpdateCourse={handleUpdateCourse} onDeleteCourse={handleDeleteCourse} />;
      case 'reports': return <Reports delegates={delegates} commissions={commissions} />;
      case 'activity-logs': return <ActivityLogs />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <Settings onCreateBackup={handleCreateBackup} onRestoreBackup={handleRestoreBackup} />;
      default: return <Dashboard stats={dashboardStats} courses={courses} students={students} commissions={commissions} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)]">
      <div className="relative min-h-screen md:flex">
        {isMenuOpen && (
          <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden no-print" aria-hidden="true" />
        )}
        <MainMenu activeView={activeView} setActiveView={(view) => { setActiveView(view); setIsMenuOpen(false); }} isOpen={isMenuOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden flex justify-between items-center p-4 bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-md sticky top-0 z-20 no-print">
            <h1 className="text-lg font-bold">نظام المندوب الذكي</h1>
            <button onClick={() => setIsMenuOpen(true)} className="p-2" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <AppHeader onNavigate={setActiveView} />
            <div className="mt-8">{renderView()}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
