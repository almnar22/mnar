
import { Student, Commission, CourseObject, User, Delegate, BankAccount, ActivityLog, Notification } from '../types';

// ⚙️ CONFIGURATION
// Set this to true when you have a backend server ready to sync across devices.
const USE_CLOUD_API = false; 
const API_BASE_URL = 'https://your-backend-api.com/api'; // Replace with your actual API URL

// Helper to simulate network delay in Mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic Helper for LocalStorage Fallback
const localStore = {
    get: <T>(key: string, defaultValue: T): T => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    },
    set: (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const api = {
    students: {
        getAll: async (): Promise<Student[]> => {
            if (USE_CLOUD_API) {
                const res = await fetch(`${API_BASE_URL}/students`);
                return res.json();
            }
            await delay(300);
            return localStore.get<Student[]>('app_students', []);
        },
        create: async (student: Student): Promise<Student> => {
            if (USE_CLOUD_API) {
                const res = await fetch(`${API_BASE_URL}/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(student)
                });
                return res.json();
            }
            const students = localStore.get<Student[]>('app_students', []);
            const newStudent = { ...student, id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1 };
            localStore.set('app_students', [newStudent, ...students]);
            return newStudent;
        },
        update: async (id: number, data: Partial<Student>): Promise<void> => {
             if (USE_CLOUD_API) {
                await fetch(`${API_BASE_URL}/students/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return;
            }
            const students = localStore.get<Student[]>('app_students', []);
            const updated = students.map(s => s.id === id ? { ...s, ...data } : s);
            localStore.set('app_students', updated);
        },
        delete: async (id: number): Promise<void> => {
            if (USE_CLOUD_API) {
                await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
                return;
            }
            const students = localStore.get<Student[]>('app_students', []);
            localStore.set('app_students', students.filter(s => s.id !== id));
        }
    },

    commissions: {
        getAll: async (): Promise<Commission[]> => {
            if (USE_CLOUD_API) {
                const res = await fetch(`${API_BASE_URL}/commissions`);
                return res.json();
            }
            return localStore.get<Commission[]>('app_commissions', []);
        },
        create: async (commission: Commission): Promise<Commission> => {
            if (USE_CLOUD_API) {
                 const res = await fetch(`${API_BASE_URL}/commissions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(commission)
                });
                return res.json();
            }
            const items = localStore.get<Commission[]>('app_commissions', []);
            const newItem = { ...commission, id: items.length > 0 ? Math.max(...items.map(c => c.id)) + 1 : 1 };
            localStore.set('app_commissions', [newItem, ...items]);
            return newItem;
        },
        update: async (id: number, data: Partial<Commission>): Promise<void> => {
            if (USE_CLOUD_API) {
                await fetch(`${API_BASE_URL}/commissions/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return;
            }
            const items = localStore.get<Commission[]>('app_commissions', []);
            localStore.set('app_commissions', items.map(i => i.id === id ? { ...i, ...data } : i));
        },
        deleteByStudentId: async (studentId: number): Promise<void> => {
             if (USE_CLOUD_API) {
                await fetch(`${API_BASE_URL}/commissions/student/${studentId}`, { method: 'DELETE' });
                return;
            }
            const items = localStore.get<Commission[]>('app_commissions', []);
            localStore.set('app_commissions', items.filter(i => i.studentId !== studentId));
        }
    },

    courses: {
        getAll: async (): Promise<CourseObject[]> => {
             if (USE_CLOUD_API) {
                const res = await fetch(`${API_BASE_URL}/courses`);
                return res.json();
            }
            return localStore.get<CourseObject[]>('app_courses', []);
        },
        create: async (course: CourseObject): Promise<CourseObject> => {
             if (USE_CLOUD_API) {
                const res = await fetch(`${API_BASE_URL}/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(course)
                });
                return res.json();
            }
            const items = localStore.get<CourseObject[]>('app_courses', []);
            const newItem = { ...course, id: items.length > 0 ? Math.max(...items.map(c => c.id)) + 1 : 1 };
            localStore.set('app_courses', [...items, newItem]);
            return newItem;
        },
        update: async (id: number, data: Partial<CourseObject>): Promise<void> => {
             if (USE_CLOUD_API) {
                 await fetch(`${API_BASE_URL}/courses/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                return;
            }
            const items = localStore.get<CourseObject[]>('app_courses', []);
            localStore.set('app_courses', items.map(i => i.id === id ? { ...i, ...data } : i));
        },
        delete: async (id: number): Promise<void> => {
             if (USE_CLOUD_API) {
                await fetch(`${API_BASE_URL}/courses/${id}`, { method: 'DELETE' });
                return;
            }
            const items = localStore.get<CourseObject[]>('app_courses', []);
            localStore.set('app_courses', items.filter(i => i.id !== id));
        }
    },

    users: {
        getAll: async (): Promise<User[]> => {
             if (USE_CLOUD_API) return (await fetch(`${API_BASE_URL}/users`)).json();
             const defaultAdmin: User = { id: 1, fullName: 'مدير النظام', username: 'admin', password: '123456', role: 'admin', isActive: true, createdDate: new Date().toISOString().split('T')[0] };
             return localStore.get<User[]>('app_users', [defaultAdmin]);
        },
        create: async (user: User): Promise<User> => {
             if (USE_CLOUD_API) {
                 const res = await fetch(`${API_BASE_URL}/users`, { method: 'POST', body: JSON.stringify(user) });
                 return res.json();
             }
             const items = localStore.get<User[]>('app_users', []);
             const newItem = { ...user, id: items.length > 0 ? Math.max(...items.map(u => u.id)) + 1 : 1 };
             localStore.set('app_users', [...items, newItem]);
             return newItem;
        },
        update: async (id: number, data: Partial<User>): Promise<void> => {
             if (USE_CLOUD_API) await fetch(`${API_BASE_URL}/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
             else {
                 const items = localStore.get<User[]>('app_users', []);
                 localStore.set('app_users', items.map(u => u.id === id ? { ...u, ...data } : u));
             }
        }
    },

    delegates: {
        getAll: async (): Promise<Delegate[]> => {
             if (USE_CLOUD_API) return (await fetch(`${API_BASE_URL}/delegates`)).json();
             const defaultDelegate: Delegate = { id: 1, userId: 1, fullName: 'مدير النظام', phone: '0000000000', students: 0, isActive: true, email: 'admin@system.com', role: 'admin' };
             return localStore.get<Delegate[]>('app_delegates', [defaultDelegate]);
        },
        create: async (delegate: Delegate): Promise<Delegate> => {
             if (USE_CLOUD_API) {
                 const res = await fetch(`${API_BASE_URL}/delegates`, { method: 'POST', body: JSON.stringify(delegate) });
                 return res.json();
             }
             const items = localStore.get<Delegate[]>('app_delegates', []);
             const newItem = { ...delegate, id: items.length > 0 ? Math.max(...items.map(d => d.id)) + 1 : 1 };
             localStore.set('app_delegates', [...items, newItem]);
             return newItem;
        },
        update: async (userId: number, data: Partial<Delegate>): Promise<void> => {
            if (USE_CLOUD_API) await fetch(`${API_BASE_URL}/delegates/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
            else {
                const items = localStore.get<Delegate[]>('app_delegates', []);
                localStore.set('app_delegates', items.map(d => d.userId === userId ? { ...d, ...data } : d));
            }
        },
        updateCount: async (id: number, increment: boolean): Promise<void> => {
            if (USE_CLOUD_API) return; // Backend handles this
            const items = localStore.get<Delegate[]>('app_delegates', []);
            localStore.set('app_delegates', items.map(d => {
                if(d.id === id) return { ...d, students: increment ? d.students + 1 : Math.max(0, d.students - 1) };
                return d;
            }));
        }
    },

    logs: {
        getAll: async (): Promise<ActivityLog[]> => {
            if (USE_CLOUD_API) return (await fetch(`${API_BASE_URL}/logs`)).json();
            return localStore.get<ActivityLog[]>('app_activityLogs', []);
        },
        create: async (log: ActivityLog): Promise<void> => {
             if (USE_CLOUD_API) await fetch(`${API_BASE_URL}/logs`, { method: 'POST', body: JSON.stringify(log) });
             else {
                 const items = localStore.get<ActivityLog[]>('app_activityLogs', []);
                 localStore.set('app_activityLogs', [log, ...items]);
             }
        }
    },
    
    bankAccounts: {
         getAll: async (): Promise<BankAccount[]> => {
            if (USE_CLOUD_API) return (await fetch(`${API_BASE_URL}/bankAccounts`)).json();
            return localStore.get<BankAccount[]>('app_bankAccounts', []);
         },
         save: async (account: BankAccount): Promise<BankAccount> => {
            if (USE_CLOUD_API) {
                 const res = await fetch(`${API_BASE_URL}/bankAccounts`, { method: 'POST', body: JSON.stringify(account) });
                 return res.json();
            }
            const items = localStore.get<BankAccount[]>('app_bankAccounts', []);
            const existingIdx = items.findIndex(a => a.delegateId === account.delegateId);
            
            if(existingIdx > -1) {
                const updated = [...items];
                updated[existingIdx] = { ...updated[existingIdx], ...account };
                localStore.set('app_bankAccounts', updated);
                return updated[existingIdx];
            } else {
                const newItem = { ...account, id: items.length > 0 ? Math.max(...items.map(a => a.id)) + 1 : 1 };
                localStore.set('app_bankAccounts', [...items, newItem]);
                return newItem;
            }
         }
    }
};
