import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap } from '../utils/helpers';
import { UserPlus, User, Trash2, Calendar, Copy, Tag, Plus, Loader2, Calculator, Edit2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Settings() {
    const { isAdmin } = useAuth();
    const {
        members, addMember, removeMember, selectedMonth,
        mealCategories, billCategories, updateSettings
    } = useData();
    const { showAlert, showConfirm, showPrompt } = useDialog();

    const [copyState, setCopyState] = useState({ loading: false, sourceMonth: '', status: '' });
    const [newMealCat, setNewMealCat] = useState({ label: '', color: 'slate' });
    const [newBillCat, setNewBillCat] = useState({ label: '', icon: 'Calculator' });

    if (!isAdmin) {
        return (
            <div className="bg-white p-10 rounded-3xl text-center shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">অ্যাক্সেস ডিনাইড</h2>
                <p className="text-slate-500 mt-2">এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।</p>
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
                const memberRef = doc(db, `months/${selectedMonth}/members`, id);
                await updateDoc(memberRef, { name: newName });
                // We don't have updateMember in DataContext, but it listens in real-time, so it will auto-update!
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
            const sourceMembersRef = collection(db, `months/${copyState.sourceMonth}/members`);
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
                    const newRef = doc(collection(db, `months/${selectedMonth}/members`));
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
        setNewBillCat({ label: '', icon: 'Calculator' });
    };

    const removeBillCategory = async (id) => {
        const confirmed = await showConfirm('এই ফিক্সড বিল ক্যাটাগরি ডিলিট করবেন?');
        if (confirmed) {
            await updateSettings({ billCategories: billCategories.filter(c => c.id !== id) });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Month Archiving Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 sm:p-10 rounded-[32px] shadow-sm border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-2 flex items-center">
                    <Copy className="mr-3 text-indigo-500" size={24} /> মাস থেকে মেম্বার কপি (আর্কাইভ)
                </h3>
                <p className="text-indigo-700 text-sm mb-6 font-medium">আগের কোনো মাস থেকে মেম্বারদের বর্তমান মাসে কপি করুন। এতে বারবার নাম টাইপ করতে হবে না।</p>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50">
                    <div className="flex items-center space-x-3 w-full sm:w-auto bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                        <Calendar className="text-slate-400" size={18} />
                        <input
                            type="month"
                            value={copyState.sourceMonth}
                            onChange={e => setCopyState(p => ({ ...p, sourceMonth: e.target.value }))}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none w-full outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCopyMembers}
                        disabled={copyState.loading || !copyState.sourceMonth}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {copyState.loading ? <Loader2 size={18} className="animate-spin" /> : <Copy size={18} />}
                        <span>এই মাসে কপি করুন</span>
                    </button>
                </div>
                {copyState.status && (
                    <p className={`mt-4 text-sm font-bold ${copyState.status.includes('সাফল্য') ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {copyState.status}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Dynamic Meal Categories */}
                <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Tag className="text-slate-400 mr-3" size={24} /> মিল ক্যাটাগরি
                    </h3>
                    <div className="space-y-4 mb-6">
                        {mealCategories.map(cat => (
                            <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border bg-${cat.color}-50 border-${cat.color}-100`}>
                                <span className={`font-bold text-${cat.color}-700`}>{cat.label}</span>
                                <button onClick={() => removeMealCategory(cat.id)} className={`text-${cat.color}-400 hover:text-rose-500 transition-colors`}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" placeholder="যেমন: শুক্রবার স্পেশাল" value={newMealCat.label} onChange={e => setNewMealCat({ ...newMealCat, label: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700" />
                        <select value={newMealCat.color} onChange={e => setNewMealCat({ ...newMealCat, color: e.target.value })} className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold">
                            <option value="slate">সাদা</option><option value="indigo">নীল</option><option value="emerald">সবুজ</option><option value="amber">হলুদ</option>
                        </select>
                        <button onClick={addMealCategory} className="bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold flex items-center justify-center shrink-0">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Dynamic Bill Categories */}
                <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Calculator className="text-slate-400 mr-3" size={24} /> ফিক্সড বিল ক্যাটাগরি
                    </h3>
                    <div className="space-y-4 mb-6">
                        {billCategories.map(cat => {
                            const Icon = IconMap[cat.icon] || Calculator;
                            return (
                                <div key={cat.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                                    <div className="flex items-center text-slate-700 font-bold">
                                        <Icon size={18} className="mr-3 text-slate-400" /> {cat.label}
                                    </div>
                                    <button onClick={() => removeBillCategory(cat.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" placeholder="যেমন: গ্যাস বিল" value={newBillCat.label} onChange={e => setNewBillCat({ ...newBillCat, label: e.target.value })} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700" />
                        <select value={newBillCat.icon} onChange={e => setNewBillCat({ ...newBillCat, icon: e.target.value })} className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold max-w-[120px]">
                            {Object.keys(IconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                        </select>
                        <button onClick={addBillCategory} className="bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold flex items-center justify-center shrink-0">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Management */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center justify-between">
                    <span>মেম্বার ম্যানেজমেন্ট</span>
                    <span className="text-sm font-medium text-slate-400 bg-slate-50 px-4 py-2 rounded-lg">{englishToBangla(members.length)} জন</span>
                </h3>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 mb-10">
                    <input type="text" name="name" placeholder="সদস্যের নাম লিখুন" required className="flex-1 px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-lg" />
                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center shrink-0">
                        <UserPlus className="mr-2" size={20} /> যুক্ত করুন
                    </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md bg-white transition-all group">
                            <div className="flex items-center space-x-3 truncate pl-1">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0"><User size={18} className="text-slate-400" /></div>
                                <span className="font-bold text-slate-800 truncate">{member.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditMember(member.id, member.name)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="এডিট করুন"><Edit2 size={16} /></button>
                                <button onClick={() => handleRemoveMember(member.id, member.name)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="ডিলিট করুন"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && <div className="col-span-full text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">কোনো মেম্বার নেই</div>}
                </div>
            </div>

        </div>
    );
}
