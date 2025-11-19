
import React, { useState, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { NotificationType } from '../types';

export const NotificationsPage: React.FC = () => {
    const { notifications, markAsRead, markAllAsRead, clearAll, addNotification, deleteNotification } = useNotification();
    const { currentUser, users } = useAuth();
    const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
    const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');

    // Form State
    const [newNotif, setNewNotif] = useState({
        title: '',
        message: '',
        type: 'info' as NotificationType,
        targetUserId: 'broadcast', // 'broadcast' or userId
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    // Stats
    const stats = useMemo(() => ({
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        info: notifications.filter(n => n.type === 'info').length,
        success: notifications.filter(n => n.type === 'success').length,
        warning: notifications.filter(n => n.type === 'warning').length,
        danger: notifications.filter(n => n.type === 'danger').length,
    }), [notifications]);

    const filteredNotifications = notifications.filter(n => filterType === 'all' || n.type === filterType);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const target = newNotif.targetUserId === 'broadcast' ? null : parseInt(newNotif.targetUserId);
        
        addNotification(
            newNotif.title,
            newNotif.message,
            newNotif.type,
            target
        );

        setFormStatus('success');
        setTimeout(() => setFormStatus('idle'), 3000);
        setNewNotif({ title: '', message: '', type: 'info', targetUserId: 'broadcast' });
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'danger': return '🚨';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    };

    const getBorderColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'border-green-500';
            case 'warning': return 'border-orange-500';
            case 'danger': return 'border-red-500';
            case 'info': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                        <span>🔔</span> مركز إدارة الإشعارات
                    </h2>
                    <p className="text-[var(--color-text-muted)] mt-1">لوحة التحكم المركزية للتنبيهات والمراسلات</p>
                </div>
                {isAdmin && (
                    <div className="flex bg-[var(--color-card)] rounded-lg p-1 border border-[var(--color-border)]">
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-[var(--color-primary)] text-white shadow' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-background)]'}`}
                        >
                            📋 عرض الإشعارات
                        </button>
                        <button 
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-[var(--color-secondary)] text-white shadow' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-background)]'}`}
                        >
                            ✨ إنشاء إشعار
                        </button>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-[var(--color-card)] p-4 rounded-lg shadow border border-[var(--color-border)] text-center">
                    <span className="block text-2xl font-bold text-[var(--color-primary)]">{stats.total}</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-bold">الكل</span>
                </div>
                <div className="bg-[var(--color-card)] p-4 rounded-lg shadow border border-[var(--color-border)] text-center">
                    <span className="block text-2xl font-bold text-[var(--color-secondary)]">{stats.unread}</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-bold">غير مقروء</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <span className="block text-xl font-bold text-green-600">{stats.success}</span>
                    <span className="text-xs text-green-800 font-bold">نجاح</span>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                    <span className="block text-xl font-bold text-orange-600">{stats.warning}</span>
                    <span className="text-xs text-orange-800 font-bold">تنبيه</span>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                    <span className="block text-xl font-bold text-red-600">{stats.danger}</span>
                    <span className="text-xs text-red-800 font-bold">خطر</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <span className="block text-xl font-bold text-blue-600">{stats.info}</span>
                    <span className="text-xs text-blue-800 font-bold">معلومات</span>
                </div>
            </div>

            {activeTab === 'create' && isAdmin ? (
                <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md border-t-4 border-[var(--color-secondary)] animate-fade-in">
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-6 border-b border-[var(--color-border)] pb-4">
                        📨 إرسال إشعار جديد
                    </h3>
                    
                    {formStatus === 'success' && (
                        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-sm">
                            <p className="font-bold">✅ تم إرسال الإشعار بنجاح!</p>
                        </div>
                    )}

                    <form onSubmit={handleCreateSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-semibold mb-2 text-[var(--color-text-base)]">عنوان الإشعار</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newNotif.title}
                                    onChange={e => setNewNotif({...newNotif, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] bg-[var(--color-background)]"
                                    placeholder="مثال: تذكير هام"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-2 text-[var(--color-text-base)]">نوع الإشعار</label>
                                <select 
                                    value={newNotif.type}
                                    onChange={e => setNewNotif({...newNotif, type: e.target.value as NotificationType})}
                                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] bg-[var(--color-background)]"
                                >
                                    <option value="info">ℹ️ معلومات (أزرق)</option>
                                    <option value="success">✅ نجاح (أخضر)</option>
                                    <option value="warning">⚠️ تنبيه (برتقالي)</option>
                                    <option value="danger">🚨 خطر (أحمر)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2 text-[var(--color-text-base)]">نص الرسالة</label>
                            <textarea 
                                required
                                value={newNotif.message}
                                onChange={e => setNewNotif({...newNotif, message: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] bg-[var(--color-background)]"
                                placeholder="اكتب نص الإشعار هنا..."
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-2 text-[var(--color-text-base)]">المستلم</label>
                            <select 
                                value={newNotif.targetUserId}
                                onChange={e => setNewNotif({...newNotif, targetUserId: e.target.value})}
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] bg-[var(--color-background)]"
                            >
                                <option value="broadcast">📢 إرسال للجميع (Broadcast)</option>
                                <optgroup label="👤 مستخدمين محددين">
                                    {users.map(user => (
                                        <option key={user.id} value={user.id.toString()}>
                                            {user.fullName} ({user.role === 'admin' ? 'مدير' : user.role === 'manager' ? 'مسؤول' : 'مندوب'})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
                            <button 
                                type="submit"
                                className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-8 rounded-lg hover:bg-[var(--color-secondary-hover)] transition shadow-lg flex items-center gap-2"
                            >
                                <span>📤</span> إرسال الإشعار
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    {/* Filters & Actions */}
                    <div className="bg-[var(--color-card)] p-4 rounded-lg shadow-sm border border-[var(--color-border)] flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-2 overflow-x-auto">
                            <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-full text-sm font-bold transition ${filterType === 'all' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'}`}>الكل</button>
                            <button onClick={() => setFilterType('info')} className={`px-3 py-1 rounded-full text-sm font-bold transition ${filterType === 'info' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>معلومات</button>
                            <button onClick={() => setFilterType('success')} className={`px-3 py-1 rounded-full text-sm font-bold transition ${filterType === 'success' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600'}`}>نجاح</button>
                            <button onClick={() => setFilterType('warning')} className={`px-3 py-1 rounded-full text-sm font-bold transition ${filterType === 'warning' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}>تنبيه</button>
                            <button onClick={() => setFilterType('danger')} className={`px-3 py-1 rounded-full text-sm font-bold transition ${filterType === 'danger' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}>خطر</button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={markAllAsRead} className="text-sm font-bold text-green-600 hover:bg-green-50 px-3 py-1 rounded transition">✅ قراءة الكل</button>
                            <button onClick={clearAll} className="text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1 rounded transition">🗑️ مسح الكل</button>
                        </div>
                    </div>

                    {/* List */}
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-16 bg-[var(--color-card)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
                            <span className="text-6xl block mb-4">📭</span>
                            <h3 className="text-xl font-bold text-[var(--color-text-muted)]">لا توجد إشعارات</h3>
                            <p className="text-gray-500">قائمة الإشعارات فارغة حالياً</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`bg-[var(--color-card)] p-5 rounded-lg shadow-sm border-r-4 ${getBorderColor(notification.type)} transition-all hover:shadow-md relative overflow-hidden group`}
                            >
                                {!notification.isRead && (
                                    <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-primary)] opacity-[0.03] pointer-events-none"></div>
                                )}
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="text-3xl p-2 bg-[var(--color-background)] rounded-full h-fit">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold text-lg ${!notification.isRead ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-base)]'}`}>
                                                {notification.title}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {!notification.isRead && (
                                                    <span className="bg-[var(--color-secondary)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">جديد</span>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    title="حذف"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[var(--color-text-base)] mb-3">{notification.message}</p>
                                        
                                        <div className="flex flex-wrap justify-between items-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2 mt-2">
                                            <span className="flex items-center gap-2 bg-[var(--color-background)] px-2 py-1 rounded border border-[var(--color-border)]">
                                                <span>⏰</span> 
                                                <span dir="ltr">{new Date(notification.createdAt).toLocaleString('en-GB')}</span>
                                            </span>
                                            
                                            <div className="flex gap-2">
                                                {notification.relatedModule && (
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                        🔗 {notification.relatedModule}
                                                    </span>
                                                )}
                                                {notification.userId === null && (
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                                                        📢 عام (Broadcast)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {!notification.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notification.id)}
                                        className="absolute bottom-2 left-2 text-xs text-[var(--color-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-2 py-1 rounded"
                                    >
                                        تحديد كمقروء
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
