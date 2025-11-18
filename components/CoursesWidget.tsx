
import React, { useMemo } from 'react';
import { CourseObject, View } from '../types';

interface CoursesWidgetProps {
    courses: CourseObject[];
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

export const CoursesWidget: React.FC<CoursesWidgetProps> = ({ courses, onNavigate }) => {
    
    const activeCourses = useMemo(() => courses.filter(c => c.status === 'active'), [courses]);
    const upcomingCourses = useMemo(() => courses.filter(c => c.status === 'upcoming'), [courses]);
    const completedCourses = useMemo(() => courses.filter(c => c.status === 'completed'), [courses]);

    const stats = useMemo(() => {
        const totalStudents = activeCourses.reduce((sum, c) => sum + c.current_students, 0);
        
        // Available seats only for active courses where enrollment is open
        const availableSeats = activeCourses
            .filter(c => c.enrollment_open)
            .reduce((sum, c) => sum + (c.max_students - c.current_students), 0);

        // Calculate Occupancy Rate: Total Students / (Total Students + Available Seats)
        const totalCapacity = totalStudents + availableSeats;
        const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

        // Courses starting this week (within next 7 days)
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const startingThisWeek = upcomingCourses.filter(c => {
            const startDate = new Date(c.start_date);
            return startDate >= now && startDate <= nextWeek;
        }).length;

        // Full courses
        const fullCourses = activeCourses.filter(c => c.current_students >= c.max_students).length;

        return {
            active: activeCourses.length,
            upcoming: upcomingCourses.length,
            totalStudents,
            availableSeats,
            occupancyRate,
            startingThisWeek,
            fullCourses,
            completed: completedCourses.length
        };
    }, [activeCourses, upcomingCourses, completedCourses]);

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

    return (
        <div className="mt-8 bg-[var(--color-card)] p-6 rounded-lg shadow-md border-t-4 border-[var(--color-primary)]">
             <div className="flex items-center justify-between mb-6 border-b border-[var(--color-border)] pb-4">
                <h2 className="text-2xl font-bold text-[var(--color-primary)]">🎯 لوحة متابعة الدورات</h2>
                <button onClick={() => onNavigate('courses')} className="text-sm text-blue-600 hover:underline font-bold">عرض الكل ⬅</button>
            </div>

            {/* Enhanced Statistics Grid - Matching Prompt Design */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                    <span>📊</span> إحصائيات الدورات التعليمية
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Row 1 */}
                    <StatCard 
                        title="نشطة الآن" 
                        value={`${stats.active} دورة`} 
                        icon="🟢" 
                        theme="green" 
                    />
                    <StatCard 
                        title="قادمة قريباً" 
                        value={`${stats.upcoming} دورة`} 
                        icon="🟡" 
                        theme="orange" 
                    />
                    <StatCard 
                        title="إجمالي الطلاب" 
                        value={`${stats.totalStudents} طالب`} 
                        icon="👥" 
                        theme="blue" 
                    />
                    <StatCard 
                        title="مقاعد متاحة" 
                        value={`${stats.availableSeats} مقعد`} 
                        icon="💺" 
                        theme="purple" 
                    />
                    
                    {/* Row 2 */}
                    <StatCard 
                        title="نسبة الإشغال" 
                        value={`${stats.occupancyRate.toFixed(0)}%`} 
                        icon="📊" 
                        theme="cyan" 
                    />
                     <StatCard 
                        title="دورات مكتملة" 
                        value={`${stats.fullCourses} دورة`} 
                        subtext="لا توجد مقاعد شاغرة"
                        icon="✅" 
                        theme="green" 
                    />
                    <StatCard 
                        title="تبدأ هذا الأسبوع" 
                        value={`${stats.startingThisWeek} دورة`} 
                        icon="🎯" 
                        theme="orange" 
                    />
                    <StatCard 
                        title="دورات منتهية" 
                        value={`${stats.completed} دورة`} 
                        icon="🔴" 
                        theme="red" 
                    />
                </div>
            </div>
            
            {/* Active Courses - Green Theme */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2 border-b border-green-100 pb-2">
                    <span>🟢</span> الدورات النشطة حالياً
                </h3>
                {activeCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCourses.map(course => {
                            const progress = calculateProgress(course);
                            const timeIcon = course.time_slot.includes('صباحي') ? "☀️" : "🌙";
                            
                            return (
                                <div key={course.id} className="bg-[var(--color-card)] p-4 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-green-800 flex items-center gap-2">
                                            <span>📚</span> {course.name}
                                        </h4>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">نشطة</span>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)] mb-1">
                                            <span>⏳ التقدم</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <ProgressBar percentage={progress} />
                                    </div>

                                    <div className="space-y-2 text-sm text-[var(--color-text-base)]">
                                        <p className="flex justify-between items-center">
                                            <span className="text-orange-600 font-semibold">{timeIcon} الوقت:</span>
                                            <span>{course.time_slot}</span>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span className="text-purple-600 font-semibold">👥 الطلاب:</span>
                                            <span>{course.current_students}/{course.max_students}</span>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span className="text-[var(--color-primary)] font-semibold">📅 المتبقي:</span>
                                            <span>{getDaysRemaining(course.end_date)} يوم</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-green-50 rounded-lg border border-green-100 text-green-700">
                        لا توجد دورات نشطة حالياً
                    </div>
                )}
            </div>

            {/* Upcoming Courses - Orange Theme */}
            <div>
                <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2 border-b border-orange-100 pb-2">
                    <span>🟡</span> الدورات القادمة
                </h3>
                {upcomingCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingCourses.map(course => {
                             const daysUntil = getDaysRemaining(course.start_date);
                             const timeIcon = course.time_slot.includes('صباحي') ? "☀️" : "🌙";
                             const statusIcon = course.enrollment_open ? "🔓" : "🔒";

                             return (
                                <div key={course.id} className="bg-[var(--color-card)] p-4 rounded-lg shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-orange-800 flex items-center gap-2">
                                            <span>🎯</span> {course.name}
                                        </h4>
                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">قادمة</span>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-[var(--color-text-base)] mt-3">
                                        <p className="flex justify-between items-center">
                                            <span className="text-[var(--color-primary)] font-semibold">📅 الانطلاق:</span> 
                                            <span dir="ltr" className="font-bold">{course.start_date} ({daysUntil} يوم)</span>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span className="text-orange-600 font-semibold">{timeIcon} الوقت:</span>
                                            <span>{course.time_slot}</span>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span className={`font-bold ${course.enrollment_open ? 'text-green-600' : 'text-red-600'}`}>
                                                {statusIcon} التسجيل:
                                            </span> 
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${course.enrollment_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {course.enrollment_open ? 'مفتوح' : 'مغلق'}
                                            </span>
                                        </p>
                                        <p className="flex justify-between items-center">
                                            <span className="text-purple-600 font-semibold">👥 المسجلين:</span>
                                            <span>{course.current_students}/{course.max_students}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                     <div className="text-center py-6 bg-orange-50 rounded-lg border border-orange-100 text-orange-700">
                        لا توجد دورات قادمة
                    </div>
                )}
            </div>

            {/* Quick Actions - Functional */}
            <div className="mt-8 pt-6 border-t-2 border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">⚡ إجراءات سريعة:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                        onClick={() => onNavigate('students')} 
                        className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                    >
                        <span>📝</span> تسجيل طالب
                    </button>
                    <button 
                        onClick={() => onNavigate('courses')} 
                        className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                    >
                        <span>📅</span> جدول الدورات
                    </button>
                    <button 
                        onClick={() => onNavigate('commissions')} 
                        className="bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                    >
                        <span>👥</span> إدارة التسجيلات
                    </button>
                    <button 
                        onClick={() => onNavigate('dashboard')} 
                        className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                    >
                        <span>↩</span> تحديث
                    </button>
                </div>
            </div>
        </div>
    );
};
