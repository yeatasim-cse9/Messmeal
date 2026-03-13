import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap } from '../utils/helpers';
import { UserPlus, User, Trash2, Calendar, Copy, Tag, Plus, Loader2, Calculator, Edit2, ShieldOff, ShieldCheck } from 'lucide-react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};
import { db } from '../lib/firebase';

export default function Settings() {
    const { isAdmin } = useAuth();
    const {
        members, addMember, removeMember, updateMember, selectedMonth,
        mealCategories, billCategories, updateSettings
    } = useData();
    const { showAlert, showConfirm, showPrompt } = useDialog();

    const [copyState, setCopyState] = useState({ loading: false, sourceMonth: '', status: '' });
    const [newMealCat, setNewMealCat] = useState({ label: '', color: 'slate' });
    const [newBillCat, setNewBillCat] = useState({ label: '', icon: 'Calculator', billType: 'fixed' });

    if (!isAdmin) {
        return (
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl text-center shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">অ্যাক্সেস ডিনাইড</h2>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।</p>
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
        setNewBillCat({ label: '', icon: 'Calculator', billType: 'fixed' });
    };

    const removeBillCategory = async (id) => {
        const confirmed = await showConfirm('এই ফিক্সড বিল ক্যাটাগরি ডিলিট করবেন?');
        if (confirmed) {
            await updateSettings({ billCategories: billCategories.filter(c => c.id !== id) });
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500 px-0"
        >

            {/* Month Archiving Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-indigo-100">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-indigo-900 mb-1.5 sm:mb-2 flex items-center">
                    <Copy className="mr-2 sm:mr-3 text-indigo-500 shrink-0" size={20} />
                    <span className="truncate">মাস থেকে মেম্বার কপি</span>
                </h3>
                <p className="text-indigo-700 text-xs sm:text-sm mb-4 sm:mb-6 font-medium leading-relaxed">
                    আগের কোনো মাস থেকে মেম্বারদের বর্তমান মাসে কপি করুন।
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-indigo-50">
                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto bg-slate-50 px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border border-slate-100">
                        <Calendar className="text-slate-400 shrink-0" size={16} />
                        <input
                            type="month"
                            value={copyState.sourceMonth}
                            onChange={e => setCopyState(p => ({ ...p, sourceMonth: e.target.value }))}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none w-full outline-none text-sm sm:text-base"
                        />
                    </div>
                    <button
                        onClick={handleCopyMembers}
                        disabled={copyState.loading || !copyState.sourceMonth}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all disabled:opacity-50 text-sm sm:text-base"
                    >
                        {copyState.loading ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                        <span>কপি করুন</span>
                    </button>
                </div>
                {copyState.status && (
                    <p className={`mt-3 sm:mt-4 text-xs sm:text-sm font-bold ${copyState.status.includes('সাফল্য') ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {copyState.status}
                    </p>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">

                {/* Dynamic Meal Categories */}
                <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
                        <Tag className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> মিল ক্যাটাগরি
                    </h3>
                    <div className="space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
                        <AnimatePresence>
                            {mealCategories.map(cat => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    key={cat.id}
                                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-${cat.color}-50 border-${cat.color}-100`}
                                >
                                    <span className={`font-bold text-${cat.color}-700 text-sm sm:text-base truncate mr-2`}>{cat.label}</span>
                                    <button onClick={() => removeMealCategory(cat.id)} className={`text-${cat.color}-400 hover:text-rose-500 transition-colors shrink-0 p-1`}>
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                        <input
                            type="text"
                            placeholder="যেমন: শুক্রবার স্পেশাল"
                            value={newMealCat.label}
                            onChange={e => setNewMealCat({ ...newMealCat, label: e.target.value })}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-sm sm:text-base"
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <select
                                value={newMealCat.color}
                                onChange={e => setNewMealCat({ ...newMealCat, color: e.target.value })}
                                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm sm:text-base"
                            >
                                <option value="slate">সাদা</option>
                                <option value="indigo">নীল</option>
                                <option value="emerald">সবুজ</option>
                                <option value="amber">হলুদ</option>
                            </select>
                            <button onClick={addMealCategory} className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all font-bold flex items-center justify-center shrink-0">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Dynamic Bill Categories */}
                <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
                        <Calculator className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> ফিক্সড বিল ক্যাটাগরি
                    </h3>
                    <div className="space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
                        <AnimatePresence>
                            {billCategories.map(cat => {
                                const Icon = IconMap[cat.icon] || Calculator;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        key={cat.id}
                                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-100 bg-slate-50"
                                    >
                                        <div className="flex items-center text-slate-700 font-bold text-sm sm:text-base truncate mr-2">
                                            <Icon size={16} className="mr-2 sm:mr-3 text-slate-400 shrink-0" />
                                            <span className="truncate">{cat.label}</span>
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${(cat.billType === 'advance') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                {(cat.billType === 'advance') ? 'অগ্রিম' : 'ফিক্সড'}
                                            </span>
                                        </div>
                                        <button onClick={() => removeBillCategory(cat.id)} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                        <input
                            type="text"
                            placeholder="যেমন: গ্যাস বিল"
                            value={newBillCat.label}
                            onChange={e => setNewBillCat({ ...newBillCat, label: e.target.value })}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-sm sm:text-base"
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <select
                                value={newBillCat.billType}
                                onChange={e => setNewBillCat({ ...newBillCat, billType: e.target.value })}
                                className="flex-1 xs:flex-initial px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs sm:text-sm max-w-[90px] sm:max-w-[110px]"
                            >
                                <option value="fixed">ফিক্সড</option>
                                <option value="advance">অগ্রিম</option>
                            </select>
                            <select
                                value={newBillCat.icon}
                                onChange={e => setNewBillCat({ ...newBillCat, icon: e.target.value })}
                                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm sm:text-base max-w-[100px] sm:max-w-[120px]"
                            >
                                {Object.keys(IconMap).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                            </select>
                            <button onClick={addBillCategory} className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-slate-800 active:bg-slate-700 transition-all font-bold flex items-center justify-center shrink-0">
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Member Management */}
            <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 sm:mb-6 lg:mb-8 flex items-center justify-between flex-wrap gap-2">
                    <span className="flex items-center">
                        <User className="mr-2 sm:mr-3 text-slate-400 shrink-0" size={20} />
                        মেম্বার ম্যানেজমেন্ট
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-400 bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">{englishToBangla(members.length)} জন</span>
                </h3>

                <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
                    <input
                        type="text"
                        name="name"
                        placeholder="সদস্যের নাম লিখুন"
                        required
                        className="flex-1 min-w-0 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-base sm:text-lg"
                    />
                    <button type="submit" className="bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center shrink-0 text-sm sm:text-base">
                        <UserPlus className="mr-2" size={18} /> যুক্ত করুন
                    </button>
                </form>

                <div className="space-y-2.5 sm:space-y-3">
                    <AnimatePresence>
                        {members.map(member => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                key={member.id}
                                className="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-colors bg-white group"
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                        <User size={18} className="text-slate-400 sm:hidden" />
                                        <User size={22} className="text-slate-400 hidden sm:block" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-base sm:text-[17px] truncate">{member.name}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                                    <button
                                        onClick={async () => {
                                            await updateMember(member.id, { billExempt: !member.billExempt }, selectedMonth);
                                        }}
                                        className={`px-2.5 sm:px-3 py-2 sm:py-2.5 font-bold border rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-[10px] sm:text-xs ${member.billExempt
                                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                                : 'text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                                            }`}
                                        title={member.billExempt ? 'অগ্রিম বিল থেকে বাদ' : 'অগ্রিম বিল থেকে বাদ করুন'}
                                    >
                                        {member.billExempt
                                            ? <><ShieldOff size={14} /> <span className="hidden xs:inline">বিল ছাড়</span></>
                                            : <><ShieldCheck size={14} /> <span className="hidden xs:inline">সক্রিয়</span></>
                                        }
                                    </button>
                                    <button onClick={() => handleEditMember(member.id, member.name)} className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold border border-transparent hover:border-blue-100 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm" title="এডিট করুন">
                                        <Edit2 size={16} /> <span className="hidden sm:inline">এডিট</span>
                                    </button>
                                    <button onClick={() => handleRemoveMember(member.id, member.name)} className="px-3 sm:px-4 py-2 sm:py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold border border-transparent hover:border-rose-100 rounded-lg sm:rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm" title="ডিলিট করুন">
                                        <Trash2 size={16} /> <span className="hidden sm:inline">ডিলিট</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {members.length === 0 && (
                        <div className="bg-white p-8 sm:p-10 rounded-xl sm:rounded-[20px] text-center text-slate-400 border border-slate-100 text-sm sm:text-base">
                            কোনো মেম্বার পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </motion.div>

        </motion.div>
    );
}
