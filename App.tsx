
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
import { NotificationsPage } from './components/NotificationsPage'; // Import Notification Page
import type { View, Student, Commission, Delegate, BackupData, CourseObject } from './types';
import { Course, Schedule, CommissionStatus, StudentStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext'; // Import hook
import { Login } from './components/Login';
import { DelegateDashboard } from './components/DelegateDashboard';

// Empty initial data for a clean system
const initialStudentsData: Student[] = [];
const initialCommissions: Commission[] = [];
const initialCourses: CourseObject[] = [];


const App: React.FC = () => {
  const { currentUser, delegates, incrementStudentCount, decrementStudentCount, logActivity, users, bankAccounts, restoreData } = useAuth();
  const { addNotification } = useNotification(); // Use Notification Context

  const [activeView, setActiveView] = useState<View>('dashboard');
  
  // Initialize from localStorage with fallback to initial data
  const [students, setStudents] = useState<Student[]>(() => {
      const saved = localStorage.getItem('app_students');
      return saved ? JSON.parse(saved) : initialStudentsData;
  });
  
  const [commissions, setCommissions] = useState<Commission[]>(() => {
      const saved = localStorage.getItem('app_commissions');
      return saved ? JSON.parse(saved) : initialCommissions;
  });
  
  const [courses, setCourses] = useState<CourseObject[]>(() => {
      const saved = localStorage.getItem('app_courses');
      return saved ? JSON.parse(saved) : initialCourses;
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persistence Effects
  useEffect(() => {
      localStorage.setItem('app_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
      localStorage.setItem('app_commissions', JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
      localStorage.setItem('app_courses', JSON.stringify(courses));
  }, [courses]);

  // --- Auto Notifications Engine ---
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        // Check for Pending Commissions
        const pendingCount = commissions.filter(c => c.status === CommissionStatus.Pending).length;
        if (pendingCount > 0) {
             // To avoid spamming on every render, in a real app we'd check if notification exists. 
             // Here we rely on the user dismissing it or local storage check.
             // For simplicity in this prototype, we just add it if it's not there (this logic would be in Context usually)
             // Let's just add a generic welcome notification if none exist
             const welcomeKey = 'welcome_notification_sent';
             if (!sessionStorage.getItem(welcomeKey)) {
                 addNotification(
                    '💰 تنبيه العمولات',
                    `يوجد ${pendingCount} عمولة معلقة تحتاج إلى مراجعة.`,
                    'warning',
                    null, // Broadcast
                    'commissions'
                 );
                 sessionStorage.setItem(welcomeKey, 'true');
             }
        }

        // Check for Courses ending soon
        courses.forEach(course => {
            if (course.status === 'active') {
                const end = new Date(course.end_date);
                const now = new Date();
                const diffTime = end.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 7 && diffDays > 0) {
                    const key = `course_expiry_${course.id}_${now.getDate()}`; // Unique per day
                    if (!sessionStorage.getItem(key)) {
                        addNotification(
                            '⏳ دورة تنتهي قريباً',
                            `دورة "${course.name}" ستنتهي خلال ${diffDays} أيام.`,
                            'info',
                            null,
                            'courses',
                            course.id
                        );
                        sessionStorage.setItem(key, 'true');
                    }
                }
            }
        });
    }
  }, [currentUser, commissions, courses]); // Logic runs when data changes

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    const newStudent: Student = {
      id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
      ...studentData,
      registrationDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    setStudents(prevStudents => [newStudent, ...prevStudents]);
    incrementStudentCount(newStudent.delegateId);
    
    // Automatically create a commission log
    const newCommission: Commission = {
        id: commissions.length > 0 ? Math.max(...commissions.map(c => c.id)) + 1 : 1,
        studentId: newStudent.id,
        delegateId: newStudent.delegateId,
        studentName: `${newStudent.firstName} ${newStudent.secondName} ${newStudent.thirdName} ${newStudent.lastName}`,
        course: newStudent.course,
        amount: 500, // Updated commission amount
        status: CommissionStatus.Pending,
        studentStatus: StudentStatus.Registered,
        createdDate: newStudent.registrationDate,
    };
    setCommissions(prev => [newCommission, ...prev]);
    
    logActivity('add', 'students', `${newStudent.firstName} ${newStudent.lastName}`);
    
    // Notification for Admin
    addNotification(
        '🎉 طالب جديد',
        `تم تسجيل الطالب: ${newStudent.firstName} ${newStudent.lastName} بنجاح.`,
        'success',
        null, // Broadcast to admins
        'students',
        newStudent.id
    );
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
          
          addNotification(
            '🗑️ حذف طالب',
            `تم حذف الطالب ${studentToDelete.firstName} ${studentToDelete.lastName} من النظام.`,
            'danger'
          );
      }
  };
  
  const updateCommissionStatus = (commissionId: number, status: CommissionStatus) => {
      setCommissions(prev => prev.map(c => {
          if (c.id === commissionId) {
              const now = new Date().toISOString().split('T')[0];
              
              // Notify the delegate if commission is confirmed/paid
              if (status === CommissionStatus.Paid || status === CommissionStatus.Confirmed) {
                   // Assuming we can find the delegate's user ID from the delegate object.
                   // In current types, Delegate has userId.
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

              // Auto-update commission status based on student status
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

  // --- Course Management Handlers ---
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
      const data = {
          students,
          commissions,
          users,
          delegates,
          bankAccounts,
          courses
      };
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
      
      // Restore Auth Context data
      if (data.users || data.delegates || data.bankAccounts) {
          restoreData({
              users: data.users,
              delegates: data.delegates,
              bankAccounts: data.bankAccounts
          });
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
        pendingCommissions: commissions
            .filter(c => c.status === CommissionStatus.Pending)
            .reduce((sum, c) => sum + c.amount, 0),
        paidCommissions: commissions
            .filter(c => c.status === CommissionStatus.Paid)
            .reduce((sum, c) => sum + c.amount, 0),
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
      case 'dashboard':
        return <Dashboard stats={dashboardStats} courses={courses} students={students} commissions={commissions} onNavigate={setActiveView} />;
      case 'students':
        return <StudentManagement delegates={delegates} students={students} onAddStudent={handleAddStudent} onEditStudent={handleEditStudent} onDeleteStudent={handleDeleteStudent} />;
      case 'delegates':
        return <DelegateManagement />;
      case 'commissions':
        return <CommissionManagement commissions={commissions} delegates={delegates} onUpdateCommissionStatus={updateCommissionStatus} onUpdateStudentStatus={updateStudentStatus} />;
      case 'courses':
        return <CourseManagement courses={courses} onAddCourse={handleAddCourse} onUpdateCourse={handleUpdateCourse} onDeleteCourse={handleDeleteCourse} />;
      case 'reports':
        return <Reports delegates={delegates} commissions={commissions} />;
      case 'activity-logs':
        return <ActivityLogs />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <Settings onCreateBackup={handleCreateBackup} onRestoreBackup={handleRestoreBackup} />;
      default:
        return <Dashboard stats={dashboardStats} courses={courses} students={students} commissions={commissions} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)]">
      <div className="relative min-h-screen md:flex">
        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden no-print"
            aria-hidden="true"
          />
        )}

        <MainMenu 
          activeView={activeView}
          setActiveView={(view) => {
            setActiveView(view);
            setIsMenuOpen(false); // Close menu on mobile after navigation
          }}
          isOpen={isMenuOpen}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
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
            <div className="mt-8">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
