
import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationType } from '../types';

export const NotificationsWidget: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'danger': return '🚨';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'danger': return 'bg-red-50 border-red-200 text-red-800';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-background)]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 mt-3 w-80 md:w-96 bg-[var(--color-card)] rounded-lg shadow-xl border border-[var(--color-border)] z-50 overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                        <h3 className="font-bold">🔔 الإشعارات الذكية</h3>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{unreadCount} غير مقروء</span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-[var(--color-text-muted)]">
                                <p className="text-4xl mb-2">✨</p>
                                <p>لا توجد إشعارات جديدة</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--color-border)]">
                                {notifications.slice(0, 5).map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-[var(--color-background)] transition-colors cursor-pointer ${!notification.isRead ? 'bg-[var(--color-primary-light)]/10' : ''}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-2xl">{getIcon(notification.type)}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-bold mb-1 ${!notification.isRead ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-base)]'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-[var(--color-secondary)]"></span>}
                                                </div>
                                                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-1">{notification.message}</p>
                                                <span className="text-[10px] text-[var(--color-text-muted)] font-mono opacity-70">
                                                    {new Date(notification.createdAt).toLocaleString('en-GB')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-background)] flex justify-between gap-2">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                onNavigate('notifications');
                            }}
                            className="flex-1 text-xs font-bold py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded transition-colors"
                        >
                            📋 عرض الكل
                        </button>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="flex-1 text-xs font-bold py-2 text-[var(--color-success-text)] hover:bg-[var(--color-success-light)] rounded transition-colors"
                            >
                                ✅ تعيين الكل كمقروء
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
