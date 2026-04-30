import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap } from '../utils/helpers';
import { UserPlus, User, Trash2, Calendar, Copy, Tag, Plus, Loader2, Calculator, Edit2, ShieldOff, ShieldCheck, Link2, ChevronDown } from 'lucide-react';
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
                <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>অ্যাক্সেস নেই</h2>
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>এই পেজটি দেখার জন্য আপনার অ্যাডমিন অ্যাক্সেস প্রয়োজন।</p>
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
                showAlert('নাম আপডেট করতে সমস্যা হয়েছে।');
            }
        }
    };

    const handleRemoveMember = async (id, name) => {
        const confirmed = await showConfirm(`আপনি কি নিশ্চিত যে ${name}-কে মুছে ফেলতে চান?\nতার সব খরচ এবং জমার হিসাব মুছে যাবে।`);
        if (confirmed) await removeMember(id, selectedMonth);
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
        if (confirmed) await updateSettings({ mealCategories: mealCategories.filter(c => c.id !== id) });
    };

    const addBillCategory = async () => {
        if (!newBillCat.label) return;
        const newCat = { id: `bill_${Date.now()}`, ...newBillCat };
        await updateSettings({ billCategories: [...billCategories, newCat] });
        setNewBillCat({ label: '', icon: 'Calculator', billType: 'fixed' });
    };

    const removeBillCategory = async (id) => {
        const confirmed = await showConfirm('এই ফিক্সড বিল ক্যাটাগরি ডিলিট করবেন?');
        if (confirmed) await updateSettings({ billCategories: billCategories.filter(c => c.id !== id) });
    };

    const handleUpdateLockTime = async (categoryId, lockTime) => {
        const updatedCats = mealCategories.map(cat => cat.id === categoryId ? { ...cat, lockTime } : cat);
        await updateSettings({ mealCategories: updatedCats });
    };

    const handleLinkUser = async (memberId, email) => {
        try {
            await updateMember(memberId, { linkedEmail: email }, selectedMonth);
        } catch (err) {
            showAlert('ইউজার লিঙ্ক করতে সমস্যা হয়েছে।');
        }
    };

    /* ── Section wrapper component ── */
    const SectionCard = ({ icon: Icon, iconColor = 'text-slate-400', title, badge, children }) => (
        <div className="rounded-2xl sm:rounded-3xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={18} className={`shrink-0 ${iconColor}`} />
                    <h3 className="font-black text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                </div>
                {badge}
            </div>
            <div className="p-5 sm:p-7">{children}</div>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 pb-10">

            {/* ── 1. Copy Members ── */}
            <SectionCard icon={Copy} iconColor="text-indigo-400" title="মাস থেকে মেম্বার কপি">
                <p className="text-xs sm:text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                    আগের কোনো মাস থেকে মেম্বারদের বর্তমান মাসে কপি করুন।
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                        <Calendar size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                        <input
                            type="month"
                            value={copyState.sourceMonth}
                            onChange={e => setCopyState(p => ({ ...p, sourceMonth: e.target.value }))}
                            className="bg-transparent font-bold focus:outline-none flex-1 text-sm"
                            style={{ color: 'var(--text-primary)', colorScheme: 'dark' }}
                        />
                    </div>
                    <button
                        onClick={handleCopyMembers}
                        disabled={copyState.loading || !copyState.sourceMonth}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 active:scale-95 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                    >
                        {copyState.loading ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                        কপি করুন
                    </button>
                </div>
                {copyState.status && (
                    <p className={`mt-3 text-xs font-bold px-3 py-2 rounded-lg ${copyState.status.includes('সাফল্য') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-400'}`}>
                        {copyState.status}
                    </p>
                )}
            </SectionCard>

            {/* ── 2. Meal + Bill Categories (stacked on mobile) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* Meal Categories */}
                <SectionCard icon={Tag} iconColor="text-amber-400" title="মিল ক্যাটাগরি ও সময়">
                    <div className="space-y-2.5 mb-4">
                        {mealCategories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-xl border"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${cat.color === 'indigo' ? 'bg-indigo-500' : cat.color === 'emerald' ? 'bg-emerald-500' : cat.color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
                                    <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <input
                                        type="time"
                                        value={cat.lockTime || "09:00"}
                                        onChange={(e) => handleUpdateLockTime(cat.id, e.target.value)}
                                        className="border rounded-lg px-2 py-1 text-xs font-bold outline-none focus:ring-1 focus:ring-slate-400 w-[85px]"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-accent)', color: 'var(--text-primary)', colorScheme: 'dark' }}
                                    />
                                    <button onClick={() => removeMealCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all" style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Add new meal category */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="নতুন ক্যাটাগরির নাম"
                            value={newMealCat.label}
                            onChange={e => setNewMealCat({ ...newMealCat, label: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && addMealCategory()}
                            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2">
                            <select
                                value={newMealCat.color}
                                onChange={e => setNewMealCat({ ...newMealCat, color: e.target.value })}
                                className="flex-1 px-3 py-2.5 rounded-xl border font-bold text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="slate">⬜ সাদা</option>
                                <option value="indigo">🔵 নীল</option>
                                <option value="emerald">🟢 সবুজ</option>
                                <option value="amber">🟡 হলুদ</option>
                            </select>
                            <button onClick={addMealCategory}
                                className="px-4 py-2.5 rounded-xl text-white font-bold flex items-center gap-1.5 text-sm transition-all active:scale-95"
                                style={{ backgroundColor: 'var(--brand)' }}>
                                <Plus size={16} /> যোগ করুন
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* Bill Categories */}
                <SectionCard icon={Calculator} iconColor="text-blue-400" title="ফিক্সড বিল ক্যাটাগরি">
                    <div className="space-y-2.5 mb-4">
                        {billCategories.map(cat => {
                            const Icon = IconMap[cat.icon] || Calculator;
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-3.5 rounded-xl border"
                                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                                        <Icon size={15} className="text-slate-400 shrink-0" />
                                        <span className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${cat.billType === 'advance' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                            {cat.billType === 'advance' ? 'অগ্রিম' : 'ফিক্সড'}
                                        </span>
                                    </div>
                                    <button onClick={() => removeBillCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0" style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {/* Add new bill category */}
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="নতুন বিলের নাম (যেমন: গ্যাস বিল)"
                            value={newBillCat.label}
                            onChange={e => setNewBillCat({ ...newBillCat, label: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && addBillCategory()}
                            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2">
                            <select
                                value={newBillCat.billType}
                                onChange={e => setNewBillCat({ ...newBillCat, billType: e.target.value })}
                                className="flex-1 px-3 py-2.5 rounded-xl border font-bold text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="fixed">ফিক্সড</option>
                                <option value="advance">অগ্রিম</option>
                            </select>
                            <select
                                value={newBillCat.icon}
                                onChange={e => setNewBillCat({ ...newBillCat, icon: e.target.value })}
                                className="flex-1 px-3 py-2.5 rounded-xl border font-bold text-sm"
                                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                            >
                                {Object.keys(IconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                            </select>
                            <button onClick={addBillCategory}
                                className="px-4 py-2.5 rounded-xl text-white font-bold flex items-center gap-1.5 text-sm transition-all active:scale-95 shrink-0"
                                style={{ backgroundColor: 'var(--brand)' }}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* ── 3. Member Management ── */}
            <SectionCard
                icon={User}
                iconColor="text-emerald-400"
                title="মেম্বার ম্যানেজমেন্ট"
                badge={
                    <span className="text-xs font-black px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        {englishToBangla(members.length)} জন
                    </span>
                }
            >
                {/* Add member form */}
                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2.5 mb-5">
                    <input
                        type="text"
                        name="name"
                        placeholder="সদস্যের নাম লিখুন..."
                        required
                        className="flex-1 min-w-0 px-4 py-3.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20 shrink-0 sm:w-auto w-full"
                        style={{ backgroundColor: 'var(--brand)' }}>
                        <UserPlus size={16} /> যুক্ত করুন
                    </button>
                </form>

                {/* Members list */}
                <div className="space-y-2.5">
                    {members.map(member => (
                        <div key={member.id} className="rounded-xl border overflow-hidden transition-all hover:border-emerald-500/50"
                            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                            {/* Member top row */}
                            <div className="flex items-center gap-3 p-3.5 sm:p-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shrink-0"
                                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-accent)' }}>
                                    <User size={18} className="text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                                    {/* Linked user dropdown */}
                                    <div className="relative mt-1.5">
                                        <select
                                            value={member.linkedEmail || ""}
                                            onChange={(e) => handleLinkUser(member.id, e.target.value)}
                                            className="text-[11px] font-bold pl-2 pr-6 py-1 rounded-lg border outline-none cursor-pointer hover:border-emerald-500 transition-colors appearance-none w-full max-w-[180px] sm:max-w-[220px]"
                                            style={{
                                                backgroundColor: 'var(--bg-elevated)',
                                                borderColor: member.linkedEmail ? 'rgba(16,185,129,0.4)' : 'var(--border-accent)',
                                                color: member.linkedEmail ? 'var(--emerald)' : 'var(--text-muted)',
                                            }}
                                        >
                                            <option value="">🔗 ইউজার লিঙ্ক করুন</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.email}>{u.email}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                </div>
                            </div>
                            {/* Member actions row */}
                            <div className="flex border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                <button
                                    onClick={async () => await updateMember(member.id, { billExempt: !member.billExempt }, selectedMonth)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all ${member.billExempt ? 'text-amber-500 hover:bg-amber-500/10' : 'hover:bg-slate-500/10'}`}
                                    style={!member.billExempt ? { color: 'var(--text-muted)' } : {}}>
                                    {member.billExempt ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                                    <span>{member.billExempt ? 'বিল ছাড়' : 'সক্রিয়'}</span>
                                </button>
                                <div className="w-px" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                                <button onClick={() => handleEditMember(member.id, member.name)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all hover:bg-blue-500/10 hover:text-blue-500"
                                    style={{ color: 'var(--text-muted)' }}>
                                    <Edit2 size={13} /> এডিট
                                </button>
                                <div className="w-px" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                                <button onClick={() => handleRemoveMember(member.id, member.name)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500"
                                    style={{ color: 'var(--text-muted)' }}>
                                    <Trash2 size={13} /> ডিলিট
                                </button>
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="py-10 text-center rounded-xl border border-dashed" style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                            <User size={32} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm font-bold">কোনো মেম্বার পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}
