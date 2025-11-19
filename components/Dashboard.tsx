
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CourseObject, View, Student, Commission } from '../types';
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
    students: Student[];
    commissions: Commission[];
    onNavigate: (view: View) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; gradient: string; textColor: string }> = ({ title, value, icon, gradient, textColor }) => {
  return (
    <div className={`p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group bg-gradient-to-br ${gradient} border border-[var(--color-border)]/50`}>
       {/* Decorative background icon */}
       <div className="absolute -bottom-6 -left-6 text-9xl opacity-5 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
           {icon}
       </div>
       
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-bold opacity-80 mb-1 text-[var(--color-text-muted)] uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-extrabold ${textColor} mt-1 tracking-tight`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm text-2xl`}>
            {icon}
        </div>
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

export const Dashboard: React.FC<DashboardProps> = ({ stats, courses, students, commissions, onNavigate }) => {
  const { activityLogs } = useAuth();

  // Get last 5 activities
  const recentActivities = [...activityLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <span className="bg-[var(--color-primary-light)] p-2 rounded-lg text-2xl">📊</span> 
                الإحصائيات الحية
            </h2>
            <span className="text-sm text-[var(--color-text-muted)] bg-[var(--color-background)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                آخر تحديث: {new Date().toLocaleTimeString()}
            </span>
        </div>
      
        {/* Stats Grid - Modernized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Students */}
            <StatCard 
                title="الطلاب المسجلين" 
                value={stats.totalStudents} 
                icon="👥" 
                gradient="from-emerald-50 to-teal-50" 
                textColor="text-emerald-700" 
            />
            {/* Pending */}
            <StatCard 
                title="العمولات المعلقة" 
                value={`${stats.pendingCommissions.toLocaleString()}`} 
                icon="⏳" 
                gradient="from-amber-50 to-orange-50" 
                textColor="text-amber-700" 
            />
            {/* Paid */}
            <StatCard 
                title="العمولات المدفوعة" 
                value={`${stats.paidCommissions.toLocaleString()}`} 
                icon="💰" 
                gradient="from-blue-50 to-indigo-50" 
                textColor="text-blue-700" 
            />
            {/* Top Rep */}
            <StatCard 
                title="أفضل المندوبين" 
                value={stats.topDelegate} 
                icon="🏆" 
                gradient="from-purple-50 to-fuchsia-50" 
                textColor="text-purple-700" 
            />
        </div>
      </div>
      
      {/* Courses Widget */}
      <CoursesWidget 
        courses={courses} 
        students={students} 
        commissions={commissions} 
        onNavigate={onNavigate} 
      />

      <div>
        {/* Recent Activity */}
        <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
             <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                <h3 className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-2">
                    <span>📋</span> سجل النشاطات الأخير
                </h3>
                <button onClick={() => onNavigate('activity-logs')} className="text-sm text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center gap-1">
                    عرض الكل
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
                </button>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
                {recentActivities.length > 0 ? (
                    recentActivities.map(log => (
                        <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-[var(--color-background)] transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)]/30 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                {actionIcons[log.actionType] || '📝'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[var(--color-text-base)] truncate">
                                    <span className="font-bold text-[var(--color-primary)]">{log.userName}</span> قام بـ {log.description}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                    {new Date(log.timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})} · {new Date(log.timestamp).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                             <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 uppercase tracking-wide hidden sm:inline-block">
                                {log.actionType}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-[var(--color-text-muted)] py-8">
                        <p className="text-4xl mb-2 opacity-20">📝</p>
                        <p>لا توجد نشاطات حديثة</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
