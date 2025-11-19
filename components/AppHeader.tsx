
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationsWidget } from './NotificationsWidget';
import { View } from '../types';

// We need to pass navigation prop if we want "View All" to work
// For simplicity in this specific file context without prop drilling changes in App.tsx yet, 
// we will use window dispatch or a simplified approach. 
// Ideally AppHeader receives onNavigate. For this implementation, 
// we will assume AppHeader is used inside a context that provides navigation or we pass it.

// However, AppHeader in App.tsx is rendered without props currently.
// To make this robust, let's update AppHeader to accept onNavigate if possible, 
// OR better: access navigation via a global method if available. 
// Since we don't have a router, we'll modify AppHeader to optionally take props but it might require changing App.tsx usage.
// Let's keep it simple: The NotificationWidget inside will need to signal App to change view.

// Since AppHeader doesn't take props in current App.tsx, I will update AppHeader to be generic
// but I need to trigger view change.
// I will add a Custom Event dispatch or use a Context if available. 
// But wait, App.tsx passes nothing to AppHeader.
// Let's modify AppHeader signature and update App.tsx to pass the prop.

interface AppHeaderProps {
    onNavigate?: (view: View) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex justify-between items-center bg-[var(--color-card)] p-4 rounded-lg shadow-md border-t-4 border-[var(--color-primary)]">
        <div className="flex-1 text-right">
           <h1 className="text-xl md:text-2xl font-bold text-[var(--color-primary)] mb-1">
              🔷🔶 نظام المندوب الذكي
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)]">
                المركز الأوروبي - حجة شارع مجمع الثورة
            </p>
        </div>
        
        {/* Notification Widget Area */}
        <div className="flex items-center gap-4 border-r border-[var(--color-border)] pr-4 mr-4">
            {/* Show widget if user is logged in (checked inside widget but safe here) */}
            {currentUser && onNavigate && (
                <NotificationsWidget onNavigate={onNavigate} />
            )}
            
            {currentUser && (
                 <div className="hidden md:block text-center">
                    <p className="text-xs text-[var(--color-text-muted)]">مرحباً بك</p>
                    <p className="font-bold text-sm text-[var(--color-secondary)]">{currentUser.fullName.split(' ')[0]}</p>
                 </div>
            )}
        </div>
    </div>
  );
};
