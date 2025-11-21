
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
import { CommissionStatus, StudentStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';
import { Login } from './components/Login';
import { DelegateDashboard } from './components/DelegateDashboard';
import { api } from './services/api'; // Import API Service

const App: React.FC = () => {
  const { currentUser, delegates, incrementStudentCount, decrementStudentCount, logActivity, users, bankAccounts, restoreData } = useAuth();
  const { addNotification } = useNotification();

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [courses, setCourses] = useState<CourseObject[]>([]);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initial Data Load from API
  useEffect(() => {
      const loadData = async () => {
          setIsLoading(true);
          try {
              const [loadedStudents, loadedCommissions, loadedCourses] = await Promise.all([
                  api.students.getAll(),
                  api.commissions.getAll(),
                  api.courses.getAll()
              ]);
              setStudents(loadedStudents);
              setCommissions(loadedCommissions);
              setCourses(loadedCourses);
          } catch (error) {
              console.error("Failed to load data", error);
              addNotification('خطأ', 'فشل في تحميل البيانات من الخادم', 'danger');
          } finally {
              setIsLoading(false);
          }
      };
      
      // Only load if logged in
      if (currentUser) {
          loadData();
      }
  }, [currentUser]);


  // --- Auto Notifications Engine ---
  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
        const pendingCount = commissions.filter(c => c.status === CommissionStatus.Pending).length;
        if (pendingCount > 0) {
             const welcomeKey = 'welcome_notification_sent';
             if (!sessionStorage.getItem(welcomeKey)) {
                 addNotification(
                    '💰 تنبيه العمولات',
                    `يوجد ${pendingCount} عمولة معلقة تحتاج إلى مراجعة.`,
                    'warning',
                    null,
                    'commissions'
                 );
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
  }, [currentUser, commissions, courses]);

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    try {
        // 1. Create Student via API
        const newStudent = await api.students.create({
            ...studentData,
            id: 0, // ID handled by backend/service
            registrationDate: new Date().toISOString().split('T')[0]
        });
        
        setStudents(prev => [newStudent, ...prev]);
        incrementStudentCount(newStudent.delegateId);
        
        // 2. Create Commission via API
        const commissionData: Commission = {
            id: 0,
            studentId: newStudent.id,
            delegateId: newStudent.delegateId,
            studentName: `${newStudent.firstName} ${newStudent.secondName} ${newStudent.thirdName} ${newStudent.lastName}`,
            course: newStudent.course,
            amount: 500,
            status: CommissionStatus.Pending,
            studentStatus: StudentStatus.Registered,
            createdDate: newStudent.registrationDate,
        };
        
        const newCommission = await api.commissions.create(commissionData);
        setCommissions(prev => [newCommission, ...prev]);
        
        logActivity('add', 'students', `${newStudent.firstName} ${newStudent.lastName}`);
        
        addNotification(
            '🎉 طالب جديد',
            `تم تسجيل الطالب: ${newStudent.firstName} ${newStudent.lastName} بنجاح.`,
            'success',
            null,
            'students',
            newStudent.id
        );
    } catch (e) {
        console.error(e);
        addNotification('خطأ', 'فشل في تسجيل الطالب', 'danger');
    }
  };

  const handleEditStudent = async (studentId: number, updatedData: Partial<Omit<Student, 'id'>>) => {
      try {
          await api.students.update(studentId, updatedData);
          const oldData = students.find(s => s.id === studentId);
          setStudents(prev => prev.map(s => s.id === studentId ? {...s, ...updatedData} : s));
          if(oldData) logActivity('edit', 'students', `${oldData.firstName} ${oldData.lastName} (ID: ${studentId})`);
      } catch (e) {
          addNotification('خطأ', 'فشل في تحديث بيانات الطالب', 'danger');
      }
  };
  
  const handleDeleteStudent = async (studentId: number) => {
      try {
          const studentToDelete = students.find(s => s.id === studentId);
          if(studentToDelete){
              await api.students.delete(studentId);
              await api.commissions.deleteByStudentId(studentId);

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
      } catch (e) {
          addNotification('خطأ', 'فشل في حذف الطالب', 'danger');
      }
  };
  
  const updateCommissionStatus = async (commissionId: number, status: CommissionStatus) => {
      try {
          await api.commissions.update(commissionId, { status, paidDate: status === CommissionStatus.Paid ? new Date().toISOString().split('T')[0] : undefined });
          
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
      } catch (e) {
          addNotification('خطأ', 'فشل في تحديث العمولة', 'danger');
      }
  };

  const updateStudentStatus = async (commissionId: number, studentStatus: StudentStatus) => {
      try {
          const commission = commissions.find(c => c.id === commissionId);
          if(!commission) return;

          const now = new Date().toISOString().split('T')[0];
          let newCommissionStatus = commission.status;
          let newConfirmedDate = commission.confirmedDate;

          if (studentStatus === StudentStatus.Completed && commission.status !== CommissionStatus.Paid) {
              newCommissionStatus = CommissionStatus.Confirmed;
              newConfirmedDate = commission.confirmedDate || now;
          } else if (studentStatus === StudentStatus.Dropped) {
              newCommissionStatus = CommissionStatus.Cancelled;
          }

          await api.commissions.update(commissionId, { studentStatus, status: newCommissionStatus, confirmedDate: newConfirmedDate });

          setCommissions(prev => prev.map(c => {
              if (c.id === commissionId) {
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
      } catch (e) {
           addNotification('خطأ', 'فشل في تحديث حالة الطالب', 'danger');
      }
  };

  // --- Course Management Handlers ---
  const handleAddCourse = async (courseData: Omit<CourseObject, 'id' | 'current_students'>) => {
      try {
          const newCourse = await api.courses.create({ ...courseData, id: 0, current_students: 0 });
          setCourses(prev => [...prev, newCourse]);
          logActivity('add', 'courses', `إضافة دورة جديدة: ${newCourse.name}`);
          addNotification('📚 دورة جديدة', `تم إضافة دورة جديدة: ${newCourse.name}`, 'info');
      } catch (e) {
          addNotification('خطأ', 'فشل في إضافة الدورة', 'danger');
      }
  };

  const handleUpdateCourse = async (id: number, courseData: Partial<CourseObject>) => {
      try {
          await api.courses.update(id, courseData);
          setCourses(prev => prev.map(c => c.id === id ? { ...c, ...courseData } : c));
          logActivity('edit', 'courses', `تحديث دورة: ${id}`);
      } catch(e) {
          addNotification('خطأ', 'فشل في تحديث الدورة', 'danger');
      }
  };

  const handleDeleteCourse = async (id: number) => {
      try {
          const courseToDelete = courses.find(c => c.id === id);
          if (courseToDelete) {
              await api.courses.delete(id);
              setCourses(prev => prev.filter(c => c.id !== id));
              logActivity('delete', 'courses', `حذف دورة: ${courseToDelete.name}`);
          }
      } catch(e) {
           addNotification('خطأ', 'فشل في حذف الدورة', 'danger');
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
      if (data.students) {
          setStudents(data.students);
          data.students.forEach((s: any) => api.students.create(s)); // Sync to API (naive approach)
      }
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
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
    }

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
            setIsMenuOpen(false); 
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
