import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap, banglaToEnglish } from '../utils/helpers';
import { generateMonthlyReport } from '../utils/pdfExport';
import { Calculator, Download, Trash2, Edit2, Plus, Home, User, Check, X } from 'lucide-react';

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

export default function Summary() {
    const { isAdmin } = useAuth();
    const {
        members, billCategories, utilities, setUtility, selectedMonth,
        memberStats, mealRate, totalMessFoodCost, totalDeposit,
        managerCashInHand, totalBakiExpense, totalUtilityCost,
        totalAdditionalExpense, utilityPerMember, expenses, deposits,
        updateSettings, updateMember, totalHouseRent, paidFromFundUtilities
    } = useData();
    const { showPrompt, showConfirm, showAlert } = useDialog();

    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatData, setNewCatData] = useState({ label: '', billType: 'fixed' });

    const handleAddCat = () => {
        setNewCatData({ label: '', billType: 'fixed' });
        setShowCatModal(true);
    };

    const submitNewCategory = async (e) => {
        e.preventDefault();
        if (!newCatData.label.trim()) {
            await showAlert("বিলের নাম দিতে হবে!");
            return;
        }
        const newCat = {
            id: `bill_${Date.now()}`,
            label: newCatData.label.trim(),
            icon: 'Calculator',
            billType: newCatData.billType
        };
        await updateSettings({ billCategories: [...billCategories, newCat] });
        setShowCatModal(false);
    };

    const handleEditCat = async (cat) => {
        const newName = await showPrompt("বিলের নতুন নাম দিন:", cat.label);
        if (!newName || newName === cat.label) return;
        const updated = billCategories.map(c => c.id === cat.id ? { ...c, label: newName } : c);
        await updateSettings({ billCategories: updated });
    };

    const handleDeleteCat = async (catId, catLabel) => {
        const confirmed = await showConfirm(`আপনি কি নিশ্চিত যে "${catLabel}" ক্যাটাগরি ডিলিট করতে চান?`);
        if (confirmed) {
            await updateSettings({ billCategories: billCategories.filter(c => c.id !== catId) });
        }
    };

    const handleUpdateHouseRent = async (memberId, currentRent) => {
        const newRent = await showPrompt('মাসিক বাসা ভাড়ার পরিমাণ দিন:', currentRent?.toString() || '0');
        if (newRent === null || newRent === undefined) return;
        const rentValue = Number(banglaToEnglish(newRent));
        if (isNaN(rentValue) || rentValue < 0) return;
        try {
            await updateMember(memberId, { houseRent: rentValue }, selectedMonth);
        } catch (err) {
            console.error('Failed to update house rent:', err);
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500"
        >

            {/* House Rent Section */}
            <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center">
                        <Home className="text-indigo-500 mr-2 sm:mr-3 shrink-0" size={20} /> মাসিক বাসা ভাড়া
                    </h3>
                    {totalHouseRent > 0 && (
                        <span className="text-sm sm:text-base font-bold text-indigo-600 bg-indigo-50 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-indigo-100 self-start sm:self-auto">
                            মোট: <span className="font-black">{formatCurrency(totalHouseRent)}</span>
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
                    {members.map(m => {
                        const rent = Number(m.houseRent) || 0;
                        return (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                key={m.id}
                                className="group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-indigo-200 bg-gradient-to-br from-indigo-50/30 to-white transition-all"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <User size={13} className="text-indigo-600" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{m.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-indigo-700 text-base sm:text-lg tracking-tight">
                                        ৳{englishToBangla(rent.toFixed(0))}
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleUpdateHouseRent(m.id, rent)}
                                            className="p-1.5 sm:p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="বাসা ভাড়া আপডেট করুন"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">মাসিক</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Fixed Bills */}
            <motion.div variants={itemVariants} className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center">
                        <Calculator className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> ফিক্সড বিল {!isAdmin && '(শুধু দেখা)'}
                    </h3>
                    {isAdmin && (
                        <button onClick={handleAddCat} className="flex items-center text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors border border-slate-200 self-start sm:self-auto">
                            <Plus size={14} className="mr-1.5" /> ক্যাটাগরি তৈরি
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {billCategories.map(cat => {
                        const CatIcon = IconMap[cat.icon] || Calculator;
                        return (
                            <motion.div variants={itemVariants} key={cat.id} className="group">
                                <label className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">
                                    <span className="flex items-center truncate">
                                        <CatIcon size={14} className="mr-1.5 sm:mr-2 shrink-0" />
                                        <span className="truncate">{cat.label}</span>
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${(cat.billType === 'advance') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {(cat.billType === 'advance') ? 'অগ্রিম' : 'ফিক্সড'}
                                        </span>
                                    </span>
                                    {isAdmin && (
                                        <div className="flex sm:hidden sm:group-hover:flex items-center gap-1 ml-1 shrink-0">
                                            <button onClick={() => handleEditCat(cat)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors bg-white rounded-md shadow-sm border border-slate-100" title="এডিট">
                                                <Edit2 size={10} />
                                            </button>
                                            <button onClick={() => handleDeleteCat(cat.id, cat.label)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-md shadow-sm border border-slate-100" title="ডিলিট">
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">৳</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={englishToBangla(utilities[cat.id] || '')}
                                        onChange={(e) => {
                                            const val = banglaToEnglish(e.target.value);
                                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                setUtility(cat.id, val, selectedMonth);
                                            }
                                        }}
                                        disabled={!isAdmin}
                                        placeholder="০"
                                        className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-black text-slate-800 text-sm sm:text-base disabled:opacity-70 disabled:bg-slate-100"
                                    />
                                </div>
                                {/* ফান্ড থেকে পে টগল */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isAdmin) return;
                                        const key = `${cat.id}_paid`;
                                        setUtility(key, !utilities[key], selectedMonth);
                                    }}
                                    disabled={!isAdmin || !utilities[cat.id]}
                                    className={`mt-1.5 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all border ${utilities[`${cat.id}_paid`]
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    <Check size={12} className={utilities[`${cat.id}_paid`] ? 'text-emerald-500' : 'text-slate-300'} />
                                    {utilities[`${cat.id}_paid`] ? 'ফান্ড থেকে পে ✓' : 'ফান্ড থেকে পে?'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Final Report Table */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50 overflow-hidden p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">ফাইনাল রিপোর্ট</h3>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-600 bg-slate-100 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl">
                            বিল প্রতি জন: <span className="text-slate-900 font-black">{formatCurrency(utilityPerMember)}</span>
                        </span>
                        <button onClick={() => generateMonthlyReport({
                            monthLabel: getBanglaMonthYear(selectedMonth),
                            memberStats, mealRate, totalMessFoodCost, totalDeposit,
                            managerCashInHand, totalBakiExpense, totalUtilityCost,
                            utilityPerMember, expenses, deposits, members
                        })} className="flex items-center gap-1.5 sm:gap-2 bg-[#0F172A] hover:bg-slate-800 active:bg-slate-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md shrink-0">
                            <Download size={14} /> PDF
                        </button>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                    {memberStats.map(stat => (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            key={stat.id}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-sm truncate">{stat.name}</span>
                                <span className={`font-black  text-base ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-medium">
                                <span>মিল: <strong className="text-slate-700">{englishToBangla(stat.totalMeals)}</strong></span>
                                <span className="text-right">খাবার: <strong className="text-slate-700">{formatCurrency(stat.foodCost)}</strong></span>
                                <span>বিল: <strong className="text-slate-700">{formatCurrency(stat.utilityCost)}</strong></span>
                                <span className="text-right">অতিরিক্ত: <strong className="text-amber-600">{formatCurrency(stat.additionalExpense)}</strong></span>
                                <span>ভাড়া: <strong className="text-indigo-600">{formatCurrency(stat.houseRent)}</strong></span>
                                <span className="text-right">জমা: <strong className="text-slate-700">{formatCurrency(stat.totalContribution)}</strong></span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <motion.div variants={itemVariants} className="hidden sm:block overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-slate-400 text-[11px] lg:text-xs uppercase tracking-wider font-bold">
                                <th className="pb-4 pl-3">মেম্বার</th>
                                <th className="pb-4 text-center">মোট মিল</th>
                                <th className="pb-4 text-center">খাবার খরচ</th>
                                <th className="pb-4 text-center">ফিক্সড বিল</th>
                                <th className="pb-4 text-center">বাসা ভাড়া</th>
                                <th className="pb-4 text-center">অতিরিক্ত খরচ</th>
                                <th className="pb-4 text-center">মোট জমা</th>
                                <th className="pb-4 text-right pr-3">ব্যালেন্স</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {memberStats.map(stat => (
                                <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pl-3">
                                        <span className="font-bold text-slate-900 text-[15px]">{stat.name}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-lg text-slate-800">{englishToBangla(stat.totalMeals)}</span>
                                        <span className="text-slate-400 text-sm ml-0.5">মিল</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.foodCost.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.utilityCost.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-indigo-600">৳{englishToBangla(stat.houseRent.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-amber-600">৳{englishToBangla(stat.additionalExpense.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.totalContribution.toFixed(2))}</span>
                                    </td>
                                    <td className={`py-4 text-right pr-3 font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Summary Info Row */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-center">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1">মিল রেট</div>
                        <div className="text-lg sm:text-xl font-black text-slate-900">৳{englishToBangla(mealRate.toFixed(2))}</div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1">মোট বাজার</div>
                        <div className="text-lg sm:text-xl font-black text-slate-900">{formatCurrency(totalMessFoodCost)}</div>
                    </div>
                    <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                        <div className="text-[10px] sm:text-xs text-indigo-500 font-medium mb-1">মোট বাসা ভাড়া</div>
                        <div className="text-lg sm:text-xl font-black text-indigo-600">{formatCurrency(totalHouseRent || 0)}</div>
                    </div>
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                        <div className="text-[10px] sm:text-xs text-amber-500 font-medium mb-1">মোট অতিরিক্ত খরচ</div>
                        <div className="text-lg sm:text-xl font-black text-amber-600">{formatCurrency(totalAdditionalExpense)}</div>
                    </div>
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                        <div className="text-[10px] sm:text-xs text-emerald-500 font-medium mb-1">হাতে আছে</div>
                        <div className="text-lg sm:text-xl font-black text-emerald-700">{formatCurrency(managerCashInHand)}</div>
                    </div>
                    {paidFromFundUtilities > 0 && (
                        <div className="bg-violet-50 p-3 sm:p-4 rounded-xl border border-violet-100">
                            <div className="text-[10px] sm:text-xs text-violet-500 font-medium mb-1">বিল পে (ফান্ড থেকে)</div>
                            <div className="text-lg sm:text-xl font-black text-violet-700">{formatCurrency(paidFromFundUtilities)}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Custom Modal for Adding Category */}
            <AnimatePresence>
                {showCatModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Plus size={24} className="text-indigo-500" />
                                        নতুন ক্যাটাগরি তৈরি
                                    </h3>
                                    <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full">
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={submitNewCategory} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">বিলের নাম</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="যেমন: ইন্টারনেট বিল"
                                            value={newCatData.label}
                                            onChange={e => setNewCatData({ ...newCatData, label: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-800 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">বিলের ধরন</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNewCatData({ ...newCatData, billType: 'fixed' })}
                                                className={`p-3 rounded-xl border text-left transition-all ${newCatData.billType === 'fixed' ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                            >
                                                <div className={`font-bold text-sm ${newCatData.billType === 'fixed' ? 'text-indigo-700' : 'text-slate-700'}`}>ফিক্সড বিল</div>
                                                <div className={`text-[10px] mt-0.5 ${newCatData.billType === 'fixed' ? 'text-indigo-500' : 'text-slate-400'}`}>সব মেম্বার দেবে</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewCatData({ ...newCatData, billType: 'advance' })}
                                                className={`p-3 rounded-xl border text-left transition-all ${newCatData.billType === 'advance' ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                            >
                                                <div className={`font-bold text-sm ${newCatData.billType === 'advance' ? 'text-amber-700' : 'text-slate-700'}`}>অগ্রিম বিল</div>
                                                <div className={`text-[10px] mt-0.5 ${newCatData.billType === 'advance' ? 'text-amber-600' : 'text-slate-400'}`}>চলে যাওয়া মেম্বার বাদে</div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCatModal(false)}
                                            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
                                        >
                                            যুক্ত করুন
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
