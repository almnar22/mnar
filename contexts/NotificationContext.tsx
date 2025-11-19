
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Notification, NotificationType, User } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type: NotificationType, userId?: number | null, relatedModule?: string, relatedId?: number) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    deleteNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        try {
            const stored = localStorage.getItem('app_notifications');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Filter notifications relevant to the current user
    const userNotifications = notifications.filter(n => {
        if (!currentUser) return false;
        // Show if assigned to user specifically OR if assigned to null (broadcast) and user is admin/manager
        if (n.userId === currentUser.id) return true;
        if (n.userId === null) return true; // Broadcasts are for everyone usually, or logic specific to roles
        return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    const addNotification = (
        title: string, 
        message: string, 
        type: NotificationType, 
        userId: number | null = null, // Default to broadcast if not specified
        relatedModule?: string, 
        relatedId?: number
    ) => {
        const newNotification: Notification = {
            id: Date.now(),
            userId,
            title,
            message,
            type,
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedModule,
            relatedId
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        if (!currentUser) return;
        setNotifications(prev => prev.map(n => {
            const isRelevant = n.userId === currentUser.id || n.userId === null;
            return isRelevant ? { ...n, isRead: true } : n;
        }));
    };

    const clearAll = () => {
        if (!currentUser) return;
        setNotifications(prev => prev.filter(n => {
            const isRelevant = n.userId === currentUser.id || n.userId === null;
            return !isRelevant; // Keep only notifications NOT relevant to current user
        }));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications: userNotifications, 
            unreadCount, 
            addNotification, 
            markAsRead, 
            markAllAsRead, 
            clearAll,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
