
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Course, Schedule, Delegate, Student, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Make sure SheetJS is loaded from index.html
declare const XLSX: any;


/**
 * Normalizes an Arabic string for comparison purposes.
 * - Replaces different forms of Alef with a standard Alef.
 * - Replaces Taa Marbuta with Haa.
 * - Removes Arabic diacritics (tashkeel).
 * - Collapses multiple whitespace characters into a single space and trims.
 */
const normalizeArabic = (str: string): string => {
    if (!str) return '';
    return str
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
};


const Notification: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const baseClasses = "p-4 rounded-md text-[var(--color-primary-text)] font-bold mb-4 flex items-center gap-2 whitespace-pre-wrap";
    const typeClasses = {
        success: "bg-[var(--color-secondary)]",
        error: "bg-[var(--color-primary)]"
    };
    const icon = type === 'success' ? '✅ 🔶' : '❌ 🔷';
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{icon} {message}</div>;
}

type SortableKeys = keyof Student | 'fullName' | 'delegateName';
type SortDirection = 'ascending' | 'descending';

interface RegistrationFormProps {
    delegates: Delegate[];
    students: Student[];
    onAddStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
    onRegistrationSuccess: () => void;
    delegateLockId?: number; // New prop to lock the delegate
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ delegates, students, onAddStudent, onRegistrationSuccess, delegateLockId }) => {
    const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
    const activeDelegates = delegates.filter(d => d.isActive);

    // Memoized map of normalized full names to student objects for efficient duplicate checking.
    const existingStudentMap = useMemo(() => {
        const nameMap = new Map<string, Student>();
        students.forEach(student => {
            const fullName = `${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`;
            const normalized = normalizeArabic(fullName);
            if (!nameMap.has(normalized)) {
                nameMap.set(normalized, student);
            }
        });
        return nameMap;
    }, [students]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const newStudentData = {
          firstName: formData.get('firstName') as string,
          secondName: formData.get('secondName') as string,
          thirdName: formData.get('thirdName') as string,
          lastName: formData.get('lastName') as string,
          phone: formData.get('phone') as string,
          course: formData.get('course') as Course,
          schedule: formData.get('schedule') as Schedule,
          delegateId: delegateLockId || parseInt(formData.get('delegateId') as string, 10),
        };

        if(!newStudentData.delegateId) {
            setNotification({ message: 'الرجاء اختيار مندوب!', type: 'error' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        // Duplicate check using normalized names
        const newFullName = `${newStudentData.firstName} ${newStudentData.secondName} ${newStudentData.thirdName} ${newStudentData.lastName}`;
        const normalizedNewName = normalizeArabic(newFullName);
        
        if (existingStudentMap.has(normalizedNewName)) {
            const duplicateStudent = existingStudentMap.get(normalizedNewName)!;
            const duplicateFullName = `${duplicateStudent.firstName} ${duplicateStudent.secondName} ${duplicateStudent.thirdName} ${duplicateStudent.lastName}`;

            const errorMessage = `❌ 🔷 خطأ! الطالب مسجل مسبقاً\n──────────────────────────────────\nالاسم الرباعي: ${duplicateFullName}\nرقم الهاتف المسجل: ${duplicateStudent.phone}\nتاريخ التسجيل: ${duplicateStudent.registrationDate}`;
            setNotification({ message: errorMessage, type: 'error' });
            setTimeout(() => setNotification(null), 7000); // Longer timeout for detailed info
            return;
        }


        onAddStudent(newStudentData);
        
        setNotification({ message: 'تم تسجيل الطالب بنجاح!', type: 'success' });
        setTimeout(() => {
            setNotification(null);
            onRegistrationSuccess();
        }, 2000);

        (e.target as HTMLFormElement).reset();
    };

    return (
        <div>
            {notification && <Notification message={notification.message} type={notification.type} />}
            <form onSubmit={handleSubmit} className="bg-[var(--color-card)] p-8 rounded-lg shadow-md space-y-8 border-t-4 border-[var(--color-secondary)]">
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] border-b-2 border-[var(--color-primary-light)] pb-2 mb-4">🔷 البيانات الشخصية للطالب:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InputField label="الاسم الأول" id="firstName" />
                        <InputField label="الاسم الثاني" id="secondName" />
                        <InputField label="الاسم الثالث" id="thirdName" />
                        <InputField label="اللقب" id="lastName" />
                        <InputField label="رقم الهاتف" id="phone" type="tel" className="md:col-span-2 lg:col-span-4" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary-light)] pb-2 mb-4">🔶 اختر الدورة:</h3>
                    <SelectField id="course" options={Object.values(Course).map(c => ({ value: c, label: c }))} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] border-b-2 border-[var(--color-primary-light)] pb-2 mb-4">🔷 اختر وقت الدوام:</h3>
                    <SelectField id="schedule" options={Object.values(Schedule).map(s => ({ value: s, label: s }))} />
                </div>
                {!delegateLockId && (
                <div>
                    <h3 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary-light)] pb-2 mb-4">🔶 اختر المندوب:</h3>
                    <SelectField id="delegateId" options={activeDelegates.map(d => ({ value: d.id.toString(), label: `${d.fullName} - ${d.phone}` }))} />
                </div>
                )}
                <div className="text-center pt-4">
                    <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-12 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 text-lg shadow-lg">
                        تأكيد التسجيل
                    </button>
                </div>
            </form>
        </div>
    );
};

const EditStudentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    delegates: Delegate[];
    onSave: (studentId: number, data: Partial<Omit<Student, 'id'>>) => void;
}> = ({ isOpen, onClose, student, delegates, onSave }) => {
    const [formData, setFormData] = useState(student);

    useEffect(() => {
        setFormData(student);
    }, [student]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, ...updatedData } = formData;
        onSave(id, {
            ...updatedData,
            delegateId: Number(updatedData.delegateId)
        });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-[var(--color-card)] rounded-lg shadow-xl w-full max-w-2xl my-8">
                 <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-4 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-xl font-bold">تعديل بيانات الطالب: {student.firstName}</h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:opacity-80 transition-opacity">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField value={formData.firstName} onChange={handleChange} label="الاسم الأول" id="firstName" />
                        <InputField value={formData.secondName} onChange={handleChange} label="الاسم الثاني" id="secondName" />
                        <InputField value={formData.thirdName} onChange={handleChange} label="الاسم الثالث" id="thirdName" />
                        <InputField value={formData.lastName} onChange={handleChange} label="اللقب" id="lastName" />
                        <InputField value={formData.phone} onChange={handleChange} label="رقم الهاتف" id="phone" type="tel" className="md:col-span-2" />
                    </div>
                     <SelectField value={formData.course} onChange={handleChange} id="course" label="الدورة" options={Object.values(Course).map(c => ({ value: c, label: c }))} />
                     <SelectField value={formData.schedule} onChange={handleChange} id="schedule" label="وقت الدوام" options={Object.values(Schedule).map(s => ({ value: s, label: s }))} />
                     <SelectField value={String(formData.delegateId)} onChange={handleChange} id="delegateId" label="المندوب" options={delegates.map(d => ({ value: d.id.toString(), label: d.fullName }))} />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-[var(--color-border)] text-[var(--color-text-base)] font-bold py-2 px-6 rounded-lg hover:brightness-95 transition-all">إلغاء</button>
                        <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-6 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors">حفظ التعديلات</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const StudentLog: React.FC<{ 
    students: Student[], 
    delegates: Delegate[],
    onAddStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
    onEditStudent: (studentId: number, data: Partial<Omit<Student, 'id'>>) => void;
    onDeleteStudent: (studentId: number) => void;
}> = ({ students, delegates, onAddStudent, onEditStudent, onDeleteStudent }) => {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDelegate, setFilterDelegate] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: SortDirection }>({ key: 'registrationDate', direction: 'descending' });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const delegateMap = useMemo(() => new Map(delegates.map(d => [d.id, d.fullName])), [delegates]);
    const delegateNameMap = useMemo(() => new Map(delegates.map(d => [normalizeArabic(d.fullName.toLowerCase()), d.id])), [delegates]);
    
    const existingStudentMap = useMemo(() => {
        const nameMap = new Map<string, Student>();
        students.forEach(student => {
            const fullName = `${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`;
            const normalized = normalizeArabic(fullName);
            if (!nameMap.has(normalized)) {
                nameMap.set(normalized, student);
            }
        });
        return nameMap;
    }, [students]);

    const getDelegateName = (id: number) => delegateMap.get(id) || 'غير معروف';

    const sortedAndFilteredStudents = useMemo(() => {
        let filteredStudents = students;

        if (filterDelegate) {
            filteredStudents = filteredStudents.filter(s => s.delegateId === parseInt(filterDelegate));
        }

        if (searchTerm.trim() !== '') {
            filteredStudents = filteredStudents.filter(s =>
                `${s.firstName} ${s.secondName} ${s.thirdName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone.includes(searchTerm)
            );
        }

        return [...filteredStudents].sort((a, b) => {
            const { key, direction } = sortConfig;
            let aValue: any;
            let bValue: any;

            if (key === 'fullName') {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            } else if (key === 'delegateName') {
                aValue = getDelegateName(a.delegateId);
                bValue = getDelegateName(b.delegateId);
            } else {
                aValue = a[key as keyof Student];
                bValue = b[key as keyof Student];
            }

            if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [students, searchTerm, filterDelegate, sortConfig, delegateMap]);

    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        const dataForExport = sortedAndFilteredStudents.map(s => ({
            'الرقم': s.id,
            'الاسم الأول': s.firstName,
            'الاسم الثاني': s.secondName,
            'الاسم الثالث': s.thirdName,
            'اللقب': s.lastName,
            'الاسم الرباعي': `${s.firstName} ${s.secondName} ${s.thirdName} ${s.lastName}`,
            'الهاتف': s.phone,
            'الدورة': s.course,
            'وقت الدوام': s.schedule,
            'المندوب': getDelegateName(s.delegateId),
            'تاريخ التسجيل': s.registrationDate
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataForExport);
        const objectMaxLength: number[] = [];
        const columnNames = Object.keys(dataForExport[0] || {});
        for (let i = 0; i < dataForExport.length; i++) {
            let value = Object.values(dataForExport[i]);
            for (let j = 0; j < value.length; j++) {
                if (typeof value[j] == 'number') {
                    objectMaxLength[j] = 10;
                } else if(value[j]) {
                     const cellValueLength = String(value[j]).length;
                     objectMaxLength[j] = (objectMaxLength[j] || 0) >= cellValueLength ? objectMaxLength[j] : cellValueLength;
                }
            }
        }
        const wscols = columnNames.map((key, i) => ({
            wch: Math.max((objectMaxLength[i] || 10) + 2, key.length + 2) 
        }));
        worksheet['!cols'] = wscols;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الطلاب');
        XLSX.writeFile(workbook, `طلاب_المركز_الأوروبي_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                const headers = json[0];
                const headerMap: {[key:string]: string} = {
                    'الاسم_الأول': 'firstName', 'الاسم_الثاني': 'secondName', 'الاسم_الثالث': 'thirdName',
                    'اللقب': 'lastName', 'الهاتف': 'phone', 'الدورة': 'course', 'الوقت': 'schedule', 'المندوب': 'delegateName'
                };

                const mappedHeaders = headers.map((h: string) => headerMap[h.trim()] || h.trim());

                let importedCount = 0;
                let skippedCount = 0;

                for (let i = 1; i < json.length; i++) {
                    const row = json[i];
                    if (row.every((cell: any) => cell === null || cell === '')) continue; // Skip empty rows

                    const studentData: any = {};
                    mappedHeaders.forEach((key: string, index: number) => {
                        studentData[key] = row[index];
                    });

                    const fullName = `${studentData.firstName || ''} ${studentData.secondName || ''} ${studentData.thirdName || ''} ${studentData.lastName || ''}`;
                    const normalizedName = normalizeArabic(fullName);

                    if (existingStudentMap.has(normalizedName)) {
                        skippedCount++;
                        continue;
                    }
                    
                    const delegateId = delegateNameMap.get(normalizeArabic(studentData.delegateName?.toLowerCase() || ''));

                    if (!delegateId || !studentData.course || !studentData.schedule) {
                         skippedCount++;
                         continue;
                    }
                    
                    onAddStudent({
                        firstName: studentData.firstName || '',
                        secondName: studentData.secondName || '',
                        thirdName: studentData.thirdName || '',
                        lastName: studentData.lastName || '',
                        phone: String(studentData.phone || ''),
                        course: studentData.course as Course,
                        schedule: studentData.schedule as Schedule,
                        delegateId: delegateId,
                    });
                    importedCount++;
                }
                
                setNotification({ message: `✅ تمت عملية الاستيراد بنجاح.\nتم استيراد ${importedCount} طالب.\nتم تخطي ${skippedCount} طالب بسبب التكرار أو نقص البيانات.`, type: 'success' });

            } catch (error) {
                console.error("Error importing file:", error);
                setNotification({ message: '❌ حدث خطأ أثناء استيراد الملف. يرجى التأكد من تنسيق الملف.', type: 'error' });
            } finally {
                if(event.target) event.target.value = '';
                setTimeout(() => setNotification(null), 8000);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleEditClick = (student: Student) => {
        setStudentToEdit(student);
        setIsEditModalOpen(true);
    };
    
    const handleDeleteClick = (studentId: number) => {
        if(window.confirm('هل أنت متأكد من حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.')){
            onDeleteStudent(studentId);
        }
    };
    
    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isActive = sortConfig.key === sortKey;
        const icon = isActive ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕';
        return (
            <th className="p-3 font-semibold cursor-pointer select-none text-[var(--color-primary-text)] whitespace-nowrap" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center justify-start gap-2">
                    <span>{children}</span>
                    <span className="opacity-70 text-xs">{icon}</span>
                </div>
            </th>
        );
    };

    return (
        <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md">
            {notification && <Notification message={notification.message} type={notification.type} />}
            {studentToEdit && <EditStudentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} student={studentToEdit} delegates={delegates} onSave={onEditStudent} />}
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b-2 border-[var(--color-primary-light)] pb-4">
                <div className="text-xl font-bold text-[var(--color-text-base)]">
                    📋 إجمالي الطلاب: <span className="text-[var(--color-secondary)]">{sortedAndFilteredStudents.length}</span>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls, .csv" />
                        <button onClick={handleImportClick} className="flex-1 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2 shadow justify-center">
                           <span>📤</span> استيراد
                        </button>
                        <button onClick={handleExport} className="flex-1 bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors flex items-center gap-2 shadow justify-center">
                            <span>📥</span> تصدير
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="🔍 ابحث بالاسم الرباعي أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-card)] text-[var(--color-text-base)]"
                />
                <select
                    value={filterDelegate}
                    onChange={(e) => setFilterDelegate(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-card)] text-[var(--color-text-base)]"
                >
                    <option value="">🏢 تصفية حسب المندوب (الكل)</option>
                    {delegates.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
            </div>
            
            <details className="mb-4 bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border)]">
                <summary className="cursor-pointer font-semibold text-[var(--color-primary)]">📊 عرض إحصائيات المندوبين</summary>
                <div className="mt-2 space-y-2 pt-2 border-t border-[var(--color-border)]">
                    {delegates.filter(d => d.role === 'delegate').map(delegate => {
                        const delegateStudentCount = students.filter(s => s.delegateId === delegate.id).length;
                        const percentage = students.length > 0 ? ((delegateStudentCount / students.length) * 100).toFixed(1) : 0;
                        return (
                           <div key={delegate.id} className="flex justify-between items-center text-sm text-[var(--color-text-base)]">
                               <span>{delegate.fullName}</span>
                               <span className="font-bold text-[var(--color-secondary)]">{delegateStudentCount} طالب ({percentage}%)</span>
                           </div>
                        );
                    })}
                </div>
            </details>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
                {sortedAndFilteredStudents.map((student) => (
                    <div key={student.id} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-primary)]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-[var(--color-primary)] text-lg">{`${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`}</p>
                                <p className="text-sm text-[var(--color-text-muted)]">{student.phone}</p>
                            </div>
                            <div className="text-sm font-semibold text-[var(--color-text-muted)]">#{student.id}</div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-sm space-y-2 text-[var(--color-text-base)]">
                            <p><strong>الدورة:</strong> {student.course}</p>
                            <p><strong>المندوب:</strong> <span className="font-semibold text-[var(--color-secondary)]">{getDelegateName(student.delegateId)}</span></p>
                            <p><strong>تاريخ التسجيل:</strong> {student.registrationDate}</p>
                        </div>
                        {currentUser?.role === 'admin' && (
                            <div className="mt-3 pt-2 border-t border-[var(--color-border)] flex justify-end gap-4">
                                <button onClick={() => handleEditClick(student)} className="text-blue-600 font-bold text-sm">تعديل</button>
                                <button onClick={() => handleDeleteClick(student.id)} className="text-red-600 font-bold text-sm">حذف</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block rounded-t-lg border border-[var(--color-border)]">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                        <tr>
                            <SortableHeader sortKey="id">الرقم</SortableHeader>
                            <SortableHeader sortKey="fullName">الاسم الرباعي</SortableHeader>
                            <SortableHeader sortKey="phone">الهاتف</SortableHeader>
                            <SortableHeader sortKey="course">الدورة</SortableHeader>
                            <SortableHeader sortKey="delegateName">المندوب</SortableHeader>
                            <SortableHeader sortKey="registrationDate">تاريخ التسجيل</SortableHeader>
                            {currentUser?.role === 'admin' && <th className="p-3 font-semibold whitespace-nowrap">إجراءات</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredStudents.map((student, index) => (
                            <tr key={student.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-text-base)] hover:bg-blue-50 transition-colors`}>
                                <td className="p-3 font-mono">{student.id}</td>
                                <td className="p-3 font-bold">{`${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`}</td>
                                <td className="p-3 font-mono">{student.phone}</td>
                                <td className="p-3">{student.course}</td>
                                <td className="p-3 font-semibold text-[var(--color-secondary)]">{getDelegateName(student.delegateId)}</td>
                                <td className="p-3 font-mono text-sm">{student.registrationDate}</td>
                                {currentUser?.role === 'admin' && (
                                    <td className="p-3 space-x-2 space-x-reverse whitespace-nowrap">
                                        <button onClick={() => handleEditClick(student)} className="text-blue-600 hover:underline text-sm font-bold">تعديل</button>
                                        <button onClick={() => handleDeleteClick(student.id)} className="text-red-600 hover:underline text-sm font-bold">حذف</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredStudents.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)] bg-[var(--color-card)]">لا توجد بيانات لعرضها.</div>}
            </div>
        </div>
    );
};

interface StudentManagementProps {
    delegates: Delegate[];
    students: Student[];
    onAddStudent: (student: Omit<Student, 'id' | 'registrationDate'>) => void;
    onEditStudent: (studentId: number, data: Partial<Omit<Student, 'id'>>) => void;
    onDeleteStudent: (studentId: number) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ delegates, students, onAddStudent, onEditStudent, onDeleteStudent }) => {
    const [activeTab, setActiveTab] = useState<'register' | 'log'>('register');

    const TabButton: React.FC<{ tabName: 'register' | 'log'; label: string; icon: string }> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 md:flex-initial md:w-auto flex items-center justify-center gap-2 p-3 font-bold rounded-t-lg transition-colors border-t-4 ${
                activeTab === tabName
                    ? 'bg-[var(--color-card)] text-[var(--color-primary)] border-[var(--color-primary)]'
                    : 'bg-[var(--color-background)] text-[var(--color-text-muted)] border-transparent hover:bg-[var(--color-border)]'
            }`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row border-b border-[var(--color-border)] mb-6">
                <TabButton tabName="register" label="تسجيل طالب جديد" icon="📝" />
                <TabButton tabName="log" label="سجل الطلاب المسجلين" icon="📊" />
            </div>

            {activeTab === 'register' ? (
                <RegistrationForm students={students} delegates={delegates} onAddStudent={onAddStudent} onRegistrationSuccess={() => setActiveTab('log')} />
            ) : (
                <StudentLog students={students} delegates={delegates} onAddStudent={onAddStudent} onEditStudent={onEditStudent} onDeleteStudent={onDeleteStudent} />
            )}
        </div>
    );
};

const InputField: React.FC<{ label: string; id: string; type?: string; className?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, id, type = 'text', className = '', value, onChange }) => (
    <div className={className}>
        <label htmlFor={id} className="block font-semibold mb-2 text-right text-[var(--color-text-base)]">{label}:</label>
        <input type={type} id={id} name={id} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)]" value={value} onChange={onChange} />
    </div>
);

const SelectField: React.FC<{ id: string; options: { value: string; label: string }[], label?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; }> = ({ id, options, label, value, onChange }) => (
    <div>
        {label && <label htmlFor={id} className="block font-semibold mb-2 text-right text-[var(--color-text-base)]">{label}:</label>}
        <select id={id} name={id} required className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)]" value={value} onChange={onChange}>
            <option value="">-- اختر --</option>
            {options.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
        </select>
    </div>
);
