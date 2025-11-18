
import React, { useState, useMemo } from 'react';
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
import type { View, Student, Commission, Delegate, BackupData, CourseObject } from './types';
import { Course, Schedule, CommissionStatus, StudentStatus } from './types';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { DelegateDashboard } from './components/DelegateDashboard';

const initialStudentsData: Student[] = [
    // Students for abdulmalek (delegateId: 3)
    { id: 1, firstName: 'أحمد', secondName: 'علي', thirdName: 'محمد', lastName: 'الشهري', phone: '0511111111', course: Course.Computer, schedule: Schedule.Evening, delegateId: 3, registrationDate: '2024-07-10' },
    { id: 2, firstName: 'فاطمة', secondName: 'عبدالله', thirdName: 'حسن', lastName: 'الغامدي', phone: '0511111112', course: Course.English, schedule: Schedule.Morning, delegateId: 3, registrationDate: '2024-07-12' },
    { id: 3, firstName: 'خالد', secondName: 'سعيد', thirdName: 'عمر', lastName: 'القحطاني', phone: '0511111113', course: Course.Maintenance, schedule: Schedule.Both, delegateId: 3, registrationDate: '2024-07-15' },
    // Students for hadiya (delegateId: 4)
    { id: 4, firstName: 'سارة', secondName: 'محمد', thirdName: 'سالم', lastName: 'العتيبي', phone: '0511111114', course: Course.Accounting, schedule: Schedule.Morning, delegateId: 4, registrationDate: '2024-07-18' },
    { id: 5, firstName: 'عمر', secondName: 'أحمد', thirdName: 'علي', lastName: 'الحربي', phone: '0511111115', course: Course.Graphics, schedule: Schedule.Evening, delegateId: 4, registrationDate: '2024-07-20' },
    // Students for mhajri (delegateId: 5)
    { id: 6, firstName: 'نورة', secondName: 'عبدالعزيز', thirdName: 'فهد', lastName: 'الشمري', phone: '0511111116', course: Course.Reading, schedule: Schedule.Morning, delegateId: 5, registrationDate: '2024-06-25' },
    { id: 7, firstName: 'ياسر', secondName: 'فهد', thirdName: 'ناصر', lastName: 'المطيري', phone: '0511111117', course: Course.Computer, schedule: Schedule.Both, delegateId: 5, registrationDate: '2024-06-28' },
    // Students for ammar (delegateId: 6)
    { id: 8, firstName: 'لينا', secondName: 'محسن', thirdName: 'سعيد', lastName: 'الغامدي', phone: '0511111118', course: Course.English, schedule: Schedule.Evening, delegateId: 6, registrationDate: '2024-07-22' },
    // Students for najla (delegateId: 7)
    { id: 9, firstName: 'ريماس', secondName: 'نواف', thirdName: 'بدر', lastName: 'الثبيتي', phone: '0511111119', course: Course.Custom, schedule: Schedule.Morning, delegateId: 7, registrationDate: '2024-07-25' },
    { id: 10, firstName: 'بدر', secondName: 'ناصر', thirdName: 'خالد', lastName: 'السعدي', phone: '0511111120', course: Course.Maintenance, schedule: Schedule.Evening, delegateId: 7, registrationDate: '2024-07-28' },
];

const initialCommissions: Commission[] = [
    { id: 1, studentId: 1, delegateId: 3, studentName: 'أحمد علي محمد الشهري', course: Course.Computer, amount: 500, status: CommissionStatus.Paid, studentStatus: StudentStatus.Completed, createdDate: '2024-07-10', paidDate: '2024-07-20' },
    { id: 2, studentId: 2, delegateId: 3, studentName: 'فاطمة عبدالله حسن الغامدي', course: Course.English, amount: 500, status: CommissionStatus.Confirmed, studentStatus: StudentStatus.Studying, createdDate: '2024-07-12', confirmedDate: '2024-07-18' },
    { id: 3, studentId: 3, delegateId: 3, studentName: 'خالد سعيد عمر القحطاني', course: Course.Maintenance, amount: 500, status: CommissionStatus.Pending, studentStatus: StudentStatus.FeesPaid, createdDate: '2024-07-15' },
    { id: 4, studentId: 4, delegateId: 4, studentName: 'سارة محمد سالم العتيبي', course: Course.Accounting, amount: 500, status: CommissionStatus.Confirmed, studentStatus: StudentStatus.Studying, createdDate: '2024-07-18', confirmedDate: '2024-07-22' },
    { id: 5, studentId: 5, delegateId: 4, studentName: 'عمر أحمد علي الحربي', course: Course.Graphics, amount: 500, status: CommissionStatus.Cancelled, studentStatus: StudentStatus.Dropped, createdDate: '2024-07-20' },
    { id: 6, studentId: 6, delegateId: 5, studentName: 'نورة عبدالعزيز فهد الشمري', course: Course.Reading, amount: 500, status: CommissionStatus.Paid, studentStatus: StudentStatus.Completed, createdDate: '2024-06-25', paidDate: '2024-07-05' },
    { id: 7, studentId: 7, delegateId: 5, studentName: 'ياسر فهد ناصر المطيري', course: Course.Computer, amount: 500, status: CommissionStatus.Pending, studentStatus: StudentStatus.OnHold, createdDate: '2024-06-28' },
    { id: 8, studentId: 8, delegateId: 6, studentName: 'لينا محسن سعيد الغامدي', course: Course.English, amount: 500, status: CommissionStatus.Pending, studentStatus: StudentStatus.Registered, createdDate: '2024-07-22' },
    { id: 9, studentId: 9, delegateId: 7, studentName: 'ريماس نواف بدر الثبيتي', course: Course.Custom, amount: 500, status: CommissionStatus.Pending, studentStatus: StudentStatus.FeesPaid, createdDate: '2024-07-25' },
    { id: 10, studentId: 10, delegateId: 7, studentName: 'بدر ناصر خالد السعدي', course: Course.Maintenance, amount: 500, status: CommissionStatus.Confirmed, studentStatus: StudentStatus.Studying, createdDate: '2024-07-28', confirmedDate: '2024-07-30' },
];

const initialCourses: CourseObject[] = [
    { id: 1, name: 'دورة الحاسوب المتقدم', description: 'دورة شاملة في أساسيات الحاسوب والأوفيس', category: 'حاسوب', duration: 4, price: 1000, current_students: 18, max_students: 25, time_slot: 'صباحي', start_date: '2024-01-10', end_date: '2024-02-20', enrollment_open: true, status: 'active' },
    { id: 2, name: 'دورة اللغة الإنجليزية', description: 'مستويات متعددة في اللغة الإنجليزية', category: 'لغات', duration: 6, price: 1200, current_students: 22, max_students: 22, time_slot: 'مسائي', start_date: '2024-01-05', end_date: '2024-02-15', enrollment_open: false, status: 'active' },
    { id: 3, name: 'دورة المحاسبة', description: 'أساسيات المحاسبة المالية والإدارية', category: 'إدارة', duration: 5, price: 1500, current_students: 12, max_students: 20, time_slot: 'صباحي', start_date: '2024-01-25', end_date: '2024-03-10', enrollment_open: true, status: 'active' },
    { id: 4, name: 'دورة الجرافيكس والتصميم', description: 'تعلم الفوتوشوب والإليستريتور', category: 'فني', duration: 6, price: 1800, current_students: 8, max_students: 15, time_slot: 'صباحي', start_date: '2024-02-01', end_date: '2024-03-15', enrollment_open: true, status: 'upcoming' },
    { id: 5, name: 'دورة صيانة الأجهزة', description: 'صيانة الهواتف الذكية والحواسيب', category: 'فني', duration: 6, price: 1500, current_students: 12, max_students: 18, time_slot: 'مسائي', start_date: '2024-02-05', end_date: '2024-03-20', enrollment_open: true, status: 'upcoming' },
    { id: 6, name: 'دورة البرمجة', description: 'أساسيات البرمجة بلغة بايثون', category: 'حاسوب', duration: 8, price: 2000, current_students: 0, max_students: 20, time_slot: 'صباحي ومسائي', start_date: '2024-02-10', end_date: '2024-04-01', enrollment_open: false, status: 'upcoming' }
];


const App: React.FC = () => {
  const { currentUser, delegates, incrementStudentCount, decrementStudentCount, logActivity, users, bankAccounts, restoreData } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [courses, setCourses] = useState<CourseObject[]>(initialCourses);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      }
  };
  
  const updateCommissionStatus = (commissionId: number, status: CommissionStatus) => {
      setCommissions(prev => prev.map(c => {
          if (c.id === commissionId) {
              const now = new Date().toISOString().split('T')[0];
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
      return <DelegateDashboard delegates={delegates} students={students} onAddStudent={handleAddStudent} commissions={commissions} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} courses={courses} onNavigate={setActiveView} />;
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
      case 'settings':
        return <Settings onCreateBackup={handleCreateBackup} onRestoreBackup={handleRestoreBackup} />;
      default:
        return <Dashboard stats={dashboardStats} courses={courses} onNavigate={setActiveView} />;
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
            <h1 className="text-lg font-bold">نظام المندوب الذكي - المركز الأوروبي</h1>
            <button onClick={() => setIsMenuOpen(true)} className="p-2" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </header>
          
          <main className="flex-1 p-4 md:p-8">
            <AppHeader />
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
