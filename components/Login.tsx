
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative overflow-hidden font-sans">
            
            {/* Animated Background Shapes (Blue & Light Orange) */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
            <div className="absolute top-[20%] right-[10%] w-[200px] h-[200px] bg-orange-300/30 rounded-full blur-[60px] animate-float"></div>

            <div className="w-full max-w-md z-10 px-6">
                <div className="bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl overflow-hidden border border-white/50 animate-fade-in-up relative">
                    
                    {/* Top Decoration Gradient Line */}
                    <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-orange-400 to-blue-600"></div>

                    <div className="p-8 md:p-10">
                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)] relative group border border-blue-100">
                                <div className="absolute inset-0 rounded-full bg-blue-600/5 group-hover:scale-110 transition-transform duration-500"></div>
                                <span className="text-5xl drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300">🎓</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">نظام المندوب الذكي</h1>
                            <p className="text-sm font-bold text-orange-500 uppercase tracking-wider">المركز الأوروبي للتدريب</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 mb-6 rounded-xl text-sm shadow-sm flex items-center gap-3 animate-shake">
                                <span className="text-xl">⚠️</span>
                                <p className="font-bold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Input */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mr-1" htmlFor="username">
                                    اسم المستخدم
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedInput === 'username' ? 'transform scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-colors ${focusedInput === 'username' ? 'text-blue-600' : ''}`}>
                                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedInput('username')}
                                        onBlur={() => setFocusedInput(null)}
                                        required
                                        className="w-full pr-11 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800 font-bold placeholder-gray-400 shadow-sm"
                                        placeholder="أدخل اسم المستخدم"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mr-1" htmlFor="password">
                                    كلمة المرور
                                </label>
                                <div className={`relative transition-all duration-300 ${focusedInput === 'password' ? 'transform scale-[1.02]' : ''}`}>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-colors ${focusedInput === 'password' ? 'text-blue-600' : ''}`}>
                                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        required
                                        className="w-full pr-11 pl-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800 font-bold placeholder-gray-400 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    {/* Shine Effect on Hover */}
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>

                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>جاري التحقق...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>تسجيل الدخول الآمن</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        
                        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                             <span>🔒</span>
                             <span>جميع البيانات مشفرة ومحمية</span>
                        </div>
                    </div>
                </div>
                 <p className="text-center mt-8 text-blue-200/60 text-sm font-medium animate-fade-in">
                    &copy; {new Date().getFullYear()} المركز الأوروبي للتدريب. جميع الحقوق محفوظة.
                </p>
            </div>
            
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulseSlow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in {
                    animation: fadeInUp 1s ease-out forwards;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 8s ease-in-out infinite;
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
};
