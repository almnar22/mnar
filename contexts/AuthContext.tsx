
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User, Role, Delegate, BankAccount, ActivityLog } from '../types';
import { api } from '../services/api';

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [delegates, setDelegates] = useState<Delegate[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const storedUser = window.localStorage.getItem('current-user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            return null;
        }
    });

    // Load initial data via API
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const [loadedUsers, loadedDelegates, loadedAccounts, loadedLogs] = await Promise.all([
                    api.users.getAll(),
                    api.delegates.getAll(),
                    api.bankAccounts.getAll(),
                    api.logs.getAll()
                ]);
                setUsers(loadedUsers);
                setDelegates(loadedDelegates);
                setBankAccounts(loadedAccounts);
                setActivityLogs(loadedLogs);
            } catch (e) {
                console.error("Auth data load failed", e);
            }
        };
        loadAuthData();
    }, []);

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

    const login = async (username: string, password?: string): Promise<User> => {
        // Refresh users list before login to ensure sync
        const currentUsers = await api.users.getAll();
        setUsers(currentUsers);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => { 
                const user = currentUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
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
        // Optimistic Update (Real ID will come from server in real app)
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
        
        // Call API
        api.users.create(newUser).then(() => {
             // Create Delegate Profile
            const newDelegateId = delegates.length > 0 ? Math.max(...delegates.map(d => d.id)) + 1 : 1;
            const newDelegate: Delegate = {
                id: newDelegateId,
                userId: newUserId,
                fullName: userData.fullName,
                phone: userData.phone,
                email: userData.email,
                students: 0,
                isActive: true,
                role: userData.role,
            };
            api.delegates.create(newDelegate).then(d => setDelegates(prev => [...prev, d]));
        });

        setUsers(prevUsers => [...prevUsers, newUser]);
        return newUser;
    };
    
    const updateUser = async (userId: number, updatedData: any) => {
        const { password, ...userSafeData } = updatedData;
        const finalUserData = password ? { ...userSafeData, password } : userSafeData;
        
        await api.users.update(userId, finalUserData);
        await api.delegates.update(userId, updatedData);

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

    const toggleUserStatus = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        if(user) {
            const newStatus = !user.isActive;
            await api.users.update(userId, { isActive: newStatus });
            
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: newStatus } : u));
            setDelegates(prev => prev.map(d => d.userId === userId ? { ...d, isActive: newStatus } : d));
        }
    };
    
    const incrementStudentCount = (delegateId: number) => {
        api.delegates.updateCount(delegateId, true);
        setDelegates(prev => prev.map(d => d.id === delegateId ? { ...d, students: d.students + 1 } : d));
    };

    const decrementStudentCount = (delegateId: number) => {
        api.delegates.updateCount(delegateId, false);
        setDelegates(prev => prev.map(d => d.id === delegateId ? { ...d, students: Math.max(0, d.students - 1) } : d));
    };

    const addOrUpdateBankAccount = async (accountData: Omit<BankAccount, 'id'>) => {
         const savedAccount = await api.bankAccounts.save({ ...accountData, id: 0 } as BankAccount);
         
         setBankAccounts(prev => {
            const existingAccountIndex = prev.findIndex(acc => acc.delegateId === accountData.delegateId);
            if(existingAccountIndex > -1) {
                const updatedAccounts = [...prev];
                updatedAccounts[existingAccountIndex] = savedAccount;
                return updatedAccounts;
            } else {
                return [...prev, savedAccount];
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
        api.logs.create(newLog);
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
            
            api.users.update(userId, { password: newPass }).then(() => {
                const updatedUser = { ...user, password: newPass };
                const newUsers = [...users];
                newUsers[userIndex] = updatedUser;
                setUsers(newUsers);
                resolve();
            });
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
