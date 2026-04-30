import React, { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
    Users as UsersIcon, Shield, ShieldCheck, Trash2, 
    User as UserIcon, Mail, Key, Sparkles, CheckCircle2,
    Calendar, ArrowRight, Fingerprint, Plus, UserPlus, X, Lock, Eye, EyeOff,
    Activity, LayoutGrid, ListFilter
} from 'lucide-react';

export default function Users() {
    const { isAdmin, user: currentUser, createUserByAdmin } = useAuth();
    const { users, loading, updateUserRole, deleteUserRecord } = useUsers();
    const { showConfirm, showAlert } = useDialog();

    // New User Form State
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);

    const adminCount = useMemo(() => {
        return users.filter(u => u.role === 'admin').length;
    }, [users]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-12 rounded-xl sm:rounded-2xl border shadow-xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400"></div>
                <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-8 shadow-inner rotate-3 transition-transform ring-8 ring-rose-500/5">
                    <Shield size={48} />
                </div>
                <div className="mt-10 p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 italic text-slate-400 text-sm">
                    🔒 Administrative Access Required
                </div>
            </div>
        );
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            await showAlert("সবগুলো তথ্য সঠিকভাবে পূরণ করুন!");
            return;
        }
        if (formData.password.length < 6) {
            await showAlert("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে!");
            return;
        }

        setIsCreating(true);
        try {
            await createUserByAdmin(formData.email, formData.password, formData.name);
            await showAlert("সফলভাবে নতুন ইউজার তৈরি করা হয়েছে!");
            setFormData({ name: '', email: '', password: '' });
            setIsAddingMode(false);
        } catch (error) {
            console.error("Create user error:", error);
            if (error.code === 'auth/email-already-in-use') {
                await showAlert("এই ইমেইলটি ইতিপূর্বেই ব্যবহার করা হয়েছে!");
            } else {
                await showAlert("ইউজার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleRoleUpdate = async (uid, currentRole, name) => {
        if (uid === currentUser.uid) {
            await showAlert("নিরাপত্তার খাতিরে আপনি নিজের রোল পরিবর্তন করতে পারবেন না!");
            return;
        }
        const newRole = currentRole === 'admin' ? 'viewer' : 'admin';
        const confirmed = await showConfirm(`${name}-কে ${newRole === 'admin' ? 'অ্যাডমিন' : 'ভিউয়ার'} হিসেবে পদোন্নতি/পদাবনতি করতে চান?`);
        if (confirmed) {
            await updateUserRole(uid, newRole);
        }
    };

    const handleResetPassword = async (email, name) => {
        const confirmed = await showConfirm(`আপনি কি "${name}"-কে একটি সিকিউর পাসওয়ার্ড রিসেট লিংক পাঠাতে চান?`);
        if (confirmed) {
            try {
                await sendPasswordResetEmail(auth, email);
                await showAlert("সফলভাবে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। ইউজার তার ইনবক্স চেক করতে বলুন।");
            } catch (error) {
                console.error("Reset error:", error);
                await showAlert("লিংক পাঠানো সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন।");
            }
        }
    };

    const handleDeleteUser = async (uid, name) => {
        if (uid === currentUser.uid) {
            await showAlert("সিস্টেম এরর: আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না!");
            return;
        }
        const confirmed = await showConfirm(`আপনি কি নিশ্চিত? এটি "${name}"-এর ক্লাউড ডেটা স্থায়ীভাবে মুছে ফেলবে।`);
        if (confirmed) {
            await deleteUserRecord(uid);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden p-8 sm:p-14 rounded-xl sm:rounded-2xl shadow-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                
                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                            <ShieldCheck size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase text-indigo-500">Administrative Suite</span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
                            ইউজার <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">ম্যানেজমেন্ট</span>
                        </h1>
                        <p className="max-w-2xl text-base sm:text-lg font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            অ্যাপের সকল সদস্যদের রোল পরিচালনা করুন এবং তাদের এক্সেস লেভেল সেট করুন।
                        </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                        <button 
                            onClick={() => setIsAddingMode(!isAddingMode)}
                            className={`flex items-center justify-center gap-3 px-8 py-5 rounded-xl sm:rounded-2xl font-black text-sm uppercase transition-all active:scale-95 group relative overflow-hidden ${
                                isAddingMode 
                                ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/20' 
                                : 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-700'
                            }`}
                        >
                            {isAddingMode ? (
                                <><X size={20} className="relative z-10" /> <span className="relative z-10">বন্ধ করুন</span></>
                            ) : (
                                <><Plus size={20} className="relative z-10" /> <span className="relative z-10">নতুন সদস্য যোগ দিন</span></>
                            )}
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 px-6 py-4 rounded-xl sm:rounded-2xl border group" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                                    <UsersIcon size={24} className="text-indigo-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{users.length}</span>
                                    <span className="text-[10px] font-black uppercase mt-1" style={{ color: 'var(--text-muted)' }}>সক্রিয় সদস্য</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 px-6 py-4 rounded-xl sm:rounded-2xl border group" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={24} className="text-emerald-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-emerald-500 leading-none">{adminCount}</span>
                                    <span className="text-[10px] font-black uppercase mt-1" style={{ color: 'var(--text-muted)' }}>বর্তমান অ্যাডমিন</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            {isAddingMode && (
                <div className="p-8 sm:p-10 rounded-xl sm:rounded-2xl border shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                                <UserPlus size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>নতুন ইউজার একাউন্ট</h3>
                                <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>মেম্বারের জন্য সিকিউর এক্সেস তৈরি করুন</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[11px] font-black uppercase ml-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <UserIcon size={12} className="text-indigo-500" /> ইউজারের নাম
                                </label>
                                <input 
                                    type="text"
                                    placeholder="পার্থ প্রতীম"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 rounded-xl sm:rounded-2xl border focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 font-bold outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[11px] font-black uppercase ml-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <Mail size={12} className="text-indigo-500" /> ইমেইল অ্যাড্রেস
                                </label>
                                <input 
                                    type="email"
                                    placeholder="user@messmeal.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-5 py-4 rounded-xl sm:rounded-2xl border focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 font-bold outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-[11px] font-black uppercase ml-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <Lock size={12} className="text-indigo-500" /> পাসওয়ার্ড (min. 6 chars)
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full px-5 pr-14 py-4 rounded-xl sm:rounded-2xl border focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 font-bold outline-none transition-all"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 hover:text-indigo-500 transition-colors"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-12 pt-4 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full md:w-auto px-16 py-4 rounded-xl sm:rounded-2xl bg-[#0F172A] text-white font-black uppercase shadow-2xl hover:bg-black active:scale-95 transition-all disabled:bg-slate-200 flex items-center justify-center gap-4 group"
                                >
                                    {isCreating ? (
                                        <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> তৈরি হচ্ছে...</>
                                    ) : (
                                        <><span className="text-indigo-400 group-hover:translate-x-1 transition-transform"><ArrowRight size={20} /></span> অ্যাকাউন্ট তৈরি করুন</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="py-40 text-center rounded-xl sm:rounded-2xl border border-dashed" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-accent)' }}>
                    <div className="relative w-24 h-24 mx-auto mb-10">
                        <div className="absolute inset-0 border-[6px] border-t-indigo-600 rounded-full animate-spin" style={{ borderColor: 'var(--border-primary)' }}></div>
                    </div>
                    <p className="font-black uppercase text-[10px] animate-pulse" style={{ color: 'var(--text-muted)' }}>Establishing Secure Stream</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-2 font-black text-[11px] uppercase" style={{ color: 'var(--text-muted)' }}>
                            <Activity size={14} className="text-emerald-500" /> মেস ডিরেক্টরি
                        </div>
                        <div className="flex gap-2">
                            <div className="p-2 bg-indigo-600 text-white rounded-lg"><LayoutGrid size={16} /></div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map((u) => (
                            <div 
                                key={u.id}
                                className={`group relative p-8 rounded-xl sm:rounded-2xl border transition-all duration-500 hover:-translate-y-2 ${
                                    u.role === 'admin' 
                                    ? 'border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                    : ''
                                }`}
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: u.role === 'admin' ? '' : 'var(--border-primary)' }}
                            >
                                <div className="flex items-center gap-5 mb-10">
                                    <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-700 ${
                                        u.role === 'admin' 
                                        ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' 
                                        : 'shadow-inner'
                                    }`} style={u.role !== 'admin' ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', borderColor: 'var(--border-primary)' } : {}}>
                                        <UserIcon size={30} />
                                        {u.role === 'admin' ? (
                                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1 rounded-lg border-2" style={{ borderColor: 'var(--bg-card)' }}>
                                                <ShieldCheck size={14} />
                                            </div>
                                        ) : (
                                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg border-2" style={{ borderColor: 'var(--bg-card)' }}>
                                                <CheckCircle2 size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xl font-black truncate leading-none mb-1.5 transition-colors group-hover:text-indigo-500" style={{ color: 'var(--text-primary)' }}>
                                            {u.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mb-10">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>
                                        <Calendar size={14} className="opacity-50" />
                                        <span>জিম্মাদার: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD', { month: 'short', year: 'numeric' }) : '২০২৪'}</span>
                                    </div>
                                    <div className={`px-4 py-1.5 text-[10px] font-black rounded-lg border flex items-center gap-1.5 ${
                                        u.role === 'admin' 
                                        ? 'bg-indigo-600 text-white border-indigo-500' 
                                        : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                    }`}>
                                        <Fingerprint size={10} /> {u.role === 'admin' ? 'অ্যাডমিন' : 'সদস্য'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleRoleUpdate(u.id, u.role, u.name)}
                                        className={`flex items-center justify-center gap-2 py-4 rounded-xl sm:rounded-2xl font-black text-[11px] transition-all border ${
                                            u.role === 'admin' 
                                            ? 'hover:bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                            : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                                        }`}
                                    >
                                        <Shield size={14} /> {u.role === 'admin' ? 'রোল বদলান' : 'অ্যাডমিন করুন'}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleResetPassword(u.email, u.name)}
                                        className="flex items-center justify-center gap-2 py-4 rounded-xl sm:rounded-2xl font-black text-[11px] transition-all border hover:border-indigo-500/50"
                                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-secondary)' }}
                                    >
                                        <Key size={14} className="text-amber-500" /> রিসেট লিংক
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                        className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-xl sm:rounded-2xl font-black text-[11px] transition-all hover:bg-rose-500/10 hover:text-rose-500"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <Trash2 size={16} /> পার্মানেন্ট ডিলিট
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
