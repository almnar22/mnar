
import React, { useMemo, useState } from 'react';
import type { Commission, Delegate } from '../types';
import { StudentStatus, CommissionStatus } from '../types';

interface ReportsProps {
    delegates: Delegate[];
    commissions: Commission[];
}

interface PerformanceData {
    delegateName: string;
    totalStudents: number;
    studyingStudents: number;
    droppedStudents: number;
    completedStudents: number;
    totalCommissions: number;
    paidCommissions: number;
}

// FIX: Export the component to make it accessible to other modules.
export const Reports: React.FC<ReportsProps> = ({ delegates, commissions }) => {
    const [selectedDelegateId, setSelectedDelegateId] = useState<string>('');

    const performanceData = useMemo<PerformanceData[]>(() => {
        return delegates
          .filter(d => d.role === 'delegate') // Only include delegates in the performance report
          .map(delegate => {
            const delegateCommissions = commissions.filter(c => c.delegateId === delegate.id);
            
            const studyingStudents = delegateCommissions.filter(c => 
                [StudentStatus.Studying, StudentStatus.OnHold, StudentStatus.FeesPaid, StudentStatus.Registered].includes(c.studentStatus)
            ).length;
            
            const droppedStudents = delegateCommissions.filter(c => c.studentStatus === StudentStatus.Dropped).length;
            const completedStudents = delegateCommissions.filter(c => c.studentStatus === StudentStatus.Completed).length;
            const totalCommissions = delegateCommissions.reduce((sum, c) => sum + (c.status !== CommissionStatus.Cancelled ? c.amount : 0), 0);
            const paidCommissions = delegateCommissions.filter(c => c.status === CommissionStatus.Paid).reduce((sum, c) => sum + c.amount, 0);
            
            return {
                delegateName: delegate.fullName,
                totalStudents: delegate.students,
                studyingStudents,
                droppedStudents,
                completedStudents,
                totalCommissions,
                paidCommissions,
            };
        });
    }, [delegates, commissions]);
    
    const filteredData = useMemo(() => {
        if (!selectedDelegateId) {
            return performanceData;
        }
        const delegate = delegates.find(d => d.id === parseInt(selectedDelegateId, 10));
        return performanceData.filter(p => p.delegateName === delegate?.fullName);
    }, [performanceData, selectedDelegateId, delegates]);
    
    const totals = useMemo(() => ({
        totalStudents: filteredData.reduce((sum, item) => sum + item.totalStudents, 0),
        studyingStudents: filteredData.reduce((sum, item) => sum + item.studyingStudents, 0),
        droppedStudents: filteredData.reduce((sum, item) => sum + item.droppedStudents, 0),
        completedStudents: filteredData.reduce((sum, item) => sum + item.completedStudents, 0),
        totalCommissions: filteredData.reduce((sum, item) => sum + item.totalCommissions, 0),
        paidCommissions: filteredData.reduce((sum, item) => sum + item.paidCommissions, 0),
    }), [filteredData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div id="reports-page">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 no-print">
                <h2 className="text-3xl font-bold text-[var(--color-primary)]">📈 نظام التقارير المتقدم</h2>
                <button onClick={handlePrint} className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-4 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 flex items-center gap-2 shadow w-full md:w-auto justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m0 0l2.148 2.148a1.2 1.2 0 011.697 0L11 19.5m-2.148-2.148L11 19.5m0 0l2.148 2.148a1.2 1.2 0 001.697 0L17 18.25m-2.148-2.148L17 18.25m0 0l2.148 2.148a1.2 1.2 0 011.697 0L23 19.5m-2.148-2.148L23 19.5m0 0l2.148 2.148a1.2 1.2 0 001.697 0L29 18.25m-2.148-2.148L29 18.25m0 0l2.148 2.148a1.2 1.2 0 011.697 0L35 19.5m-2.148-2.148L35 19.5m0 0l2.148 2.148a1.2 1.2 0 001.697 0L41 18.25m-2.148-2.148L41 18.25m0 0l-2.148-2.148m0 0a1.2 1.2 0 01-1.697 0L35 13.829m2.148 2.148L35 13.829m0 0l-2.148-2.148m0 0a1.2 1.2 0 00-1.697 0L29 13.829m2.148 2.148L29 13.829m0 0l-2.148-2.148m0 0a1.2 1.2 0 01-1.697 0L23 13.829m2.148 2.148L23 13.829m0 0l-2.148-2.148m0 0a1.2 1.2 0 00-1.697 0L17 13.829m2.148 2.148L17 13.829m0 0l-2.148-2.148m0 0a1.2 1.2 0 01-1.697 0L11 13.829m2.148 2.148L11 13.829m0 0l-2.148-2.148m0 0a1.2 1.2 0 00-1.697 0L2.25 13.829M7.5 15.75l.004-.004.004-.004.004-.004.004-.004M7.5 15.75a3 3 0 00-3-3M7.5 15.75a3 3 0 013-3m-3 3V4.5m0 11.25a3 3 0 003 3m-3-3a3 3 0 01-3 3m0 0V4.5m3 11.25v-1.5m3 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5M15 4.5a3 3 0 11-6 0 3 3 0 016 0zm-3 4.5V12m0 0v1.5m0-1.5h-3m3 0h3m-3-1.5a3 3 0 00-3-3m3 3a3 3 0 013-3m-3 3a3 3 0 00-3 3m3 3a3 3 0 013-3m-3 3V12m0 0v1.5m0-1.5h-3m3 0h3m-3-1.5a3 3 0 00-3-3m3 3a3 3 0 013-3" /></svg>
                    <span>طباعة التقرير / PDF</span>
                </button>
            </div>
            <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 no-print">
                     <h3 className="text-xl font-bold text-[var(--color-secondary)]">📊 تقرير أداء المندوبين</h3>
                     <select
                        value={selectedDelegateId}
                        onChange={(e) => setSelectedDelegateId(e.target.value)}
                        className="w-full md:w-1/3 px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-background)] text-[var(--color-text-base)]"
                    >
                        <option value="">تصفية حسب المندوب (الكل)</option>
                        {delegates.filter(d=>d.role === 'delegate').map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                    </select>
                </div>
                
                {/* Mobile Card View */}
                <div className="space-y-4 md:hidden">
                    {filteredData.map((rep, index) => (
                        <div key={index} className="bg-[var(--color-background)] p-4 rounded-lg shadow border-r-4 border-[var(--color-primary)]">
                             <p className="font-bold text-[var(--color-primary)] text-lg mb-2">{rep.delegateName}</p>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-[var(--color-border)] pt-2 text-[var(--color-text-base)]">
                                <p><strong>إجمالي الطلاب:</strong> {rep.totalStudents}</p>
                                <p className="text-green-600"><strong>مستمرين:</strong> {rep.studyingStudents}</p>
                                <p className="text-red-600"><strong>منقطعين:</strong> {rep.droppedStudents}</p>
                                <p className="text-purple-600"><strong>مكتملين:</strong> {rep.completedStudents}</p>
                             </div>
                             <div className="mt-2 pt-2 border-t border-[var(--color-border)] text-sm space-y-1 text-[var(--color-text-base)]">
                                <p><strong>إجمالي العمولات:</strong> <span className="font-bold text-[var(--color-secondary)]">{rep.totalCommissions.toLocaleString()} ريال</span></p>
                                <p><strong>العمولات المدفوعة:</strong> <span className="font-bold text-[var(--color-success-text)]">{rep.paidCommissions.toLocaleString()} ريال</span></p>
                             </div>
                        </div>
                    ))}
                    {/* Totals Card for Mobile */}
                    <div className="bg-[var(--color-primary)] text-[var(--color-primary-text)] p-4 rounded-lg shadow font-bold mt-4">
                        <h4 className="text-lg mb-2 text-center">الإجماليات</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                           <p>الطلاب: {totals.totalStudents}</p>
                           <p>المستمرين: {totals.studyingStudents}</p>
                           <p>المنقطعين: {totals.droppedStudents}</p>
                           <p>المكتملين: {totals.completedStudents}</p>
                        </div>
                         <div className="mt-2 pt-2 border-t border-white/20 text-sm space-y-1">
                           <p>إجمالي العمولات: {totals.totalCommissions.toLocaleString()} ريال</p>
                           <p>العمولات المدفوعة: {totals.paidCommissions.toLocaleString()} ريال</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block rounded-t-lg border border-[var(--color-border)]">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
                            <tr>
                                <th className="p-3 font-semibold">المندوب</th>
                                <th className="p-3 font-semibold text-center">إجمالي الطلاب</th>
                                <th className="p-3 font-semibold text-center">الطلاب المستمرين</th>
                                <th className="p-3 font-semibold text-center">الطلاب المنقطعين</th>
                                <th className="p-3 font-semibold text-center">الطلاب المكتملين</th>
                                <th className="p-3 font-semibold">إجمالي العمولات</th>
                                <th className="p-3 font-semibold">العمولات المدفوعة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((rep, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-text-base)] hover:bg-blue-50 transition-colors`}>
                                    <td className="p-3 font-bold text-[var(--color-primary)]">{rep.delegateName}</td>
                                    <td className="p-3 text-center font-bold">{rep.totalStudents}</td>
                                    <td className="p-3 text-center font-semibold text-green-600">{rep.studyingStudents}</td>
                                    <td className="p-3 text-center font-semibold text-red-600">{rep.droppedStudents}</td>
                                    <td className="p-3 text-center font-semibold text-purple-600">{rep.completedStudents}</td>
                                    <td className="p-3 font-bold text-[var(--color-secondary)]">{rep.totalCommissions.toLocaleString()} ريال</td>
                                    <td className="p-3 font-bold text-[var(--color-success-text)]">{rep.paidCommissions.toLocaleString()} ريال</td>
                                </tr>
                            ))}
                        </tbody>
                         <tfoot>
                            <tr className="bg-[var(--color-primary)] text-[var(--color-primary-text)] font-bold">
                                <td className="p-3">الإجمالي</td>
                                <td className="p-3 text-center">{totals.totalStudents}</td>
                                <td className="p-3 text-center">{totals.studyingStudents}</td>
                                <td className="p-3 text-center">{totals.droppedStudents}</td>
                                <td className="p-3 text-center">{totals.completedStudents}</td>
                                <td className="p-3">{totals.totalCommissions.toLocaleString()} ريال</td>
                                <td className="p-3">{totals.paidCommissions.toLocaleString()} ريال</td>
                            </tr>
                        </tfoot>
                    </table>
                     {filteredData.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)] hidden md:block">لا توجد بيانات لعرضها.</div>}
                </div>
                {filteredData.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)] md:hidden">لا توجد بيانات لعرضها.</div>}
            </div>
        </div>
    );
};
