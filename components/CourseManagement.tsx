
import React, { useState } from 'react';
import { CourseObject } from '../types';

interface CourseManagementProps {
    courses: CourseObject[];
    onAddCourse: (course: Omit<CourseObject, 'id' | 'current_students'>) => void;
    onUpdateCourse: (id: number, course: Partial<CourseObject>) => void;
    onDeleteCourse: (id: number) => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
                <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:opacity-80 transition-opacity">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const CourseForm: React.FC<{
    initialData?: Partial<CourseObject>;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'عام',
        duration: initialData?.duration || 4,
        price: initialData?.price || 0,
        max_students: initialData?.max_students || 20,
        time_slot: initialData?.time_slot || 'صباحي',
        start_date: initialData?.start_date || '',
        end_date: initialData?.end_date || '',
        status: initialData?.status || 'upcoming',
        enrollment_open: initialData?.enrollment_open ?? true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block font-semibold mb-1 text-[var(--color-text-base)]">🎯 اسم الدورة</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
                <div>
                    <label className="block font-semibold mb-1 text-[var(--color-text-base)]">💰 السعر</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
            </div>

            <div>
                <label className="block font-semibold mb-1 text-[var(--color-text-base)]">📄 وصف الدورة</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block font-semibold mb-1 text-[var(--color-text-base)]">تصنيف</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]">
                        <option value="حاسوب">حاسوب</option>
                        <option value="لغات">لغات</option>
                        <option value="إدارة">إدارة</option>
                        <option value="فني">فني</option>
                        <option value="عام">عام</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold mb-1 text-[var(--color-text-base)]">⏱️ المدة (أسابيع)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
                <div>
                    <label className="block font-semibold mb-1 text-[var(--color-text-base)]">👥 الحد الأقصى</label>
                    <input type="number" name="max_students" value={formData.max_students} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                     <label className="block font-semibold mb-1 text-[var(--color-text-base)]">⏰ وقت الدورة</label>
                     <select name="time_slot" value={formData.time_slot} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]">
                        <option value="صباحي">☀️ صباحي</option>
                        <option value="مسائي">🌙 مسائي</option>
                        <option value="صباحي ومسائي">⏰ صباحي ومسائي</option>
                    </select>
                </div>
                <div>
                     <label className="block font-semibold mb-1 text-[var(--color-text-base)]">📅 تاريخ البدء</label>
                     <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
                <div>
                     <label className="block font-semibold mb-1 text-[var(--color-text-base)]">📅 تاريخ الانتهاء</label>
                     <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]" />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <label className="block font-semibold mb-1 text-[var(--color-text-base)]">حالة الدورة</label>
                     <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-[var(--color-background)] text-[var(--color-text-base)]">
                        <option value="upcoming">🟡 قادمة</option>
                        <option value="active">🟢 نشطة</option>
                        <option value="completed">🔴 منتهية</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" id="enrollment_open" name="enrollment_open" checked={formData.enrollment_open} onChange={handleChange} className="w-5 h-5 text-[var(--color-secondary)]" />
                    <label htmlFor="enrollment_open" className="font-semibold cursor-pointer text-[var(--color-text-base)]">🔓 التسجيل مفتوح</label>
                </div>
             </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-[var(--color-secondary)] text-[var(--color-primary-text)] rounded hover:bg-[var(--color-secondary-hover)] font-bold transition shadow">حفظ الدورة</button>
            </div>
        </form>
    );
};

export const CourseManagement: React.FC<CourseManagementProps> = ({ courses, onAddCourse, onUpdateCourse, onDeleteCourse }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseObject | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredCourses = courses.filter(c => filterStatus === 'all' || c.status === filterStatus);

    const handleCreate = (data: any) => {
        onAddCourse({
            ...data,
            current_students: 0
        });
        setIsAddModalOpen(false);
    };

    const handleUpdate = (data: any) => {
        if (editingCourse) {
            onUpdateCourse(editingCourse.id, data);
            setEditingCourse(null);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟ سيؤثر ذلك على السجلات المرتبطة.')) {
            onDeleteCourse(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                 <div>
                    <h2 className="text-3xl font-bold text-[var(--color-primary)]">🎯 إدارة الدورات والبرامج</h2>
                    <p className="text-[var(--color-text-muted)]">إضافة، تعديل، وإدارة جداول الدورات</p>
                 </div>
                 <button onClick={() => setIsAddModalOpen(true)} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-6 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 flex items-center gap-2 shadow-lg">
                    <span className="text-xl">➕</span>
                    <span>إضافة دورة جديدة</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg border-r-4 border-blue-500">
                    <span className="block text-blue-800 font-bold text-lg">إجمالي الدورات</span>
                    <span className="text-3xl font-bold text-blue-900">{courses.length}</span>
                </div>
                <div className="bg-green-100 p-4 rounded-lg border-r-4 border-green-500">
                    <span className="block text-green-800 font-bold text-lg">دورات نشطة</span>
                    <span className="text-3xl font-bold text-green-900">{courses.filter(c => c.status === 'active').length}</span>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg border-r-4 border-orange-500">
                    <span className="block text-orange-800 font-bold text-lg">التسجيل مفتوح</span>
                    <span className="text-3xl font-bold text-orange-900">{courses.filter(c => c.enrollment_open).length}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['all', 'active', 'upcoming', 'completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${filterStatus === status ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-card)] text-[var(--color-text-base)] border border-[var(--color-border)]'}`}
                    >
                        {status === 'all' ? 'الكل' : status === 'active' ? '🟢 نشطة' : status === 'upcoming' ? '🟡 قادمة' : '🔴 منتهية'}
                    </button>
                ))}
            </div>

            {/* Courses Table */}
            <div className="bg-[var(--color-card)] rounded-lg shadow overflow-hidden border border-[var(--color-border)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                            <tr>
                                <th className="p-4 font-semibold whitespace-nowrap">اسم الدورة</th>
                                <th className="p-4 font-semibold whitespace-nowrap">الوقت & التاريخ</th>
                                <th className="p-4 font-semibold whitespace-nowrap">الطلاب</th>
                                <th className="p-4 font-semibold whitespace-nowrap">الحالة</th>
                                <th className="p-4 font-semibold whitespace-nowrap">التسجيل</th>
                                <th className="p-4 font-semibold whitespace-nowrap">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="border-b border-[var(--color-border)] hover:bg-blue-50 transition-colors text-[var(--color-text-base)]">
                                    <td className="p-4">
                                        <div className="font-bold text-[var(--color-primary)]">{course.name}</div>
                                        <div className="text-xs text-[var(--color-text-muted)]">{course.category} | {course.price} ريال</div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span>📅</span>
                                            <span dir="ltr">{course.start_date}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[var(--color-secondary)] font-semibold">
                                            <span>⏰</span>
                                            <span>{course.time_slot}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (course.current_students / course.max_students) * 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold">{course.current_students}/{course.max_students}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            course.status === 'active' ? 'bg-green-100 text-green-800' :
                                            course.status === 'upcoming' ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {course.status === 'active' ? 'نشطة' : course.status === 'upcoming' ? 'قادمة' : 'منتهية'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                         <button 
                                            onClick={() => onUpdateCourse(course.id, { enrollment_open: !course.enrollment_open })}
                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${
                                                course.enrollment_open ? 'border-green-500 text-green-600 bg-green-50' : 'border-red-500 text-red-600 bg-red-50'
                                            }`}
                                         >
                                            <span>{course.enrollment_open ? '🔓' : '🔒'}</span>
                                            <span>{course.enrollment_open ? 'مفتوح' : 'مغلق'}</span>
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingCourse(course)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition" title="تعديل">✏️</button>
                                            <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition" title="حذف">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCourses.length === 0 && <div className="p-8 text-center text-[var(--color-text-muted)]">لا توجد دورات لعرضها</div>}
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="📝 إضافة دورة جديدة">
                <CourseForm onSubmit={handleCreate} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            <Modal isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} title={`✏️ تعديل: ${editingCourse?.name}`}>
                <CourseForm initialData={editingCourse || {}} onSubmit={handleUpdate} onCancel={() => setEditingCourse(null)} />
            </Modal>
        </div>
    );
};
