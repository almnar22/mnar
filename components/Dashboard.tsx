
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CourseObject, View } from '../types';
import { CoursesWidget } from './CoursesWidget';

interface DashboardStats {
  totalStudents: number;
  pendingCommissions: number;
  paidCommissions: number;
  topDelegate: string;
}

interface DashboardProps {
    stats: DashboardStats;
    courses: CourseObject[];
    onNavigate: (view: View) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; colorClass: string; textClass: string }> = ({ title, value, icon, colorClass, textClass }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border-t-4 ${colorClass} bg-[var(--color-card)]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-[var(--color-text-base)]">{title}</p>
          <p className={`text-3xl font-bold ${textClass} mt-2`}>{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
};

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
    courses: '🎯',
    enroll: '📝'
};

export const Dashboard: React.FC<DashboardProps> = ({ stats, courses, onNavigate }) => {
  const { activityLogs } = useAuth();

  // Get last 5 activities
  const recentActivities = [...activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-2 flex items-center gap-2">
            <span>📊</span> الإحصائيات الحية
        </h2>
        <div className="h-1 w-full bg-[var(--color-border)] rounded"></div>
      </div>
      
      {/* Stats Grid - Matching Python Script Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Green: Students */}
        <StatCard 
            title="الطلاب المسجلين" 
            value={`${stats.totalStudents} طالب`} 
            icon="👥" 
            colorClass="border-green-500" 
            textClass="text-green-600" 
        />
        {/* Orange: Pending */}
        <StatCard 
            title="العمولات المعلقة" 
            value={`${stats.pendingCommissions.toLocaleString()} ريال`} 
            icon="⏳" 
            colorClass="border-orange-500" 
            textClass="text-orange-600" 
        />
        {/* Green: Paid */}
        <StatCard 
            title="العمولات المدفوعة" 
            value={`${stats.paidCommissions.toLocaleString()} ريال`} 
            icon="✅" 
            colorClass="border-green-600" 
            textClass="text-green-700" 
        />
        {/* Purple: Top Rep */}
        <StatCard 
            title="أفضل المندوبين" 
            value={stats.topDelegate} 
            icon="🏆" 
            colorClass="border-purple-500" 
            textClass="text-purple-600" 
        />
      </div>
      
      {/* Courses Widget */}
      <CoursesWidget courses={courses} onNavigate={onNavigate} />

      <div className="mt-8">
        {/* Recent Activity */}
        <div className="p-6 bg-[var(--color-card)] rounded-lg shadow-md border-t-4 border-[var(--color-primary)]">
             <div className="flex justify-between items-center mb-4 border-b border-[var(--color-border)] pb-2">
                <h3 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                    <span>📋</span> سجل النشاطات
                </h3>
                <button onClick={() => onNavigate('activity-logs')} className="text-sm text-blue-600 hover:underline font-bold">عرض الكل ⬅</button>
            </div>
            <div className="space-y-2">
                {recentActivities.length > 0 ? (
                    recentActivities.map(log => (
                        <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] hover:bg-gray-50 transition-colors">
                            <span className="text-xl" role="img" aria-label={log.actionType}>{actionIcons[log.actionType] || '📝'}</span>
                            <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                                <p className="text-sm font-bold text-[var(--color-text-base)]">
                                    <span className="text-[var(--color-primary)]">{log.userName}</span>: {log.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-mono" dir="ltr">
                                   <span>{new Date(log.timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</span>
                                   <span>|</span>
                                   <span>{new Date(log.timestamp).toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>
                             <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800 hidden md:inline-block">
                                {log.actionType}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-[var(--color-text-muted)] py-4">لا توجد نشاطات حديثة</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
