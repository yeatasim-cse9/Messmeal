import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap } from '../utils/helpers';
import { UserPlus, User, Trash2, Calendar, Copy, Tag, Plus, Loader2, Calculator, Edit2, ShieldOff, ShieldCheck } from 'lucide-react';
import { useMembers, useMeals, useExpenses, useDeposits, useUtilities, useSettings, getCurrentMonth } from '../hooks/useFirestore';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Settings() {
    const { isAdmin, userProfile } = useAuth();
    const {
        members, addMember, removeMember, updateMember, selectedMonth,
        mealCategories, billCategories, updateSettings,
        users, usersLoading
    } = useData();
    const { showAlert, showConfirm, showPrompt } = useDialog();

    const [copyState, setCopyState] = useState({ loading: false, sourceMonth: '', status: '' });
    const [newMealCat, setNewMealCat] = useState({ label: '', color: 'slate' });
    const [newBillCat, setNewBillCat] = useState({ label: '', icon: 'Calculator', billType: 'fixed' });

    if (!isAdmin) {
        return (
            <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl text-center shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-4" />
                <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>অ্যাক্সেস নেই</h2>
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>
                    এই পেজটি দেখার জন্য আপনার অ্যাডমিন অ্যাক্সেস প্রয়োজন।
                </p>
            </div>
        );
    }

    const handleAddMember = async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        if (name) {
            await addMember(name, selectedMonth);
            e.target.reset();
        }
    };

    const handleEditMember = async (id, currentName) => {
        const newName = await showPrompt('সদস্যের নতুন নাম দিন:', currentName);
        if (newName && newName !== currentName) {
            try {
                const messId = userProfile?.messId;
                if (!messId) return;
                const memberRef = doc(db, `messes/${messId}/months/${selectedMonth}/members`, id);
                await updateDoc(memberRef, { name: newName });
            } catch (err) {
                console.error(err);
                showAlert('নাম আপডেট করতে সমস্যা হয়েছে।');
            }
        }
    };

    const handleRemoveMember = async (id, name) => {
        const confirmed = await showConfirm(`আপনি কি নিশ্চিত যে ${name}-কে মুছে ফেলতে চান?\nতার সব খরচ এবং জমার হিসাব মুছে যাবে।`);
        if (confirmed) {
            await removeMember(id, selectedMonth);
        }
    };

    const handleCopyMembers = async () => {
        if (!copyState.sourceMonth) return showAlert('আগের মাস সিলেক্ট করুন');
        if (members.length > 0) {
            const confirmed = await showConfirm('বর্তমান মাসে ইতিমধ্যে মেম্বার আছে। কপি করলে তারা লিস্টে যোগ হবে। কন্টিনিউ করবেন?');
            if (!confirmed) return;
        }

        setCopyState(prev => ({ ...prev, loading: true, status: 'মেম্বার কপি হচ্ছে...' }));

        try {
            const messId = userProfile?.messId;
            if (!messId) return;
            const sourceMembersRef = collection(db, `messes/${messId}/months/${copyState.sourceMonth}/members`);
            const snapshot = await getDocs(sourceMembersRef);

            if (snapshot.empty) {
                setCopyState(prev => ({ ...prev, loading: false, status: 'ওই মাসে কোনো মেম্বার পাওয়া যায়নি!' }));
                await showAlert('ওই মাসে কোনো মেম্বার পাওয়া যায়নি!');
                return;
            }

            let count = 0;
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                const existing = members.find(m => m.name === data.name);
                if (!existing) {
                    const newRef = doc(collection(db, `messes/${messId}/months/${selectedMonth}/members`));
                    await setDoc(newRef, { name: data.name, order: members.length + count, createdAt: new Date() });
                    count++;
                }
            }

            setCopyState(prev => ({ ...prev, loading: false, status: `সাফল্য! ${count} জন মেম্বার কপি হয়েছে।` }));
            setTimeout(() => setCopyState(prev => ({ ...prev, status: '' })), 3000);
        } catch (err) {
            console.error(err);
            setCopyState(prev => ({ ...prev, loading: false, status: 'কপি করতে সমস্যা হয়েছে।' }));
            showAlert('কপি করতে সমস্যা হয়েছে।');
        }
    };

    const addMealCategory = async () => {
        if (!newMealCat.label) return;
        const newCat = { id: `meal_${Date.now()}`, ...newMealCat };
        await updateSettings({ mealCategories: [...mealCategories, newCat] });
        setNewMealCat({ label: '', color: 'slate' });
    };

    const removeMealCategory = async (id) => {
        const confirmed = await showConfirm('এই মিল ক্যাটাগরি ডিলিট করবেন?');
        if (confirmed) {
            await updateSettings({ mealCategories: mealCategories.filter(c => c.id !== id) });
        }
    };

    const addBillCategory = async () => {
        if (!newBillCat.label) return;
        const newCat = { id: `bill_${Date.now()}`, ...newBillCat };
        await updateSettings({ billCategories: [...billCategories, newCat] });
        setNewBillCat({ label: '', icon: 'Calculator', billType: 'fixed' });
    };

    const removeBillCategory = async (id) => {
        const confirmed = await showConfirm('এই ফিক্সড বিল ক্যাটাগরি ডিলিট করবেন?');
        if (confirmed) {
            await updateSettings({ billCategories: billCategories.filter(c => c.id !== id) });
        }
    };

    const handleUpdateLockTime = async (categoryId, lockTime) => {
        const updatedCats = mealCategories.map(cat =>
            cat.id === categoryId ? { ...cat, lockTime } : cat
        );
        await updateSettings({ mealCategories: updatedCats });
    };

    const handleLinkUser = async (memberId, email) => {
        try {
            await updateMember(memberId, { linkedEmail: email }, selectedMonth);
        } catch (err) {
            console.error(err);
            showAlert('ইউজার লিঙ্ক করতে সমস্যা হয়েছে।');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-0">

            {/* Month Archiving Section */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <Copy className="mr-2 sm:mr-3 text-indigo-500 shrink-0" size={20} />
                    <span className="truncate">মাস থেকে মেম্বার কপি</span>
                </h3>
                <p className="text-xs sm:text-sm mb-4 sm:mb-6 font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    আগের কোনো মাস থেকে মেম্বারদের বর্তমান মাসে কপি করুন।
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-accent)' }}>
                        <Calendar className="text-slate-400 shrink-0" size={16} />
                        <input
                            type="month"
                            value={copyState.sourceMonth}
                            onChange={e => setCopyState(p => ({ ...p, sourceMonth: e.target.value }))}
                            className="bg-transparent font-bold focus:outline-none w-full outline-none text-sm sm:text-base"
                            style={{ color: 'var(--text-primary)', colorScheme: 'dark' }}
                        />
                    </div>
                    <button
                        onClick={handleCopyMembers}
                        disabled={copyState.loading || !copyState.sourceMonth}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all disabled:opacity-50 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    >
                        {copyState.loading ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                        <span>কপি করুন</span>
                    </button>
                </div>
                {copyState.status && (
                    <p className={`mt-3 sm:mt-4 text-xs sm:text-sm font-bold ${copyState.status.includes('সাফল্য') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {copyState.status}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

                {/* Dynamic Meal Categories & Lock Times */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                        <Tag className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> মিল ক্যাটাগরি ও সময়সীমা
                    </h3>
                    <div className="space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
                        {mealCategories.map(cat => (
                            <div
                                key={cat.id}
                                className="flex flex-col p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                                style={{ backgroundColor: cat.color === 'slate' ? 'var(--bg-elevated)' : `var(--${cat.color}-dim, var(--bg-elevated))`, borderColor: 'var(--border-secondary)' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm sm:text-base truncate mr-2" style={{ color: cat.color === 'slate' ? 'var(--text-primary)' : `var(--${cat.color})` }}>{cat.label}</span>
                                    <button onClick={() => removeMealCategory(cat.id)} className="hover:text-rose-500 transition-colors shrink-0 p-1" style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <label className="text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>বন্ধ হওয়ার সময়:</label>
                                    <input
                                        type="time"
                                        value={cat.lockTime || "09:00"}
                                        onChange={(e) => handleUpdateLockTime(cat.id, e.target.value)}
                                        className="border rounded px-2 py-1 text-xs font-bold outline-none focus:ring-1 focus:ring-slate-400"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-accent)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                        <input
                            type="text"
                            placeholder="যেমন: শুক্রবার স্পেশাল"
                            value={newMealCat.label}
                            onChange={e => setNewMealCat({ ...newMealCat, label: e.target.value })}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <select
                                value={newMealCat.color}
                                onChange={e => setNewMealCat({ ...newMealCat, color: e.target.value })}
                                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border font-bold text-sm sm:text-base"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="slate">সাদা</option>
                                <option value="indigo">নীল</option>
                                <option value="emerald">সবুজ</option>
                                <option value="amber">হলুদ</option>
                            </select>
                            <button onClick={addMealCategory} className="text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand)' }}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Bill Categories */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                        <Calculator className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> ফিক্সড বিল ক্যাটাগরি
                    </h3>
                    <div className="space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
                        {billCategories.map(cat => {
                            const Icon = IconMap[cat.icon] || Calculator;
                            return (
                                <div
                                    key={cat.id}
                                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                                >
                                    <div className="flex items-center font-bold text-sm sm:text-base truncate mr-2" style={{ color: 'var(--text-primary)' }}>
                                        <Icon size={16} className="mr-2 sm:mr-3 text-slate-400 shrink-0" />
                                        <span className="truncate">{cat.label}</span>
                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${(cat.billType === 'advance') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {(cat.billType === 'advance') ? 'অগ্রিম' : 'ফিক্সড'}
                                        </span>
                                    </div>
                                    <button onClick={() => removeBillCategory(cat.id)} className="hover:text-rose-500 transition-colors shrink-0 p-1" style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                        <input
                            type="text"
                            placeholder="যেমন: গ্যাস বিল"
                            value={newBillCat.label}
                            onChange={e => setNewBillCat({ ...newBillCat, label: e.target.value })}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <select
                                value={newBillCat.billType}
                                onChange={e => setNewBillCat({ ...newBillCat, billType: e.target.value })}
                                className="flex-1 xs:flex-initial px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border font-bold text-xs sm:text-sm max-w-[90px] sm:max-w-[110px]"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="fixed">ফিক্সড</option>
                                <option value="advance">অগ্রিম</option>
                            </select>
                            <select
                                value={newBillCat.icon}
                                onChange={e => setNewBillCat({ ...newBillCat, icon: e.target.value })}
                                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border font-bold text-sm sm:text-base max-w-[100px] sm:max-w-[120px]"
                                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                {Object.keys(IconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                            </select>
                            <button onClick={addBillCategory} className="text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand)' }}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Management */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8 flex items-center justify-between flex-wrap gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="flex items-center">
                        <User className="mr-2 sm:mr-3 text-slate-400 shrink-0" size={20} />
                        মেম্বার ম্যানেজমেন্ট
                    </span>
                    <span className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{englishToBangla(members.length)} জন</span>
                </h3>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
                    <input
                        type="text"
                        name="name"
                        placeholder="সদস্যের নাম লিখুন"
                        required
                        className="flex-1 min-w-0 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-base sm:text-lg"
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" className="text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all flex items-center justify-center shrink-0 text-sm sm:text-base" style={{ backgroundColor: 'var(--brand)' }}>
                        <UserPlus className="mr-2" size={18} /> যুক্ত করুন
                    </button>
                </form>

                <div className="space-y-2.5 sm:space-y-3">
                    {members.map(member => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border hover:border-emerald-500 transition-colors group"
                            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border shrink-0" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-accent)' }}>
                                    <User size={18} className="text-slate-400 sm:hidden" />
                                    <User size={22} className="text-slate-400 hidden sm:block" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-base sm:text-[17px] truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                                    <select
                                        value={member.linkedEmail || ""}
                                        onChange={(e) => handleLinkUser(member.id, e.target.value)}
                                        className="text-[10px] sm:text-xs font-medium px-2 py-1 mt-1 rounded-md border outline-none cursor-pointer hover:border-emerald-500 transition-colors w-max appearance-none pr-6 relative"
                                        style={{ 
                                            backgroundColor: 'var(--bg-card)', 
                                            borderColor: 'var(--border-secondary)', 
                                            color: member.linkedEmail ? 'var(--emerald)' : 'var(--text-muted)',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' class='w-4 h-4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 4px center',
                                            backgroundSize: '12px'
                                        }}
                                    >
                                        <option value="" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>ইউজার লিঙ্ক করুন</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.email} style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>{u.email}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                                <button
                                    onClick={async () => {
                                        await updateMember(member.id, { billExempt: !member.billExempt }, selectedMonth);
                                    }}
                                    className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-bold border rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-[10px] sm:text-xs ${member.billExempt
                                            ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
                                            : 'text-slate-400 bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20'
                                        }`}
                                    title={member.billExempt ? 'অগ্রিম বিল থেকে বাদ' : 'অগ্রিম বিল থেকে বাদ করুন'}
                                >
                                    {member.billExempt
                                        ? <><ShieldOff size={14} /> <span className="hidden xs:inline">বিল ছাড়</span></>
                                        : <><ShieldCheck size={14} /> <span className="hidden xs:inline">সক্রিয়</span></>
                                    }
                                </button>
                                <button onClick={() => handleEditMember(member.id, member.name)} className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 font-bold border border-transparent hover:border-blue-500/20 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm" title="এডিট করুন">
                                    <Edit2 size={16} /> <span className="hidden sm:inline">এডিট</span>
                                </button>
                                <button onClick={() => handleRemoveMember(member.id, member.name)} className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 font-bold border border-transparent hover:border-rose-500/20 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm" title="ডিলিট করুন">
                                    <Trash2 size={16} /> <span className="hidden sm:inline">ডিলিট</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="p-8 sm:p-10 rounded-xl sm:rounded-[20px] text-center border text-sm sm:text-base" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                            কোনো মেম্বার পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
