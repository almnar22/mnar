
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
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtext?: string;
    icon: string;
    theme: 'green' | 'orange' | 'blue' | 'purple' | 'cyan' | 'red';
}> = ({ title, value, subtext, icon, theme }) => {
    const themes = {
        green: 'bg-green-50 text-green-800 border-green-500',
        orange: 'bg-orange-50 text-orange-800 border-orange-500',
        blue: 'bg-blue-50 text-blue-800 border-blue-500',
        purple: 'bg-purple-50 text-purple-800 border-purple-500',
        cyan: 'bg-cyan-50 text-cyan-800 border-cyan-500',
        red: 'bg-red-50 text-red-800 border-red-500',
    };

    const borderClass = `border-t-4 shadow-sm rounded-lg p-4 transition-transform hover:scale-[1.02] duration-200`;

    return (
        <div className={`${themes[theme]} ${borderClass}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-bold opacity-80 mb-1">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {subtext && <p className="text-xs mt-1 font-semibold opacity-75">{subtext}</p>}
                </div>
                <div className="text-2xl opacity-80">{icon}</div>
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
            <div className="mt-8 bg-[var(--color-card)] p-6 rounded-lg shadow-md border-t-4 border-[var(--color-primary)]">
                <div className="flex items-center justify-between mb-6 border-b border-[var(--color-border)] pb-4">
                    <h2 className="text-2xl font-bold text-[var(--color-primary)]">🎯 لوحة متابعة الدورات - الإدارة</h2>
                    <button onClick={() => onNavigate('courses')} className="text-sm text-blue-600 hover:underline font-bold">عرض الكل ⬅</button>
                </div>

                {/* Admin Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="نشطة الآن" value={`${activeCourses.length} دورة`} icon="🟢" theme="green" />
                    <StatCard title="قادمة قريباً" value={`${upcomingCourses.length} دورة`} icon="🟡" theme="orange" />
                    <StatCard title="منتهية" value={`${completedCourses.length} دورة`} icon="🔵" theme="blue" />
                    <StatCard title="إجمالي الطلاب" value={`${totalStudents} طالب`} icon="👥" theme="purple" />
                </div>

                {/* Active Courses List */}
                {activeCourses.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                            <span>🟢</span> جميع الدورات النشطة
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeCourses.slice(0, 4).map(course => {
                                const progress = calculateProgress(course);
                                const timeIcon = course.time_slot?.includes('صباحي') ? "☀️" : "🌙";
                                const remainingDays = Math.max(0, getDaysRemaining(course.end_date));

                                return (
                                    <div key={course.id} className="bg-[var(--color-card)] rounded-lg shadow-md border-t-4 border-green-500 overflow-hidden transition-transform hover:scale-[1.01]">
                                        {/* Header */}
                                        <div className="p-4 border-b border-gray-100 bg-green-50/50">
                                            <h4 className="font-bold text-lg text-green-800 flex items-center gap-2">
                                                <span>📚</span> {course.name}
                                            </h4>
                                        </div>
                                        
                                        {/* Body */}
                                        <div className="p-5 space-y-4">
                                            {/* Progress */}
                                            <div>
                                                <div className="flex justify-between text-sm font-bold text-blue-700 mb-1">
                                                    <span>⏳ التقدم:</span>
                                                    <span>{progress}% مكتمل</span>
                                                </div>
                                                <ProgressBar percentage={progress} />
                                            </div>

                                            {/* Details Row */}
                                            <div className="flex flex-wrap justify-between items-center text-sm gap-2">
                                                <span className="flex items-center gap-2 text-orange-700 font-semibold bg-orange-50 px-3 py-1 rounded-full">
                                                    <span>{timeIcon}</span> {course.time_slot}
                                                </span>
                                                <span className="flex items-center gap-2 text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full">
                                                    <span>👥</span> {course.current_students}/{course.max_students}
                                                </span>
                                            </div>
                                             <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3 mt-2">
                                                <span className="text-cyan-700 font-bold flex items-center gap-1">
                                                    <span>📅</span> {remainingDays} يوم متبقي
                                                </span>
                                                <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                                    <span>✅</span> نشطة - مقاعد متاحة
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Footer Button */}
                                        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                                            <button 
                                                onClick={() => onNavigate('students')}
                                                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <span>🎯</span> [سجل الآن] - انضم إلى الدورة
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
                    <div className="mb-8">
                         <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                            <span>🟡</span> الدورات القادمة
                         </h3>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {upcomingCourses.slice(0, 4).map(course => {
                                const timeIcon = course.time_slot?.includes('صباحي') ? "☀️" : "🌙";
                                const daysUntil = getDaysUntilStart(course.start_date);
                                const seatsLeft = course.max_students - course.current_students;
                                const statusColor = course.enrollment_open ? "text-green-600" : "text-red-600";
                                const statusBg = course.enrollment_open ? "bg-green-100" : "bg-red-100";
                                const statusIcon = course.enrollment_open ? "🔓" : "🔒";
                                
                                return (
                                    <div key={course.id} className="bg-[var(--color-card)] rounded-lg shadow-md border-t-4 border-orange-500 overflow-hidden transition-transform hover:scale-[1.01]">
                                        {/* Header */}
                                        <div className="p-4 border-b border-gray-100 bg-orange-50/50">
                                            <h4 className="font-bold text-lg text-orange-800 flex items-center gap-2">
                                                <span>🎯</span> {course.name}
                                            </h4>
                                        </div>
                                        
                                        {/* Body */}
                                        <div className="p-5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-blue-700 font-semibold flex items-center gap-1">
                                                    <span>📅</span> ينطلق بعد {daysUntil} يوم
                                                </span>
                                                <span className="text-cyan-700 text-sm font-mono" dir="ltr">التاريخ: {course.start_date}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-orange-700 font-semibold flex items-center gap-1">
                                                    <span>{timeIcon}</span> {course.time_slot}
                                                </span>
                                                <span className="text-purple-700 font-semibold flex items-center gap-1">
                                                     <span>💺</span> {seatsLeft} مقعد متبقي
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <span className={`font-bold flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusColor} ${statusBg}`}>
                                                    {statusIcon} التسجيل: {course.enrollment_open ? 'مفتوح' : 'مغلق'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Footer Button */}
                                        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                                            {course.enrollment_open ? (
                                                <button 
                                                    onClick={() => onNavigate('students')}
                                                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                                >
                                                    <span>🎯</span> [احجز مقعدك] - سجل قبل انتهاء المقاعد
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled
                                                    className="w-full bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <span>⏸️</span> [التسجيل مغلق] - انتظر الدفعة القادمة
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                )}

                {/* Admin Quick Actions */}
                <div className="mt-8 pt-6 border-t-2 border-[var(--color-border)]">
                    <h3 className="text-lg font-bold text-purple-700 mb-4">⚡ إجراءات إدارية سريعة:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => onNavigate('courses')} className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">📝 إنشاء دورة جديدة</button>
                        <button onClick={() => onNavigate('courses')} className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">📅 إدارة جدول الدورات</button>
                        <button onClick={() => onNavigate('reports')} className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">👥 إحصاءات التسجيلات</button>
                        <button onClick={() => onNavigate('reports')} className="bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">📊 تقرير الأداء الشامل</button>
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
            <div className="mt-8 bg-[var(--color-card)] p-6 rounded-lg shadow-md border-t-4 border-[var(--color-primary)]">
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 pb-4 border-b border-[var(--color-border)]">🎯 متابعة الدورات - التسجيلات</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                     <StatCard title="دورات قيد التسجيل" value={`${enrollmentOpenCount} دورة`} icon="👥" theme="green" />
                     <StatCard title="مقاعد شاغرة" value={`${availableSeats} مقعد`} icon="🎯" theme="orange" />
                     <StatCard title="نسبة الإشغال" value={`${occupancyRate}%`} icon="📊" theme="purple" />
                </div>

                {coursesNeedingAttention.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-red-600 mb-4">⚠️ دورات تحتاج متابعة:</h3>
                        <div className="space-y-3">
                            {coursesNeedingAttention.map(course => (
                                <div key={course.id} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                                    <span className="font-bold text-red-800">📚 {course.name}</span>
                                    <span className="font-bold text-gray-700">👥 {course.current_students}/{course.max_students}</span>
                                    <span className="text-sm font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">مقاعد قليلة!</span>
                                    <button onClick={() => onNavigate('students')} className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">سجل الآن</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t-2 border-[var(--color-border)]">
                    <h3 className="text-lg font-bold text-green-700 mb-4">⚡ إجراءات تسجيل سريعة:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => onNavigate('students')} className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">📝 تسجيل طالب في دورة</button>
                        <button onClick={() => onNavigate('commissions')} className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">👥 إدارة تسجيلات دورة</button>
                        <button onClick={() => onNavigate('courses')} className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">🎫 فتح/غلق التسجيل</button>
                        <button onClick={() => onNavigate('reports')} className="bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md">📋 كشف التسجيلات</button>
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
