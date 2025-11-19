
import React, { useMemo } from 'react';
import { CourseObject, View, Student, Commission, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CoursesWidgetProps {
    courses: CourseObject[];
    students: Student[];
    commissions: Commission[];
    onNavigate: (view: View) => void;
}

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
    let colorClass = 'bg-green-500';
    if (percentage < 30) colorClass = 'bg-red-500';
    else if (percentage < 70) colorClass = 'bg-orange-500';

    return (
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
            <div className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    icon: string;
    gradient: string;
    textColor: string;
}> = ({ title, value, subtext, icon, gradient, textColor }) => {
    return (
        <div className={`bg-gradient-to-br ${gradient} p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--color-border)]/50`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold opacity-70 mb-1 uppercase tracking-wider">{title}</p>
                    <p className={`text-2xl font-extrabold ${textColor}`}>{value}</p>
                    {subtext && <p className="text-xs mt-1 font-medium opacity-75">{subtext}</p>}
                </div>
                <div className="text-3xl opacity-80 bg-white/40 p-2 rounded-lg">{icon}</div>
            </div>
        </div>
    );
};

export const CoursesWidget: React.FC<CoursesWidgetProps> = ({ courses, students, commissions, onNavigate }) => {
    const { currentUser } = useAuth();
    
    const activeCourses = useMemo(() => courses.filter(c => c.status === 'active'), [courses]);
    const upcomingCourses = useMemo(() => courses.filter(c => c.status === 'upcoming'), [courses]);
    const completedCourses = useMemo(() => courses.filter(c => c.status === 'completed'), [courses]);

    const calculateProgress = (course: CourseObject) => {
        if (course.status === 'upcoming') return 0;
        if (course.status === 'completed') return 100;
        
        const start = new Date(course.start_date).getTime();
        const end = new Date(course.end_date).getTime();
        const now = new Date().getTime();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const total = end - start;
        const current = now - start;
        return total === 0 ? 0 : Math.min(100, Math.max(0, Math.round((current / total) * 100)));
    };

    const getDaysRemaining = (dateStr: string) => {
        const target = new Date(dateStr);
        const today = new Date();
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    }
    
    const getDaysUntilStart = (dateStr: string) => {
        const target = new Date(dateStr);
        const today = new Date();
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // --- ADMIN VIEW ---
    const renderAdminView = () => {
        const totalStudents = activeCourses.reduce((sum, c) => sum + c.current_students, 0);
        
        return (
            <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                 <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/30">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                        🎯 متابعة الدورات - الإدارة
                    </h2>
                    <button onClick={() => onNavigate('courses')} className="text-sm text-blue-600 hover:underline font-bold">عرض الكل</button>
                </div>

                <div className="p-6">
                    {/* Admin Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard title="نشطة الآن" value={`${activeCourses.length}`} icon="🟢" gradient="from-green-50 to-emerald-50" textColor="text-green-700" />
                        <StatCard title="قادمة قريباً" value={`${upcomingCourses.length}`} icon="🟡" gradient="from-orange-50 to-amber-50" textColor="text-orange-700" />
                        <StatCard title="منتهية" value={`${completedCourses.length}`} icon="🔵" gradient="from-blue-50 to-cyan-50" textColor="text-blue-700" />
                        <StatCard title="إجمالي الطلاب" value={`${totalStudents}`} icon="👥" gradient="from-purple-50 to-fuchsia-50" textColor="text-purple-700" />
                    </div>

                    {/* Active Courses List */}
                    {activeCourses.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4 flex items-center gap-2">
                                <span className="bg-green-100 text-green-600 p-1 rounded">🟢</span> جميع الدورات النشطة
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {activeCourses.slice(0, 4).map(course => {
                                    const progress = calculateProgress(course);
                                    const timeIcon = course.time_slot?.includes('صباحي') ? "☀️" : "🌙";
                                    const remainingDays = Math.max(0, getDaysRemaining(course.end_date));

                                    return (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-green-300 group">
                                            {/* Header */}
                                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                    📚 {course.name}
                                                </h4>
                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">نشطة</span>
                                            </div>
                                            
                                            {/* Body */}
                                            <div className="p-5 space-y-4">
                                                {/* Progress */}
                                                <div>
                                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                                        <span>التقدم</span>
                                                        <span className="text-blue-600">{progress}%</span>
                                                    </div>
                                                    <ProgressBar percentage={progress} />
                                                </div>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg">{timeIcon}</span>
                                                        <span className="font-medium text-gray-600">{course.time_slot}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-500 bg-purple-50 p-1.5 rounded-lg">👥</span>
                                                        <span className="font-medium text-gray-600">{course.current_students}/{course.max_students}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-cyan-500 bg-cyan-50 p-1.5 rounded-lg">📅</span>
                                                        <span className="font-medium text-gray-600">{remainingDays} يوم متبقي</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Footer Button */}
                                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center opacity-90 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onNavigate('students')}
                                                    className="w-full py-2 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100 transition-colors"
                                                >
                                                    تسجيل طالب جديد +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Courses List */}
                    {upcomingCourses.length > 0 && (
                        <div>
                             <h3 className="text-lg font-bold text-[var(--color-text-base)] mb-4 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-600 p-1 rounded">🟡</span> الدورات القادمة
                             </h3>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {upcomingCourses.slice(0, 4).map(course => {
                                    const timeIcon = course.time_slot?.includes('صباحي') ? "☀️" : "🌙";
                                    const daysUntil = getDaysUntilStart(course.start_date);
                                    const seatsLeft = course.max_students - course.current_students;
                                    
                                    return (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-orange-300 group">
                                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                    🎯 {course.name}
                                                </h4>
                                                 <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">قريباً</span>
                                            </div>
                                            
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <span className="text-xl">📅</span>
                                                    <div>
                                                        <p className="text-xs text-blue-600 font-bold uppercase">موعد الانطلاق</p>
                                                        <p className="font-bold text-blue-900">بعد {daysUntil} يوم <span className="text-xs font-normal opacity-70">({course.start_date})</span></p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between text-sm text-gray-600 px-2">
                                                    <span className="flex items-center gap-1">
                                                        {timeIcon} {course.time_slot}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-medium">
                                                         💺 {seatsLeft} مقعد متبقي
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center opacity-90 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onNavigate('students')}
                                                    className="w-full py-2 rounded-lg text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                                                >
                                                    حجز مقاعد مبكر
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    )}

                    {/* Admin Quick Actions */}
                    <div className="mt-8 pt-6 border-t border-dashed border-[var(--color-border)]">
                        <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">⚡ إجراءات سريعة</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <button onClick={() => onNavigate('courses')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">📝 إنشاء دورة</button>
                            <button onClick={() => onNavigate('courses')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">📅 الجدول الدراسي</button>
                            <button onClick={() => onNavigate('reports')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">👥 الإحصائيات</button>
                            <button onClick={() => onNavigate('reports')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">📊 التقارير</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- MANAGER VIEW ---
    const renderManagerView = () => {
        const enrollmentOpenCount = [...activeCourses, ...upcomingCourses].filter(c => c.enrollment_open).length;
        
        const availableSeats = [...activeCourses, ...upcomingCourses]
            .filter(c => c.enrollment_open)
            .reduce((sum, c) => sum + (c.max_students - c.current_students), 0);
            
        const totalSeats = [...activeCourses, ...upcomingCourses]
            .filter(c => c.enrollment_open)
            .reduce((sum, c) => sum + c.max_students, 0);

        const occupancyRate = totalSeats > 0 ? ((totalSeats - availableSeats) / totalSeats * 100).toFixed(0) : '0';
        
        const coursesNeedingAttention = activeCourses.filter(c => c.enrollment_open && (c.max_students - c.current_students) <= 3);

        return (
            <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/30">
                    <h2 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                        🎯 متابعة التسجيلات
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                         <StatCard title="دورات قيد التسجيل" value={`${enrollmentOpenCount}`} icon="👥" gradient="from-green-50 to-teal-50" textColor="text-green-700" />
                         <StatCard title="مقاعد شاغرة" value={`${availableSeats}`} icon="🎯" gradient="from-orange-50 to-amber-50" textColor="text-orange-700" />
                         <StatCard title="نسبة الإشغال" value={`${occupancyRate}%`} icon="📊" gradient="from-purple-50 to-indigo-50" textColor="text-purple-700" />
                    </div>

                    {coursesNeedingAttention.length > 0 && (
                        <div className="mb-8 bg-red-50 rounded-xl p-5 border border-red-100">
                            <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                                ⚠️ دورات قاربت على الامتلاء
                            </h3>
                            <div className="space-y-2">
                                {coursesNeedingAttention.map(course => (
                                    <div key={course.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                                        <span className="font-bold text-gray-800">📚 {course.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-gray-600">{course.current_students}/{course.max_students}</span>
                                            <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full shadow-sm">باقي {course.max_students - course.current_students}</span>
                                        </div>
                                        <button onClick={() => onNavigate('students')} className="text-xs text-blue-600 font-bold hover:underline">سجل الآن</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-dashed border-[var(--color-border)]">
                        <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">⚡ إجراءات تسجيل سريعة</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <button onClick={() => onNavigate('students')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">📝 تسجيل طالب</button>
                            <button onClick={() => onNavigate('commissions')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">👥 إدارة التسجيلات</button>
                            <button onClick={() => onNavigate('courses')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">🎫 حالة التسجيل</button>
                            <button onClick={() => onNavigate('reports')} className="bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition flex items-center justify-center gap-2 text-sm font-bold shadow-sm">📋 كشف الأسماء</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!currentUser) return null;

    if (currentUser.role === 'admin') {
        return renderAdminView();
    } else if (currentUser.role === 'manager') {
        return renderManagerView();
    }
    // Delegates have their own dashboard
    return null;
};
