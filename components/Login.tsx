import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--color-card)] shadow-2xl rounded-lg p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-[var(--color-primary)]">نظام المندوب الذكي</h1>
                        <p className="mt-1 text-[var(--color-text-muted)]">المركز الأوروبي</p>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-center text-[var(--color-text-base)] mb-2">👤 تسجيل الدخول</h2>
                    <p className="text-center text-[var(--color-text-muted)] mb-6">مرحباً بك، يرجى إدخال بياناتك للوصول للنظام.</p>
                    
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{error}</p></div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[var(--color-text-base)] font-semibold mb-2" htmlFor="username">
                                اسم المستخدم
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-card)] text-[var(--color-text-base)]"
                                placeholder="e.g., admin"
                            />
                        </div>
                        <div>
                            <label className="block text-[var(--color-text-base)] font-semibold mb-2" htmlFor="password">
                                كلمة المرور
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-[var(--color-card)] text-[var(--color-text-base)]"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[var(--color-secondary)] text-[var(--color-primary-text)] font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-secondary-hover)] transition-colors duration-300 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};