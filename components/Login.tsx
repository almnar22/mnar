
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-secondary)] opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[var(--color-card)]/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white mb-4 shadow-lg">
                             <span className="text-4xl">🎓</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-1">نظام المندوب الذكي</h1>
                        <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide">المركز الأوروبي للتدريب</p>
                    </div>
                    
                    <h2 className="text-xl font-bold text-center text-[var(--color-text-base)] mb-6 flex items-center justify-center gap-2 after:content-[''] after:h-px after:w-12 after:bg-gray-300 after:ml-4 before:content-[''] before:h-px before:w-12 before:bg-gray-300 before:mr-4">
                        تسجيل الدخول
                    </h2>
                    
                    {error && (
                        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg text-sm shadow-sm flex items-center gap-2" role="alert">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-1" htmlFor="username">
                                اسم المستخدم
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-white/50 text-[var(--color-text-base)] shadow-sm"
                                    placeholder="اسم المستخدم الخاص بك"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-muted)] mb-1" htmlFor="password">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition bg-white/50 text-[var(--color-text-base)] shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-[var(--color-primary-text)] font-bold py-3.5 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        جاري التحقق...
                                    </span>
                                ) : 'تسجيل الدخول'}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 text-center text-xs text-[var(--color-text-muted)] opacity-80">
                        &copy; {new Date().getFullYear()} المركز الأوروبي. جميع الحقوق محفوظة.
                    </div>
                </div>
            </div>
            
            {/* Inline Styles for animation */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
