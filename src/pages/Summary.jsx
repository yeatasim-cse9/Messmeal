import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap, banglaToEnglish } from '../utils/helpers';
import { generateMonthlyReport } from '../utils/pdfExport';
import { Calculator, Download, Trash2, Edit2, Plus, Home, User, Check, X, CheckCircle2, Store } from 'lucide-react';

export default function Summary() {
    const { isAdmin } = useAuth();
    const {
        members, billCategories, utilities, setUtility, selectedMonth,
        memberStats, mealRate, totalMessFoodCost, totalDeposit,
        managerCashInHand, totalBakiExpense, totalUtilityCost,
        totalAdditionalExpense, utilityPerMember, expenses, deposits,
        updateSettings, updateMember, totalHouseRent, paidFromFundUtilities,
        updateExpense, removeExpense, totalBakiPaid, totalRentPaid, addExpense
    } = useData();
    const { showPrompt, showConfirm, showAlert } = useDialog();

    const [showCatModal, setShowCatModal] = useState(false);
    const [newCatData, setNewCatData] = useState({ label: '', billType: 'fixed' });
    const [rentPayAmount, setRentPayAmount] = useState('');
    const [payAmount, setPayAmount] = useState('');

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

    const handlePayBaki = async () => {
        const amount = Number(banglaToEnglish(payAmount));
        if (!amount || amount <= 0) {
            await showAlert("সঠিক পরিমাণ লিখুন!");
            return;
        }

        const remaining = totalBakiExpense - totalBakiPaid;
        const confirmed = await showConfirm(`৳${englishToBangla(amount.toFixed(0))} পরিশোধ হিসেবে রেকর্ড করতে চান?`);
        if (confirmed) {
            try {
                await addExpense({
                    type: 'baki_payment',
                    amount: amount,
                    description: 'দোকান বকেয়া পরিশোধ',
                    date: new Date().toISOString().split('T')[0],
                    fundSource: 'fund'
                }, selectedMonth);
                setPayAmount('');
                await showAlert("পরিশোধ সফল হয়েছে!");
            } catch (err) {
                console.error('Payment failed:', err);
                await showAlert("পরিশোধ ব্যর্থ হয়েছে!");
            }
        }
    };

    const handleEditBakiPayment = async (payment) => {
        const newAmount = await showPrompt("নতুন পরিমাণ দিন:", payment.amount?.toString() || '0');
        if (newAmount === null || newAmount === undefined) return;
        const amount = Number(banglaToEnglish(newAmount));
        if (isNaN(amount) || amount <= 0) {
            await showAlert("সঠিক পরিমাণ লিখুন!");
            return;
        }
        try {
            await updateExpense(payment.id, { amount, description: 'দোকান বকেয়া পরিশোধ', fundSource: 'fund' }, selectedMonth);
            await showAlert("আপডেট সফল হয়েছে!");
        } catch (err) {
            console.error('Update failed:', err);
            await showAlert("আপডেট ব্যর্থ হয়েছে!");
        }
    };

    const handleDeleteBakiPayment = async (payment) => {
        const confirmed = await showConfirm(`৳${englishToBangla(Number(payment.amount).toFixed(0))} পেমেন্ট ডিলিট করতে চান? টাকা ফান্ডে ফেরত যাবে।`);
        if (!confirmed) return;
        try {
            await removeExpense(payment.id, selectedMonth);
            await showAlert("ডিলিট সফল হয়েছে!");
        } catch (err) {
            console.error('Delete failed:', err);
            await showAlert("ডিলিট ব্যর্থ হয়েছে!");
        }
    };

    // --- Rent Payment Handlers ---
    const handlePayRent = async () => {
        const amount = Number(banglaToEnglish(rentPayAmount));
        if (!amount || amount <= 0) {
            await showAlert("সঠিক পরিমাণ লিখুন!");
            return;
        }
        const confirmed = await showConfirm(`৳${englishToBangla(amount.toFixed(0))} বাসা ভাড়া পরিশোধ হিসেবে রেকর্ড করতে চান?`);
        if (confirmed) {
            try {
                await addExpense({
                    type: 'rent_payment',
                    amount: amount,
                    description: 'বাসা ভাড়া পরিশোধ',
                    date: new Date().toISOString().split('T')[0],
                    fundSource: 'fund'
                }, selectedMonth);
                setRentPayAmount('');
                await showAlert("পরিশোধ সফল হয়েছে!");
            } catch (err) {
                console.error('Rent payment failed:', err);
                await showAlert("পরিশোধ ব্যর্থ হয়েছে!");
            }
        }
    };

    const handleEditRentPayment = async (payment) => {
        const newAmount = await showPrompt("নতুন পরিমাণ দিন:", payment.amount?.toString() || '0');
        if (newAmount === null || newAmount === undefined) return;
        const amount = Number(banglaToEnglish(newAmount));
        if (isNaN(amount) || amount <= 0) {
            await showAlert("সঠিক পরিমাণ লিখুন!");
            return;
        }
        try {
            await updateExpense(payment.id, { amount, description: 'বাসা ভাড়া পরিশোধ', fundSource: 'fund' }, selectedMonth);
            await showAlert("আপডেট সফল হয়েছে!");
        } catch (err) {
            console.error('Update failed:', err);
            await showAlert("আপডেট ব্যর্থ হয়েছে!");
        }
    };

    const handleDeleteRentPayment = async (payment) => {
        const confirmed = await showConfirm(`৳${englishToBangla(Number(payment.amount).toFixed(0))} পেমেন্ট ডিলিট করতে চান? টাকা ফান্ডে ফেরত যাবে।`);
        if (!confirmed) return;
        try {
            await removeExpense(payment.id, selectedMonth);
            await showAlert("ডিলিট সফল হয়েছে!");
        } catch (err) {
            console.error('Delete failed:', err);
            await showAlert("ডিলিট ব্যর্থ হয়েছে!");
        }
    };

    const bakiExpenses = expenses.filter(e => e.type === 'baki');
    const bakiPayments = expenses.filter(e => e.type === 'baki_payment');
    const rentPayments = expenses.filter(e => e.type === 'rent_payment');

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">

            {/* House Rent Section */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                        <Home className="text-indigo-400 mr-2 sm:mr-3 shrink-0" size={20} /> মাসিক বাসা ভাড়া
                    </h3>
                    {totalHouseRent > 0 && (
                        <span className="text-sm sm:text-base font-bold text-indigo-400 bg-indigo-500/10 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-indigo-500/20 self-start sm:self-auto">
                            মোট: <span className="font-black">{formatCurrency(totalHouseRent)}</span>
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 lg:gap-4">
                    {members.map(m => {
                        const rent = Number(m.houseRent) || 0;
                        return (
                            <div
                                key={m.id}
                                className="group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0">
                                        <User size={13} className="text-indigo-400" />
                                    </div>
                                    <span className="font-bold text-xs sm:text-sm truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="font-black text-indigo-400 text-base sm:text-lg tracking-tight">
                                        ৳{englishToBangla(rent.toFixed(0))}
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleUpdateHouseRent(m.id, rent)}
                                            className="p-1.5 sm:p-2 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
                                            title="বাসা ভাড়া আপডেট করুন"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] sm:text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>মাসিক</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* House Rent Payment Section */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <Home className="text-indigo-500 mr-2 sm:mr-3 shrink-0" size={24} />
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>বাসা ভাড়া পরিশোধ</h3>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>ফান্ড থেকে বাসা ভাড়া পরিশোধ করুন</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap sm:justify-end">
                        <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 min-w-[100px]">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-0.5">মোট ভাড়া</p>
                            <p className="font-black text-indigo-400 text-lg">৳{englishToBangla(totalHouseRent.toFixed(0))}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-w-[100px]">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">পরিশোধিত</p>
                            <p className="font-black text-emerald-400 text-lg">৳{englishToBangla(totalRentPaid.toFixed(0))}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 min-w-[100px]">
                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">বাকি আছে</p>
                            <p className="font-black text-amber-400 text-lg">৳{englishToBangla((totalHouseRent - totalRentPaid).toFixed(0))}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="space-y-6">
                        {isAdmin && (totalHouseRent - totalRentPaid) > 0 && (
                            <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl shadow-emerald-600/10">
                                <h4 className="text-sm font-bold opacity-70 mb-4 uppercase tracking-widest">বাসা ভাড়া পরিশোধ করুন</h4>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={englishToBangla(rentPayAmount)}
                                            onChange={(e) => setRentPayAmount(banglaToEnglish(e.target.value))}
                                            placeholder="পরিমাণ দিন"
                                            className="w-full pl-9 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 font-black text-xl outline-none transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePayRent}
                                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle2 size={18} /> পেমেন্ট করুন
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rent Payment History */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>পরিশোধের ইতিহাস</h4>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {rentPayments.length > 0 ? rentPayments.map(pay => (
                                    <div key={pay.id} className="flex items-center justify-between p-3 rounded-2xl border transition-colors group" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(Number(pay.amount).toFixed(0))}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{englishToBangla(pay.date)}</p>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditRentPayment(pay)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-muted)' }}
                                                    title="এডিট"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRentPayment(pay)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors" style={{ color: 'var(--text-muted)' }}
                                                    title="ডিলিট"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-center py-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>কোনো পেমেন্ট হিস্ট্রি নেই</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Member Rent Breakdown */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 px-1" style={{ color: 'var(--text-muted)' }}>সদস্যভিত্তিক ভাড়া</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {members.map(m => {
                                const rent = Number(m.houseRent) || 0;
                                return (
                                    <div key={m.id} className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/15 flex items-center justify-center shrink-0">
                                                <User size={11} className="text-indigo-400" />
                                            </div>
                                            <span className="font-bold text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{m.name}</span>
                                        </div>
                                        <p className="font-black text-indigo-400 text-sm">৳{englishToBangla(rent.toFixed(0))}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bills */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                        <Calculator className="mr-2 sm:mr-3 shrink-0" size={20} style={{ color: 'var(--text-muted)' }} /> ফিক্সড বিল {!isAdmin && '(শুধু দেখা)'}
                    </h3>
                    {isAdmin && (
                        <button onClick={handleAddCat} className="flex items-center text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors border self-start sm:self-auto" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                            <Plus size={14} className="mr-1.5" /> ক্যাটাগরি তৈরি
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {billCategories.map(cat => {
                        const CatIcon = IconMap[cat.icon] || Calculator;
                        return (
                            <div key={cat.id} className="group">
                                <label className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>
                                    <span className="flex items-center truncate">
                                        <CatIcon size={14} className="mr-1.5 sm:mr-2 shrink-0" />
                                        <span className="truncate">{cat.label}</span>
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border ${(cat.billType === 'advance') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 border-white/10'}`} style={(cat.billType !== 'advance') ? { color: 'var(--text-muted)' } : {}}>
                                            {(cat.billType === 'advance') ? 'অগ্রিম' : 'ফিক্সড'}
                                        </span>
                                    </span>
                                    {isAdmin && (
                                        <div className="flex sm:hidden sm:group-hover:flex items-center gap-1 ml-1 shrink-0">
                                            <button onClick={() => handleEditCat(cat)} className="p-1 hover:text-blue-400 transition-colors rounded-md border" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }} title="এডিট">
                                                <Edit2 size={10} />
                                            </button>
                                            <button onClick={() => handleDeleteCat(cat.id, cat.label)} className="p-1 hover:text-rose-400 transition-colors rounded-md border" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }} title="ডিলিট">
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-black text-sm" style={{ color: 'var(--text-muted)' }}>৳</span>
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
                                        className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-black text-sm sm:text-base disabled:opacity-70" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
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
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`} style={!utilities[`${cat.id}_paid`] ? { color: 'var(--text-muted)' } : {}}
                                >
                                    <Check size={12} className={utilities[`${cat.id}_paid`] ? 'text-emerald-500' : 'text-slate-300'} />
                                    {utilities[`${cat.id}_paid`] ? 'ফান্ড থেকে পে ✓' : 'ফান্ড থেকে পে?'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Shop Dues & Payment Section */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <Store className="text-rose-500 mr-2 sm:mr-3 shrink-0" size={24} /> 
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>দোকানে বকেয়া ও পরিশোধ</h3>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>একসাথে সব বিল পরিশোধ করুন</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap sm:justify-end">
                        <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 min-w-[100px]">
                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mb-0.5">মোট বকেয়া</p>
                            <p className="font-black text-rose-400 text-lg">৳{englishToBangla(totalBakiExpense.toFixed(0))}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-w-[100px]">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">পরিশোধিত</p>
                            <p className="font-black text-emerald-400 text-lg">৳{englishToBangla(totalBakiPaid.toFixed(0))}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 min-w-[100px]">
                            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">বাকি আছে</p>
                            <p className="font-black text-amber-400 text-lg">৳{englishToBangla((totalBakiExpense - totalBakiPaid).toFixed(0))}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Payment Form & History */}
                    <div className="xl:col-span-4 space-y-6">
                        {isAdmin && (totalBakiExpense - totalBakiPaid) > 0 && (
                            <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl shadow-rose-600/10">
                                <h4 className="text-sm font-bold opacity-70 mb-4 uppercase tracking-widest">টাকা পরিশোধ করুন</h4>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={englishToBangla(payAmount)}
                                            onChange={(e) => setPayAmount(banglaToEnglish(e.target.value))}
                                            placeholder="পরিমাণ দিন"
                                            className="w-full pl-9 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 font-black text-xl outline-none transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <button 
                                        onClick={handlePayBaki}
                                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <CheckCircle2 size={18} /> পেমেন্ট করুন
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-muted)' }}>পরিশোধের ইতিহাস</h4>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {bakiPayments.length > 0 ? bakiPayments.map(pay => (
                                    <div key={pay.id} className="flex items-center justify-between p-3 rounded-2xl border transition-colors group" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(Number(pay.amount).toFixed(0))}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{englishToBangla(pay.date)}</p>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditBakiPayment(pay)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-muted)' }}
                                                    title="এডিট"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBakiPayment(pay)}
                                                    className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors" style={{ color: 'var(--text-muted)' }}
                                                    title="ডিলিট"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-center py-6 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>কোনো পেমেন্ট হিস্ট্রি নেই</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dues List */}
                    <div className="xl:col-span-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 px-1" style={{ color: 'var(--text-muted)' }}>বকেয়া বিলের তালিকা</h4>
                        {bakiExpenses.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {bakiExpenses.map(expense => (
                                    <div 
                                        key={expense.id} 
                                        className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{englishToBangla(expense.date)}</p>
                                            <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(expense.amount.toFixed(0))}</p>
                                        </div>
                                        <p className="font-bold text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{expense.description}</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider">বকেয়া</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 rounded-3xl border border-dashed" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                                <Store className="mx-auto mb-2 opacity-30" size={40} style={{ color: 'var(--text-muted)' }} />
                                <p className="font-bold" style={{ color: 'var(--text-muted)' }}>এই মাসে কোনো বকেয়া নেই</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Final Report Table */}
            <div className="rounded-2xl sm:rounded-3xl border overflow-hidden p-4 sm:p-6 lg:p-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>ফাইনাল রিপোর্ট</h3>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-sm sm:text-base font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)' }}>
                            বিল প্রতি জন: <span className="font-black" style={{ color: 'var(--text-primary)' }}>{formatCurrency(utilityPerMember)}</span>
                        </span>
                        <button onClick={() => generateMonthlyReport({
                            monthLabel: getBanglaMonthYear(selectedMonth),
                            memberStats, mealRate, totalMessFoodCost, totalDeposit,
                            managerCashInHand, totalBakiExpense, totalUtilityCost,
                            utilityPerMember, expenses, deposits, members
                        })} className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md shrink-0">
                            <Download size={14} /> PDF
                        </button>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-4">
                    {memberStats.map(stat => (
                        <div
                            key={stat.id}
                            className="p-4 rounded-[24px] border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                        >
                                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-secondary)' }}>
                                        <User size={16} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <span className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{stat.name}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full border text-base font-black ${stat.balance >= 0 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border-rose-500/20'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toFixed(0))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>মিল ও খাবার</span>
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{englishToBangla(stat.totalMeals)}<span className="text-[10px] ml-0.5" style={{ color: 'var(--text-muted)' }}>টি</span></span>
                                        <span className="font-black text-xs" style={{ color: 'var(--text-secondary)' }}>৳{englishToBangla(stat.foodCost.toFixed(0))}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col p-2.5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>ফিক্সড বিল</span>
                                    <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(stat.utilityCost.toFixed(0))}</span>
                                </div>
                                <div className="flex flex-col p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">অতিরিক্ত</span>
                                    <span className="font-black text-amber-400 text-sm">৳{englishToBangla(stat.additionalExpense.toFixed(0))}</span>
                                </div>
                                <div className="flex flex-col p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">বাসা ভাড়া</span>
                                    <span className="font-black text-indigo-400 text-sm">৳{englishToBangla(stat.houseRent.toFixed(0))}</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/10">
                                    <span className="text-xs font-bold opacity-70">মোট জমা</span>
                                    <span className="font-black text-base">৳{englishToBangla(stat.totalContribution.toFixed(0))}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="text-[11px] lg:text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)', borderBottom: '2px solid var(--border-primary)' }}>
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
                                <tr key={stat.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <td className="py-4 pl-3">
                                        <span className="font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>{stat.name}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{englishToBangla(stat.totalMeals)}</span>
                                        <span className="text-sm ml-0.5" style={{ color: 'var(--text-muted)' }}>মিল</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(stat.foodCost.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(stat.utilityCost.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-indigo-400">৳{englishToBangla(stat.houseRent.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-amber-400">৳{englishToBangla(stat.additionalExpense.toFixed(2))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(stat.totalContribution.toFixed(2))}</span>
                                    </td>
                                    <td className={`py-4 text-right pr-3 font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Info Row */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-center" style={{ borderTop: '2px solid var(--border-primary)' }}>
                    <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <div className="text-[10px] sm:text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>মিল রেট</div>
                        <div className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(mealRate.toFixed(2))}</div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <div className="text-[10px] sm:text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>মোট বাজার</div>
                        <div className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalMessFoodCost)}</div>
                    </div>
                    <div className="bg-indigo-500/10 p-3 sm:p-4 rounded-xl border border-indigo-500/20">
                        <div className="text-[10px] sm:text-xs text-indigo-400 font-medium mb-1">মোট বাসা ভাড়া</div>
                        <div className="text-lg sm:text-xl font-black text-indigo-400">{formatCurrency(totalHouseRent || 0)}</div>
                    </div>
                    <div className="bg-amber-500/10 p-3 sm:p-4 rounded-xl border border-amber-500/20">
                        <div className="text-[10px] sm:text-xs text-amber-400 font-medium mb-1">মোট অতিরিক্ত খরচ</div>
                        <div className="text-lg sm:text-xl font-black text-amber-400">{formatCurrency(totalAdditionalExpense)}</div>
                    </div>
                    <div className="bg-emerald-500/10 p-3 sm:p-4 rounded-xl border border-emerald-500/20">
                        <div className="text-[10px] sm:text-xs text-emerald-400 font-medium mb-1">হাতে আছে</div>
                        <div className="text-lg sm:text-xl font-black text-emerald-400">{formatCurrency(managerCashInHand)}</div>
                    </div>
                    {paidFromFundUtilities > 0 && (
                        <div className="bg-violet-500/10 p-3 sm:p-4 rounded-xl border border-violet-500/20">
                            <div className="text-[10px] sm:text-xs text-violet-400 font-medium mb-1">বিল পে (ফান্ড থেকে)</div>
                            <div className="text-lg sm:text-xl font-black text-violet-400">{formatCurrency(paidFromFundUtilities)}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Modal for Adding Category */}
            {showCatModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <Plus size={24} className="text-indigo-400" />
                                    নতুন ক্যাটাগরি তৈরি
                                </h3>
                                <button onClick={() => setShowCatModal(false)} className="transition-colors p-1.5 rounded-full" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={submitNewCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>বিলের নাম</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="যেমন: ইন্টারনেট বিল"
                                        value={newCatData.label}
                                        onChange={e => setNewCatData({ ...newCatData, label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium outline-none transition-all" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                        autoFocus
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>বিলের ধরন</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewCatData({ ...newCatData, billType: 'fixed' })}
                                            className={`p-3 rounded-xl border text-left transition-all ${newCatData.billType === 'fixed' ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500' : 'hover:bg-white/5'}`} style={newCatData.billType !== 'fixed' ? { borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-elevated)' } : {}}
                                        >
                                            <div className={`font-bold text-sm ${newCatData.billType === 'fixed' ? 'text-indigo-400' : ''}`} style={newCatData.billType !== 'fixed' ? { color: 'var(--text-primary)' } : {}}>ফিক্সড বিল</div>
                                            <div className={`text-[10px] mt-0.5 ${newCatData.billType === 'fixed' ? 'text-indigo-400/70' : ''}`} style={newCatData.billType !== 'fixed' ? { color: 'var(--text-muted)' } : {}}>সব মেম্বার দেবে</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCatData({ ...newCatData, billType: 'advance' })}
                                            className={`p-3 rounded-xl border text-left transition-all ${newCatData.billType === 'advance' ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500' : 'hover:bg-white/5'}`} style={newCatData.billType !== 'advance' ? { borderColor: 'var(--border-secondary)', backgroundColor: 'var(--bg-elevated)' } : {}}
                                        >
                                            <div className={`font-bold text-sm ${newCatData.billType === 'advance' ? 'text-amber-400' : ''}`} style={newCatData.billType !== 'advance' ? { color: 'var(--text-primary)' } : {}}>অগ্রিম বিল</div>
                                            <div className={`text-[10px] mt-0.5 ${newCatData.billType === 'advance' ? 'text-amber-400/70' : ''}`} style={newCatData.billType !== 'advance' ? { color: 'var(--text-muted)' } : {}}>চলে যাওয়া মেম্বার বাদে</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 mt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCatModal(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold transition-all" style={{ color: 'var(--text-muted)' }}
                                    >
                                        বাতিল
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                                    >
                                        যুক্ত করুন
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
