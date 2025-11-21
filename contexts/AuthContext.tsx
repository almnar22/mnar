
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User, Role, Delegate, BankAccount, ActivityLog } from '../types';

// Clean system: Only one default admin user
const initialUsers: User[] = [
    { id: 1, fullName: 'مدير النظام', username: 'admin', password: '123456', role: 'admin', isActive: true, createdDate: new Date().toISOString().split('T')[0] }
];

const initialDelegates: Delegate[] = [
    { id: 1, userId: 1, fullName: 'مدير النظام', phone: '0000000000', students: 0, isActive: true, email: 'admin@system.com', role: 'admin' }
];

const initialBankAccounts: BankAccount[] = [];


interface AuthContextType {
    currentUser: User | null;
    users: User[];
    delegates: Delegate[];
    bankAccounts: BankAccount[];
    activityLogs: ActivityLog[];
    login: (username: string, password?: string) => Promise<User>;
    logout: () => void;
    addUser: (userData: any, referredById?: number) => User;
    updateUser: (userId: number, updatedData: any) => void;
    toggleUserStatus: (userId: number) => void;
    incrementStudentCount: (delegateId: number) => void;
    decrementStudentCount: (delegateId: number) => void;
    addOrUpdateBankAccount: (accountData: Omit<BankAccount, 'id'>) => void;
    logActivity: (actionType: ActivityLog['actionType'], target: string, description: string) => void;
    restoreData: (data: { users?: User[], delegates?: Delegate[], bankAccounts?: BankAccount[] }) => void;
    changePassword: (userId: number, currentPass: string, newPass: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage with fallback to initial data
    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem('app_users');
        return saved ? JSON.parse(saved) : initialUsers;
    });
    
    const [delegates, setDelegates] = useState<Delegate[]>(() => {
        const saved = localStorage.getItem('app_delegates');
        return saved ? JSON.parse(saved) : initialDelegates;
    });
    
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
        const saved = localStorage.getItem('app_bankAccounts');
        return saved ? JSON.parse(saved) : initialBankAccounts;
    });
    
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
        const saved = localStorage.getItem('app_activityLogs');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const storedUser = window.localStorage.getItem('current-user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('app_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('app_delegates', JSON.stringify(delegates));
    }, [delegates]);

    useEffect(() => {
        localStorage.setItem('app_bankAccounts', JSON.stringify(bankAccounts));
    }, [bankAccounts]);

    useEffect(() => {
        localStorage.setItem('app_activityLogs', JSON.stringify(activityLogs));
    }, [activityLogs]);

    useEffect(() => {
        try {
            if (currentUser) {
                window.localStorage.setItem('current-user', JSON.stringify(currentUser));
            } else {
                window.localStorage.removeItem('current-user');
            }
        } catch (error) {
            console.error("Failed to save user to localStorage", error);
        }
    }, [currentUser]);

    const login = (username: string, password?: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => { // Simulate network delay
                const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
                if (user && user.isActive) {
                    const { password, ...userToStore } = user;
                    setCurrentUser(userToStore);
                    resolve(userToStore);
                } else if (user && !user.isActive) {
                    reject(new Error('هذا الحساب غير نشط.'));
                } else {
                    reject(new Error('اسم المستخدم أو كلمة المرور غير صحيحة.'));
                }
            }, 500);
        });
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addUser = (userData: any, referredById?: number): User => {
        const newUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser: User = {
            id: newUserId,
            fullName: userData.fullName,
            username: userData.username,
            password: userData.password,
            role: userData.role,
            isActive: true,
            createdDate: new Date().toISOString().split('T')[0],
            referredById: referredById,
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        
        // Always create a delegate profile for any new user to store phone/email etc.
        const newDelegateId = delegates.length > 0 ? Math.max(...delegates.map(d => d.id)) + 1 : 1;
        const newDelegate: Delegate = {
            id: newDelegateId,
            userId: newUserId,
            fullName: userData.fullName,
            phone: userData.phone,
            email: userData.email,
            students: 0,
            isActive: true,
            // FIX: Added role when creating a new delegate to match the updated Delegate type.
            role: userData.role,
        };
        setDelegates(prevDelegates => [...prevDelegates, newDelegate]);
        
        return newUser;
    };
    
    const updateUser = (userId: number, updatedData: any) => {
        const { password, ...userSafeData } = updatedData;
        const finalUserData = password ? { ...userSafeData, password } : userSafeData;
        
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, ...finalUserData } : user
            )
        );
        
        if(currentUser?.id === userId) {
            setCurrentUser(prev => prev ? {...prev, ...finalUserData} : null);
        }

        setDelegates(prev => prev.map(d => d.userId === userId ? { ...d, ...updatedData } : d));
    };

    const toggleUserStatus = (userId: number) => {
        let newStatus: boolean | undefined;
        setUsers(prevUsers =>
            prevUsers.map(user => {
                if (user.id === userId) {
                    newStatus = !user.isActive;
                    return { ...user, isActive: newStatus };
                }
                return user;
            })
        );
        
        if (newStatus !== undefined) {
             setDelegates(prevDelegates =>
                prevDelegates.map(delegate =>
                    delegate.userId === userId ? { ...delegate, isActive: newStatus! } : delegate
                )
            );
        }
    };
    
    const incrementStudentCount = (delegateId: number) => {
        setDelegates(prev => prev.map(d => d.id === delegateId ? { ...d, students: d.students + 1 } : d));
    };

    const decrementStudentCount = (delegateId: number) => {
        setDelegates(prev => prev.map(d => d.id === delegateId ? { ...d, students: Math.max(0, d.students - 1) } : d));
    };

    const addOrUpdateBankAccount = (accountData: Omit<BankAccount, 'id'>) => {
        setBankAccounts(prev => {
            const existingAccountIndex = prev.findIndex(acc => acc.delegateId === accountData.delegateId);
            if(existingAccountIndex > -1) {
                // Update existing account
                const updatedAccounts = [...prev];
                updatedAccounts[existingAccountIndex] = {...updatedAccounts[existingAccountIndex], ...accountData};
                return updatedAccounts;
            } else {
                // Add new account
                const newId = prev.length > 0 ? Math.max(...prev.map(acc => acc.id)) + 1 : 1;
                return [...prev, {id: newId, ...accountData}];
            }
        });
    };

    const logActivity = (actionType: ActivityLog['actionType'], target: string, description: string) => {
        const newLog: ActivityLog = {
            id: Date.now(),
            userId: currentUser?.id || 0,
            userName: currentUser?.fullName || 'System',
            actionType,
            target,
            description,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const restoreData = (data: { users?: User[], delegates?: Delegate[], bankAccounts?: BankAccount[] }) => {
        if (data.users) setUsers(data.users);
        if (data.delegates) setDelegates(data.delegates);
        if (data.bankAccounts) setBankAccounts(data.bankAccounts);
    };

    const changePassword = (userId: number, currentPass: string, newPass: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1) {
                reject(new Error('المستخدم غير موجود'));
                return;
            }
            
            const user = users[userIndex];
            if (user.password !== currentPass) {
                 reject(new Error('كلمة المرور الحالية غير صحيحة'));
                 return;
            }

            const updatedUser = { ...user, password: newPass };
            const newUsers = [...users];
            newUsers[userIndex] = updatedUser;
            setUsers(newUsers);
             
             resolve();
        });
    };

    const contextValue = { 
        currentUser, 
        users, 
        delegates, 
        bankAccounts, 
        activityLogs,
        login, 
        logout, 
        addUser, 
        updateUser, 
        toggleUserStatus, 
        incrementStudentCount, 
        decrementStudentCount, 
        addOrUpdateBankAccount,
        logActivity,
        restoreData,
        changePassword
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
