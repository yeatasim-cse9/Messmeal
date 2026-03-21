import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const { login, signup, loginWithGoogle } = useAuth();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                if (password.length < 6) {
                    setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
                    setLoading(false);
                    return;
                }
                await signup(email, password, name);
            } else {
                await login(email, password);
            }
        } catch (err) {
            const code = err.code;
            if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
                setError('イমেইল বা পাসওয়ার্ড ভুল হয়েছে');
            } else if (code === 'auth/email-already-in-use') {
                setError('এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি হয়েছে');
            } else if (code === 'auth/weak-password') {
                setError('পাসওয়ার্ড আরও শক্তিশালী করুন');
            } else if (code === 'auth/invalid-email') {
                setError('সঠিক ইমেইল দিন');
            } else {
                setError('কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।');
            }
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('গুগল লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 sm:py-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6 sm:mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1A3A2A] text-white flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-xl shadow-[#1A3A2A]/20">
                        <Utensils size={28} className="sm:hidden" />
                        <Utensils size={32} className="hidden sm:block" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        মেস হিসাব BU Hunters
                    </h1>
                    <p className="text-slate-400 mt-1.5 sm:mt-2 font-medium text-sm sm:text-base">
                        মেসের সব হিসাব এক জায়গায়
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_2px_30px_-8px_rgba(0,0,0,0.06)] border border-slate-50">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-5 sm:mb-8">
                        {isSignup ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
                    </h2>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium overflow-hidden mb-4">
                            {error}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-2 sm:space-x-3 border-2 border-slate-200 hover:border-slate-300 active:bg-slate-100 bg-white hover:bg-slate-50 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>গুগল দিয়ে লগইন</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-4 sm:my-6">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="px-3 sm:px-4 text-xs sm:text-sm text-slate-400 font-medium">অথবা</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
                        {isSignup && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">আপনার নাম</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="আপনার নাম"
                                        required
                                        className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-slate-900 font-medium text-slate-800 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">ইমেইল</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-slate-900 font-medium text-slate-800 transition-all text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">পাসওয়ার্ড</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 focus:bg-white focus:border-slate-900 font-medium text-slate-800 transition-all text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F172A] hover:bg-slate-800 active:bg-slate-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 sm:space-x-3 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-60 disabled:cursor-not-allowed mt-1 sm:mt-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignup ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 sm:mt-8 text-center">
                        <button
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            {isSignup ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-300 mt-6 sm:mt-8 font-medium">
                    মেস হিসাব © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
