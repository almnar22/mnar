import React from 'react';

export const AppHeader: React.FC = () => {
  return (
    <div className="bg-[var(--color-card)] p-4 rounded-lg shadow-md border-t-4 border-[var(--color-primary)] text-center">
        <div className="text-center">
           <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
              🔷🔶 نظام المندوب الذكي - المركز الأوروبي 🔶🔷
            </h1>
            <p className="mt-1 text-[var(--color-text-muted)]">
                المركز الأوروبي - حجة شارع مجمع الثورة | 📞 07223242 - 771991074
            </p>
        </div>
    </div>
  );
};
