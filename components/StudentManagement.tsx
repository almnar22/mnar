
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Course, Schedule, Delegate, Student, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Make sure SheetJS is loaded from index.html
declare const XLSX: any;

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
    const baseClasses = "p-4 rounded-xl text-[var(--color-primary-text)] font-bold mb-4 flex items-center gap-2 whitespace-pre-wrap shadow-sm animate-fade-in";
    const typeClasses = {
        success: "bg-[var(--color-secondary)]",
        error: "bg-[var(--color-primary)]"
    };
    const icon = type === 'success' ? '✅' : '⚠️';
    return <div className={`${baseClasses} ${typeClasses[type]}`}>{icon} {message}</div>;
}

// New Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName: string;
}> = ({ isOpen, onClose, onConfirm, studentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 border-t-4 border-red-500 p-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        🗑️
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text-base)] mb-2">تأكيد الحذف</h3>
                    <p className="text-[var(--color-text-muted)] mb-6 leading-relaxed">
                        هل أنت متأكد من رغبتك في حذف الطالب <br/>
                        <span className="font-bold text-[var(--color-primary)] text-lg block mt-1">{studentName}</span>
                        <span className="text-xs text-red-500 mt-2 block font-bold bg-red-50 py-1 rounded">⚠️ لا يمكن التراجع عن هذا الإجراء</span>
                    </p>
                    
                    <div className="flex justify-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg flex items-center gap-2"
                        >
                            نعم، احذف
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

        const newFullName = `${newStudentData.firstName} ${newStudentData.secondName} ${newStudentData.thirdName} ${newStudentData.lastName}`;
        const normalizedNewName = normalizeArabic(newFullName);
        
        if (existingStudentMap.has(normalizedNewName)) {
            const duplicateStudent = existingStudentMap.get(normalizedNewName)!;
            const duplicateFullName = `${duplicateStudent.firstName} ${duplicateStudent.secondName} ${duplicateStudent.thirdName} ${duplicateStudent.lastName}`;

            const errorMessage = `❌ خطأ! الطالب مسجل مسبقاً\nالاسم: ${duplicateFullName}\nالهاتف: ${duplicateStudent.phone}`;
            setNotification({ message: errorMessage, type: 'error' });
            setTimeout(() => setNotification(null), 7000); 
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
        <div className="animate-fade-in">
            {notification && <Notification message={notification.message} type={notification.type} />}
            <form onSubmit={handleSubmit} className="bg-[var(--color-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)] space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2 mb-4">
                        <span className="bg-[var(--color-primary-light)] p-1 rounded">👤</span> البيانات الشخصية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <InputField label="الاسم الأول" id="firstName" />
                        <InputField label="الاسم الثاني" id="secondName" />
                        <InputField label="الاسم الثالث" id="thirdName" />
                        <InputField label="اللقب" id="lastName" />
                        <InputField label="رقم الهاتف" id="phone" type="tel" className="md:col-span-2 lg:col-span-4" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-secondary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2 mb-4">
                            <span className="bg-[var(--color-secondary-light)] p-1 rounded">📚</span> تفاصيل الدورة
                        </h3>
                        <SelectField id="course" options={Object.values(Course).map(c => ({ value: c, label: c }))} label="اختر الدورة" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-2 border-b border-[var(--color-border)] pb-2 mb-4">
                            <span className="bg-[var(--color-primary-light)] p-1 rounded">⏰</span> التوقيت
                        </h3>
                        <SelectField id="schedule" options={Object.values(Schedule).map(s => ({ value: s, label: s }))} label="اختر الوقت" />
                    </div>
                </div>
                
                {!delegateLockId && (
                <div>
                    <h3 className="text-lg font-bold text-gray-600 flex items-center gap-2 border-b border-[var(--color-border)] pb-2 mb-4">
                         <span className="bg-gray-100 p-1 rounded">🤝</span> المندوب
                    </h3>
                    <SelectField id="delegateId" options={activeDelegates.map(d => ({ value: d.id.toString(), label: `${d.fullName} - ${d.phone}` }))} label="اختر المندوب" />
                </div>
                )}
                
                <div className="pt-6 border-t border-[var(--color-border)] text-center">
                    <button type="submit" className="bg-gradient-to-r from-[var(--color-secondary)] to-orange-600 text-[var(--color-primary-text)] font-bold py-3 px-12 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-lg shadow-md">
                        تأكيد التسجيل ✨
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start p-4 overflow-y-auto animate-fade-in">
            <div className="bg-[var(--color-card)] rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
                 <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-5 flex justify-between items-center">
                    <h3 className="text-xl font-bold">تعديل بيانات الطالب</h3>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                    <div className="flex justify-end gap-4 pt-6 border-t border-[var(--color-border)]">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">إلغاء</button>
                        <button type="submit" className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2.5 px-6 rounded-xl hover:bg-[var(--color-secondary-hover)] transition-colors shadow-md">حفظ التعديلات</button>
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
    
    const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, studentId: number | null, studentName: string}>({
        isOpen: false,
        studentId: null,
        studentName: ''
    });

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
                    if (row.every((cell: any) => cell === null || cell === '')) continue;

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
                
                setNotification({ message: `✅ تمت عملية الاستيراد بنجاح.\nتم استيراد ${importedCount} طالب.\nتم تخطي ${skippedCount} طالب.`, type: 'success' });

            } catch (error) {
                console.error("Error importing file:", error);
                setNotification({ message: '❌ حدث خطأ أثناء استيراد الملف.', type: 'error' });
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
        const student = students.find(s => s.id === studentId);
        if (student) {
             setDeleteModalState({
                isOpen: true,
                studentId,
                studentName: `${student.firstName} ${student.lastName}`
            });
        }
    };

    const confirmDelete = () => {
        if (deleteModalState.studentId !== null) {
            onDeleteStudent(deleteModalState.studentId);
            setDeleteModalState({ isOpen: false, studentId: null, studentName: '' });
            setNotification({ message: 'تم حذف الطالب بنجاح', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        }
    };
    
    const SortableHeader: React.FC<{ sortKey: SortableKeys | 'schedule'; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isActive = sortConfig.key === sortKey as SortableKeys;
        const icon = isActive ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '↕';
        return (
            <th className="p-3 font-semibold cursor-pointer select-none text-[var(--color-primary-text)] whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors" onClick={() => requestSort(sortKey as SortableKeys)}>
                <div className="flex items-center justify-start gap-2">
                    <span>{children}</span>
                    <span className="opacity-70 text-xs">{icon}</span>
                </div>
            </th>
        );
    };

    return (
        <div className="bg-[var(--color-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] animate-fade-in">
            {notification && <Notification message={notification.message} type={notification.type} />}
            {studentToEdit && <EditStudentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} student={studentToEdit} delegates={delegates} onSave={onEditStudent} />}
            
            <DeleteConfirmationModal 
                isOpen={deleteModalState.isOpen}
                onClose={() => setDeleteModalState({ ...deleteModalState, isOpen: false })}
                onConfirm={confirmDelete}
                studentName={deleteModalState.studentName}
            />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-xl font-bold text-[var(--color-text-base)] bg-[var(--color-background)] px-4 py-2 rounded-lg border border-[var(--color-border)]">
                    📋 إجمالي الطلاب: <span className="text-[var(--color-secondary)]">{sortedAndFilteredStudents.length}</span>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls, .csv" />
                        <button onClick={handleImportClick} className="flex-1 bg-white border border-[var(--color-border)] text-[var(--color-text-base)] font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm justify-center">
                           <span className="text-lg">📤</span> استيراد
                        </button>
                        <button onClick={handleExport} className="flex-1 bg-white border border-[var(--color-border)] text-[var(--color-text-base)] font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm justify-center">
                            <span className="text-lg">📥</span> تصدير
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="🔍 ابحث بالاسم الرباعي أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)]"
                    />
                    <span className="absolute right-3 top-3.5 opacity-50">🔎</span>
                </div>
                <select
                    value={filterDelegate}
                    onChange={(e) => setFilterDelegate(e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)]"
                >
                    <option value="">🏢 تصفية حسب المندوب (الكل)</option>
                    {delegates.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {sortedAndFilteredStudents.map((student) => (
                    <div key={student.id} className="bg-[var(--color-card)] p-5 rounded-2xl shadow-sm border border-[var(--color-border)]">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-[var(--color-primary)] text-lg">
                                    {student.firstName} {student.lastName}
                                </h4>
                                <div className="flex items-center gap-2 text-xs mt-1 text-[var(--color-text-muted)]">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{student.id}</span>
                                    <span>📅 {student.registrationDate}</span>
                                </div>
                            </div>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                                {student.course}
                            </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-[var(--color-text-base)] bg-[var(--color-background)]/50 p-3 rounded-xl mb-4">
                             <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-xs">الهاتف</span>
                                <span className="font-mono font-bold" dir="ltr">{student.phone}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-xs">التوقيت</span>
                                <span className="font-bold">{student.schedule}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-muted)] text-xs">المندوب</span>
                                <span className="font-bold text-[var(--color-secondary)]">{getDelegateName(student.delegateId)}</span>
                            </div>
                        </div>

                        {currentUser?.role === 'admin' && (
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(student)} className="flex-1 text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg text-sm font-bold transition-colors border border-blue-100 flex items-center justify-center gap-1">
                                    <span>✏️</span> تعديل
                                </button>
                                <button onClick={() => handleDeleteClick(student.id)} className="flex-1 text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-bold transition-colors border border-red-100 flex items-center justify-center gap-1">
                                    <span>🗑️</span> حذف
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {sortedAndFilteredStudents.length === 0 && (
                    <div className="text-center p-8 text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-xl border border-dashed border-[var(--color-border)]">
                        لا توجد بيانات لعرضها.
                    </div>
                )}
            </div>
            
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block rounded-xl border border-[var(--color-border)] shadow-sm">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                        <tr>
                            <SortableHeader sortKey="id">الرقم</SortableHeader>
                            <SortableHeader sortKey="fullName">الاسم الرباعي</SortableHeader>
                            <SortableHeader sortKey="phone">الهاتف</SortableHeader>
                            <SortableHeader sortKey="course">الدورة</SortableHeader>
                            <SortableHeader sortKey="schedule">الوقت</SortableHeader>
                            <SortableHeader sortKey="delegateName">المندوب</SortableHeader>
                            <SortableHeader sortKey="registrationDate">تاريخ التسجيل</SortableHeader>
                            {currentUser?.role === 'admin' && <th className="p-3 font-semibold whitespace-nowrap bg-[var(--color-primary)]">إجراءات</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {sortedAndFilteredStudents.map((student, index) => (
                            <tr key={student.id} className="bg-[var(--color-card)] hover:bg-[var(--color-background)] transition-colors">
                                <td className="p-4 font-mono text-sm text-gray-500">{student.id}</td>
                                <td className="p-4 font-bold text-[var(--color-text-base)]">{`${student.firstName} ${student.secondName} ${student.thirdName} ${student.lastName}`}</td>
                                <td className="p-4 font-mono text-sm">{student.phone}</td>
                                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{student.course}</span></td>
                                <td className="p-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">{student.schedule}</span></td>
                                <td className="p-4 font-medium text-[var(--color-secondary)]">{getDelegateName(student.delegateId)}</td>
                                <td className="p-4 font-mono text-sm text-gray-500">{student.registrationDate}</td>
                                {currentUser?.role === 'admin' && (
                                    <td className="p-4 space-x-2 space-x-reverse whitespace-nowrap">
                                        <button onClick={() => handleEditClick(student)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="تعديل">✏️</button>
                                        <button onClick={() => handleDeleteClick(student.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">🗑️</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {sortedAndFilteredStudents.length === 0 && <div className="text-center p-12 text-[var(--color-text-muted)]">لا توجد بيانات لعرضها.</div>}
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
            className={`flex-1 md:flex-initial px-6 py-3 font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tabName
                    ? 'bg-[var(--color-primary)] text-white shadow-md transform scale-105'
                    : 'bg-[var(--color-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-gray-50'
            }`}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-center md:justify-start gap-4 p-1 bg-[var(--color-background)] rounded-full w-fit mx-auto md:mx-0">
                <TabButton tabName="register" label="تسجيل طالب جديد" icon="📝" />
                <TabButton tabName="log" label="سجل الطلاب" icon="📊" />
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
        <label htmlFor={id} className="block text-sm font-bold mb-2 text-[var(--color-text-muted)]">{label}</label>
        <input type={type} id={id} name={id} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)]" value={value} onChange={onChange} />
    </div>
);

const SelectField: React.FC<{ id: string; options: { value: string; label: string }[], label?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; }> = ({ id, options, label, value, onChange }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-bold mb-2 text-[var(--color-text-muted)]">{label}</label>}
        <div className="relative">
            <select id={id} name={id} required className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] appearance-none" value={value} onChange={onChange}>
                <option value="">-- اختر --</option>
                {options.map((option, index) => <option key={index} value={option.value}>{option.label}</option>)}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);
