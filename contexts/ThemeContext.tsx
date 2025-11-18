import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { themes, ThemeName, Theme } from '../themes';

interface ThemeContextType {
    theme: Theme;
    setThemeName: (name: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeName>(() => {
        try {
            const storedTheme = window.localStorage.getItem('app-theme');
            return (storedTheme && themes[storedTheme as ThemeName]) ? (storedTheme as ThemeName) : 'default';
        } catch (error) {
            console.error('Failed to read theme from localStorage', error);
            return 'default';
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('app-theme', themeName);
        } catch (error) {
            console.error('Failed to save theme to localStorage', error);
        }
        
        const selectedTheme = themes[themeName];
        const root = window.document.documentElement;
        Object.entries(selectedTheme.colors).forEach(([key, value]) => {
            // FIX: Cast value to string, as `Object.entries` can infer a broad `unknown` type which is not compatible with `setProperty`.
            root.style.setProperty(key, value as string);
        });

    }, [themeName]);

    const theme = themes[themeName];
    const contextValue = { theme, setThemeName };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
