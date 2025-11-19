
import React, { useMemo } from 'react';
import type { Commission, Delegate } from '../types';
import { CommissionStatus, StudentStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';


interface CommissionManagementProps {
    commissions: Commission[];
    delegates: Delegate[];
    onUpdateCommissionStatus: (commissionId: number, status: CommissionStatus) => void;
    onUpdateStudentStatus: (commissionId: number, status: StudentStatus) => void;
}

const commissionStatusStyles: Record<CommissionStatus, { classes: string, label: string, icon: string }> = {
    [CommissionStatus.Pending]: { classes: 'bg-[var(--color-warning-light)] text-[var(--color-warning-text)]', label: 'معلقة', icon: '⏳' },
    [CommissionStatus.Confirmed]: { classes: 'bg-blue-100 text-blue-800', label: 'مؤكدة', icon: '✅' },
    [CommissionStatus.Paid]: { classes: 'bg-[var(--color-success-light)] text-[var(--color-success-text)]', label: 'مدفوعة', icon: '💰' },
    [CommissionStatus.Cancelled]: { classes: 'bg-red-100 text-red-800', label: 'ملغاة', icon: '❌' },
};

const studentStatusStyles: Record<StudentStatus, { classes: string, label: string, icon: string }> = {
    [StudentStatus.Registered]: { classes: 'bg-green-100 text-green-800', label: 'تم التسجيل', icon: '✅' },
    [StudentStatus.FeesPaid]: { classes: 'bg-sky-100 text-sky-800', label: 'دفع الرسوم', icon: '💰' },
    [StudentStatus.Studying]: { classes: 'bg-amber-100 text-amber-800', label: 'مستمر', icon: '📚' },
    [StudentStatus.OnHold]: { classes: 'bg-gray-200 text-gray-800', label: 'متوقف', icon: '⏸️' },
    [StudentStatus.Dropped]: { classes: 'bg-rose-200 text-rose-800', label: 'منقطع', icon: '❌' },
    [StudentStatus.Completed]: { classes: 'bg-purple-100 text-purple-800', label: 'اكتمل', icon: '🎓' },
};

const studentStatusOptions = [
    { value: StudentStatus.Registered, label: '✅ تم التسجيل' },
    { value: StudentStatus.FeesPaid, label: '💰 دفع الرسوم' },
    { value: StudentStatus.Studying, label: '📚 مستمر' },
    { value: StudentStatus.OnHold, label: '⏸️ متوقف' },
    { value: StudentStatus.Dropped, label: '❌ منقطع' },
    { value: StudentStatus.Completed, label: '🎓 اكتمل' },
]


export const CommissionManagement: React.FC<CommissionManagementProps> = ({ commissions, delegates, onUpdateCommissionStatus, onUpdateStudentStatus }) => {
    const { currentUser } = useAuth();
    const delegateMap = useMemo(() => new Map(delegates.map(d => [d.id, d.fullName])), [delegates]);
    
    const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div>
      <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6">🔷🔶 سجل العمولات وحالة الطلاب 🔶🔷</h2>
       <div className="bg-[var(--color-card)] p-6 rounded-lg shadow-md">
        
        {/* Mobile Card View - Fully Vertical to Avoid Scroll */}
        <div className="space-y-4 md:hidden">
            {commissions.map((commission) => (
                <div key={commission.id} className="bg-[var(--color-background)] rounded-lg shadow border border-[var(--color-border)] overflow-hidden">
                    {/* Header: Amount & Student */}
                    <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]/50">
                        <span className="font-bold text-[var(--color-secondary)] text-lg">{commission.amount} ريال</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{commission.createdDate}</span>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Student Name */}
                        <div>
                             <label className="text-xs font-bold text-[var(--color-text-muted)] block">الطالب</label>
                             <p className="font-bold text-[var(--color-primary)] text-base">{commission.studentName}</p>
                        </div>

                        {/* Course & Delegate */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--color-text-muted)] block">الدورة</label>
                                <p className="text-sm font-medium">{commission.course}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--color-text-muted)] block">المندوب</label>
                                <p className="text-sm font-medium text-[var(--color-text-base)]">{delegateMap.get(commission.delegateId) || 'غير معروف'}</p>
                            </div>
                        </div>

                        <div className="border-t border-[var(--color-border)] my-2"></div>

                        {/* Commission Status */}
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-[var(--color-text-base)]">حالة العمولة:</label>
                             <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${commissionStatusStyles[commission.status].classes}`}>
                                {commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}
                            </span>
                        </div>

                        {/* Student Status */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold text-[var(--color-text-base)]">حالة الطالب:</label>
                            {isManagerOrAdmin ? (
                                <select
                                    value={commission.studentStatus}
                                    onChange={(e) => onUpdateStudentStatus(commission.id, e.target.value as StudentStatus)}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold border border-[var(--color-border)] cursor-pointer text-right ${studentStatusStyles[commission.studentStatus].classes}`}
                                >
                                    {studentStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            ) : (
                                <div className={`w-full px-3 py-2 rounded-lg text-sm font-semibold text-center ${studentStatusStyles[commission.studentStatus].classes}`}>
                                    {studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    {commission.status === CommissionStatus.Confirmed && isManagerOrAdmin && (
                        <div className="p-3 bg-[var(--color-background)] border-t border-[var(--color-border)]">
                             <button onClick={() => onUpdateCommissionStatus(commission.id, CommissionStatus.Paid)} className="w-full bg-[var(--color-success)] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow">
                                <span>💰</span> تسديد العمولة
                            </button>
                        </div>
                    )}
                </div>
            ))}
             {commissions.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)] bg-[var(--color-background)] rounded-lg border border-dashed border-[var(--color-border)]">لا توجد عمولات لعرضها.</div>}
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block rounded-t-lg border border-[var(--color-border)]">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[var(--color-primary)] text-[var(--color-primary-text)]">
              <tr>
                <th className="p-3 font-semibold whitespace-nowrap">المندوب</th>
                <th className="p-3 font-semibold whitespace-nowrap">الطالب</th>
                <th className="p-3 font-semibold whitespace-nowrap">الدورة</th>
                <th className="p-3 font-semibold whitespace-nowrap">المبلغ</th>
                <th className="p-3 font-semibold whitespace-nowrap">حالة العمولة</th>
                <th className="p-3 font-semibold whitespace-nowrap">حالة الطالب</th>
                <th className="p-3 font-semibold whitespace-nowrap">تاريخ الإنشاء</th>
                <th className="p-3 font-semibold whitespace-nowrap">إجراء الدفع</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission, index) => (
                <tr key={commission.id} className={`${index % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)] text-[var(--color-text-base)] hover:bg-blue-50 transition-colors`}>
                  <td className="p-3 font-semibold text-[var(--color-primary)]">{delegateMap.get(commission.delegateId) || 'غير معروف'}</td>
                  <td className="p-3 font-bold">{commission.studentName}</td>
                  <td className="p-3">{commission.course}</td>
                  <td className="p-3 font-bold text-[var(--color-secondary)]">{commission.amount} ريال</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${commissionStatusStyles[commission.status].classes}`}>
                        {commissionStatusStyles[commission.status].icon} {commissionStatusStyles[commission.status].label}
                    </span>
                  </td>
                  <td className="p-3">
                    {isManagerOrAdmin ? (
                         <select
                            value={commission.studentStatus}
                            onChange={(e) => onUpdateStudentStatus(commission.id, e.target.value as StudentStatus)}
                            className={`w-full px-3 py-1 rounded-full text-sm font-semibold border-none appearance-none cursor-pointer text-right ${studentStatusStyles[commission.studentStatus].classes}`}
                            style={{direction: 'rtl'}}
                         >
                            {studentStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         </select>
                    ) : (
                         <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${studentStatusStyles[commission.studentStatus].classes}`}>
                            {studentStatusStyles[commission.studentStatus].icon} {studentStatusStyles[commission.studentStatus].label}
                        </span>
                    )}
                  </td>
                  <td className="p-3 font-mono">{commission.createdDate}</td>
                  <td className="p-3 whitespace-nowrap">
                     {commission.status === CommissionStatus.Confirmed && isManagerOrAdmin && (
                         <button onClick={() => onUpdateCommissionStatus(commission.id, CommissionStatus.Paid)} className="bg-[var(--color-success)] text-white text-xs py-1 px-3 rounded-md hover:bg-green-700 transition-colors font-bold">
                            تسديد
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {commissions.length === 0 && <div className="text-center p-8 text-[var(--color-text-muted)]">لا توجد عمولات لعرضها.</div>}
        </div>
      </div>
    </div>
  );
};
