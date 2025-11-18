
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themes, ThemeName } from '../themes';
import { BackupData } from '../types';

interface SettingsProps {
    onCreateBackup?: () => BackupData;
    onRestoreBackup?: (data: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onCreateBackup, onRestoreBackup }) => {
  const { theme, setThemeName } = useTheme();
  const [backups, setBackups] = useState<BackupData[]>([]);

  // Load local backups
  useEffect(() => {
    const loadedBackups: BackupData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
            try {
                const backup = JSON.parse(localStorage.getItem(key)!);
                loadedBackups.push(backup);
            } catch (e) {}
        }
    }
    setBackups(loadedBackups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleCreateLocalBackup = () => {
    if (!onCreateBackup) return;
    const backup = onCreateBackup();
    localStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backup));
    setBackups(prev => [backup, ...prev]);
    alert('✅ تم إنشاء نسخة احتياطية محلية بنجاح');
  };

  const handleRestoreLocal = (backup: BackupData) => {
      if (window.confirm(`هل أنت متأكد من استعادة النسخة: ${backup.name}؟ سيتم استبدال جميع البيانات الحالية.`)) {
          if (onRestoreBackup) {
              onRestoreBackup(backup.data);
              alert('✅ تم استعادة النسخة الاحتياطية بنجاح');
          }
      }
  };

  const handleDeleteBackup = (backup: BackupData) => {
       if (window.confirm(`هل أنت متأكد من حذف النسخة: ${backup.name}؟`)) {
           const keyFound = Object.keys(localStorage).find(k => k.startsWith('backup_') && localStorage.getItem(k)?.includes(backup.date));
           if(keyFound) localStorage.removeItem(keyFound);
           else {
             for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if(key && key.startsWith('backup_')) {
                     const b = JSON.parse(localStorage.getItem(key)!);
                     if(b.date === backup.date && b.name === backup.name) {
                         localStorage.removeItem(key);
                         break;
                     }
                }
             }
           }
           setBackups(prev => prev.filter(b => b.date !== backup.date));
       }
  };

  const handleExport = (backup: BackupData) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${backup.name}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            if (parsed.data && parsed.name) {
                 if (window.confirm(`هل تريد استعادة النسخة المستوردة: ${parsed.name}؟`)) {
                    if (onRestoreBackup) onRestoreBackup(parsed.data);
                    alert('✅ تم استيراد واستعادة النسخة بنجاح');
                 }
            } else {
                alert('❌ ملف غير صالح');
            }
        } catch (error) {
            alert('❌ حدث خطأ أثناء قراءة الملف');
        }
        if(event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };


  const handleResetTheme = () => {
    setThemeName('default');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-6">⚙️ إعدادات النظام</h2>
      
      {/* Backup Management Section */}
      <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold text-[var(--color-primary)] border-b-2 border-[var(--color-primary-light)] pb-2 mb-4">💾 إدارة النسخ الاحتياطية</h3>
        
        <div className="flex flex-wrap gap-4 mb-6">
             <button onClick={handleCreateLocalBackup} className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-6 py-2 rounded-lg hover:bg-[var(--color-primary-hover)] transition shadow-md flex items-center gap-2 font-bold">
                <span>📥</span> إنشاء نسخة احتياطية جديدة
             </button>
             <label className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] px-6 py-2 rounded-lg hover:bg-[var(--color-secondary-hover)] transition cursor-pointer shadow-md flex items-center gap-2 font-bold">
                <span>📤</span> استيراد من ملف
                <input type="file" className="hidden" accept=".json" onChange={handleImportFile} />
             </label>
        </div>

        {backups.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                        <tr>
                            <th className="p-3 font-semibold">رقم</th>
                            <th className="p-3 font-semibold">اسم النسخة</th>
                            <th className="p-3 font-semibold">التاريخ</th>
                            <th className="p-3 font-semibold">الحجم</th>
                            <th className="p-3 font-semibold">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.map((backup, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]'} border-b border-[var(--color-border)]`}>
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">{backup.name}</td>
                                <td className="p-3 text-sm" dir="ltr">{new Date(backup.date).toLocaleString()}</td>
                                <td className="p-3">{backup.size}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => handleRestoreLocal(backup)} className="text-blue-600 hover:underline text-sm font-bold">استعادة</button>
                                    <button onClick={() => handleExport(backup)} className="text-green-600 hover:underline text-sm font-bold">تصدير</button>
                                    <button onClick={() => handleDeleteBackup(backup)} className="text-red-600 hover:underline text-sm font-bold">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="bg-[var(--color-background)] p-6 rounded-lg text-center border border-dashed border-[var(--color-border)]">
                <p className="text-[var(--color-text-muted)] text-lg">⚠️ لا توجد نسخ احتياطية محفوظة محلياً.</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">قم بإنشاء نسخة احتياطية جديدة للحفاظ على بياناتك.</p>
            </div>
        )}
      </div>

      <div className="bg-[var(--color-card)] p-8 rounded-lg shadow-md space-y-12">
        <div>
          <h3 className="text-xl font-bold text-[var(--color-secondary)] border-b-2 border-[var(--color-secondary-light)] pb-2 mb-4">🎨 خصائص المظهر:</h3>
          <p className="text-[var(--color-text-muted)] mb-6">
            اختر سمة الألوان التي تفضلها لتخصيص واجهة النظام. سيتم تطبيق التغييرات فوراً.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(themes).map((themeOption) => (
              <button
                key={themeOption.name}
                onClick={() => setThemeName(themeOption.name as ThemeName)}
                className={`p-4 rounded-lg border-4 transition-all duration-200 text-right ${
                  theme.name === themeOption.name
                    ? 'border-[var(--color-secondary)] shadow-lg scale-105'
                    : 'border-transparent hover:border-[var(--color-border)]'
                }`}
                style={{ backgroundColor: themeOption.colors['--color-card'], color: themeOption.colors['--color-text-base'] }}
              >
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{themeOption.icon}</span>
                    <h4 className="font-bold text-lg">{themeOption.label}</h4>
                </div>
                <div className="flex space-x-2 justify-end" aria-hidden="true">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors['--color-primary'] }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors['--color-secondary'] }}></div>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors['--color-background'], border: `1px solid ${themeOption.colors['--color-border']}` }}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
            <h3 className="text-xl font-bold text-[var(--color-primary)] border-b-2 border-[var(--color-primary-light)] pb-2 mb-4">🔄 إعادة تعيين:</h3>
            <button
              onClick={handleResetTheme}
              className="bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-2 px-6 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300"
            >
              إعادة تعيين المظهر الافتراضي
            </button>
        </div>
      </div>
    </div>
  );
};
