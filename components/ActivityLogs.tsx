
import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ActivityLog } from '../types';

const actionIcons: Record<string, string> = {
    add: '➕',
    edit: '✏️',
    delete: '🗑️',
    login: '🔐',
    logout: '🚪',
    export: '📤',
    import: '📥',
    backup: '💾',
    restore: '🔄',
    enroll: '📝'
};

const actionLabels: Record<string, string> = {
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    export: 'تصدير',
    import: 'استيراد',
    backup: 'نسخ احتياطي',
    restore: 'استعادة',
    enroll: 'تسجيل طالب'
};

export const ActivityLogs: React.FC = () => {
    const { activityLogs } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('');

    const filteredLogs = useMemo(() => {
        return activityLogs.filter(log => {
            const matchesSearch = 
                log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.target.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesAction = filterAction === '' || log.actionType === filterAction;

            return matchesSearch && matchesAction;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [activityLogs, searchTerm, filterAction]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6">📋 سجل النشاطات</h2>
            <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="بحث في النشاطات..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)] text-[var(--color-text-base)]"
                    />
                    <select 
                        value={filterAction} 
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="md:w-1/4 px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] transition bg-[var(--color-background)] text-[var(--color-text-base)]"
                    >
                        <option value="">كل الإجراءات</option>
                        {Object.keys(actionLabels).map(key => (
                            <option key={key} value={key}>{actionLabels[key]}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-t-lg border border-[var(--color-border)]">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                            <tr>
                                <th className="p-3 font-semibold">النشاط</th>
                                <th className="p-3 font-semibold">المستخدم</th>
                                <th className="p-3 font-semibold">التاريخ</th>
                                <th className="p-3 font-semibold">الهدف</th>
                                <th className="p-3 font-semibold">التفاصيل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={log.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-text-base)] hover:bg-blue-50 transition-colors`}>
                                    <td className="p-3 flex items-center gap-2">
                                        <span>{actionIcons[log.actionType]}</span>
                                        <span>{actionLabels[log.actionType] || log.actionType}</span>
                                    </td>
                                    <td className="p-3 font-semibold text-[var(--color-primary)]">{log.userName}</td>
                                    <td className="p-3 text-sm font-mono" dir="ltr">{new Date(log.timestamp).toLocaleString('en-GB')}</td>
                                    <td className="p-3 text-[var(--color-text-muted)]">{log.target}</td>
                                    <td className="p-3 text-[var(--color-text-base)]">{log.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredLogs.length === 0 && (
                        <div className="text-center p-8 text-[var(--color-text-muted)] bg-[var(--color-card)]">
                            لا توجد نشاطات مطابقة للبحث.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
