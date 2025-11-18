
export enum Course {
  English = 'انجليزي',
  Computer = 'حاسوب',
  Maintenance = 'صيانة',
  Accounting = 'محاسبة',
  Reading = 'قراءة',
  Graphics = 'جرافيكس',
  Custom = 'دورة مخصصة',
}

export enum Schedule {
  Evening = 'مسائي',
  Morning = 'صباحي',
  Both = 'صباحي أو مسائي',
}

export enum CommissionStatus {
    Pending = 'معلقة',
    Confirmed = 'مؤكدة',
    Paid = 'مدفوعة',
    Cancelled = 'ملغاة' // Corresponds to Dropped student status
}

export enum StudentStatus {
    Registered = 'مسجل',
    FeesPaid = 'مدفوع الرسوم',
    Studying = 'مستمر',
    OnHold = 'متوقف',
    Dropped = 'منقطع',
    Completed = 'مكتمل',
}


export type Role = 'admin' | 'manager' | 'delegate';

export interface User {
  id: number;
  fullName: string;
  username: string;
  password?: string; // Optional for security reasons on client-side
  role: Role;
  isActive: boolean;
  createdDate: string;
  referredById?: number; // For tracking who registered this user
}

export interface BankAccount {
    id: number;
    delegateId: number;
    bankName: string;
    accountHolder: string;
    bankAccount: string; // Could be account number or IBAN
    iban?: string;
}

export interface Delegate {
  id: number;
  userId: number; // Now mandatory
  fullName: string;
  phone: string;
  students: number;
  email?: string;
  isActive: boolean;
  role: Role;
}

export interface Student {
  id: number;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  phone: string;
  course: Course;
  schedule: Schedule;
  delegateId: number;
  registrationDate: string;
}

export interface Commission {
    id: number;
    studentId: number;
    delegateId: number;
    studentName: string;
    course: Course;
    amount: number;
    status: CommissionStatus;
    studentStatus: StudentStatus;
    createdDate: string;
    confirmedDate?: string;
    paidDate?: string;
}

export interface ActivityLog {
    id: number;
    userId: number;
    userName: string;
    actionType: 'add' | 'edit' | 'delete' | 'login' | 'logout' | 'backup' | 'restore' | 'export' | 'import';
    target: string; // Table name or entity
    description: string;
    timestamp: string;
}

export interface BackupData {
    name: string;
    date: string;
    size: string;
    data: any; // The full state dump
}

export interface CourseObject {
    id: number;
    name: string;
    description: string;
    category: string;
    duration: number; // in weeks
    price: number;
    max_students: number;
    current_students: number;
    time_slot: string; // 'صباحي', 'مسائي', etc.
    start_date: string;
    end_date: string;
    enrollment_open: boolean;
    status: 'active' | 'upcoming' | 'completed';
}

export type View = 'dashboard' | 'students' | 'delegates' | 'commissions' | 'courses' | 'reports' | 'settings' | 'activity-logs' | 'logout';
