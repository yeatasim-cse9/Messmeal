import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, banglaToEnglish } from '../utils/helpers';
import { Wallet, User, Trash2, TrendingUp } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function Deposits() {
    const { isAdmin } = useAuth();
    const { members, deposits, addDeposit, removeDeposit, selectedMonth, memberStats } = useData();
    const { showAlert, showConfirm } = useDialog();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const form = e.target;
        const date = form.date.value;
        const memberId = form.memberId.value;
        const rawAmount = form.amount.value;
        const amount = Number(banglaToEnglish(rawAmount));

        if (!date || !memberId || !amount) {
            showAlert('সব তথ্য দিন');
            setIsSubmitting(false);
            return;
        }

        try {
            await addDeposit({ date, memberId, amount, month: selectedMonth }, selectedMonth);
            form.reset();
            form.date.value = getTodayString();
        } catch (err) {
            showAlert('জমা যোগ করতে সমস্যা হয়েছে');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveDeposit = async (id) => {
        const confirmed = await showConfirm('এই জমা মুছে ফেলতে চান?');
        if (confirmed) {
            await removeDeposit(id, selectedMonth);
        }
    };

    // Calculate per-member deposit totals
    const memberDepositTotals = {};
    deposits.forEach(d => {
        if (!memberDepositTotals[d.memberId]) memberDepositTotals[d.memberId] = 0;
        memberDepositTotals[d.memberId] += Number(d.amount);
    });

    const sectionStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' };
    const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' };

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Member Deposit Summary Cards */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={sectionStyle}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <TrendingUp className="text-emerald-400 mr-2 sm:mr-3 shrink-0" size={20} />
                    সদস্যদের জমা সারাংশ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {members.map(m => {
                        const total = memberDepositTotals[m.id] || 0;
                        const stat = memberStats?.find(s => s.id === m.id);
                        const totalContribution = stat?.totalContribution || 0;
                        return (
                            <div
                                key={m.id}
                                className="group flex flex-col justify-between p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                            >
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                                <div className="relative z-10 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                        <User size={16} className="sm:hidden" />
                                        <User size={18} className="hidden sm:block" />
                                    </div>
                                    <span className="font-black text-sm sm:text-base truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                                </div>
                                <div className="relative z-10">
                                    <p className="font-black text-emerald-400 text-xl sm:text-2xl md:text-3xl tracking-tight mb-2 break-words">
                                        ৳{englishToBangla(totalContribution.toFixed(2))}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                                        {(total > 0 || !stat?.ownExpense) && (
                                            <span className="inline-flex items-center bg-white/5 px-2 py-1 rounded-md font-bold text-[10px] sm:text-xs border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                                                জমা: <span className="ml-1" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(total.toFixed(0))}</span>
                                            </span>
                                        )}
                                        {stat?.ownExpense > 0 && (
                                            <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-bold text-[10px] sm:text-xs border border-emerald-500/20">
                                                পকেট: <span className="ml-1">৳{englishToBangla(stat.ownExpense.toFixed(0))}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form — Admin Only */}
            {isAdmin && (
                <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={sectionStyle}>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8" style={{ color: 'var(--text-primary)' }}>নতুন জমা যুক্ত করুন</h3>
                    <form onSubmit={handleDeposit} className="flex flex-col gap-4 sm:gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>তারিখ</label>
                                <input type="date" name="date" defaultValue={getTodayString()} required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base" style={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>সদস্যের নাম</label>
                                <select name="memberId" required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-bold text-sm sm:text-base" style={inputStyle}>
                                    <option value="">নির্বাচন করুন</option>
                                    {members.map(m => {
                                        const total = memberDepositTotals[m.id] || 0;
                                        return (
                                            <option key={m.id} value={m.id}>
                                                {m.name} — জমা: ৳{total.toFixed(0)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>জমার পরিমাণ</label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 font-black text-emerald-400">৳</span>
                                    <input type="text" inputMode="decimal" name="amount" placeholder="০" required className="w-full pl-8 sm:pl-10 pr-4 sm:pr-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-black text-base sm:text-lg" style={inputStyle} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="self-stretch sm:self-end bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center text-sm sm:text-base">
                            <Wallet className="mr-2" size={18} /> জমা যোগ করুন
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={sectionStyle}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8 flex items-center flex-wrap gap-2" style={{ color: 'var(--text-primary)' }}>
                    জমার তালিকা
                    <span className="bg-emerald-500/15 text-emerald-400 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{englishToBangla(deposits.length)} টি</span>
                </h3>

                {deposits.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 rounded-xl sm:rounded-2xl border border-dashed" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                        <Wallet className="mx-auto text-emerald-500/30 mb-3" size={36} />
                        <p className="font-medium text-sm sm:text-base">কোনো জমা এন্ট্রি করা হয়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                        {deposits.sort((a, b) => new Date(b.date) - new Date(a.date)).map(deposit => {
                            const member = members.find(m => m.id === deposit.memberId);
                            const memberTotal = memberDepositTotals[deposit.memberId] || 0;
                            return (
                                <div
                                    key={deposit.id}
                                    className="flex items-center justify-between p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border transition-all group gap-3 sm:gap-4"
                                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-emerald-500/15 shrink-0 flex items-center justify-center">
                                            <User size={16} className="text-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm sm:text-lg mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                                                {member?.name || 'অজ্ঞাত সদস্য'}
                                                <span className="ml-2 text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                    মোট: ৳{englishToBangla(memberTotal.toFixed(0))}
                                                </span>
                                            </h4>
                                            <p className="font-medium text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                {englishToBangla(deposit.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
                                        <p className="font-black tracking-tight text-base sm:text-xl lg:text-2xl text-emerald-400">
                                            + {formatCurrency(deposit.amount)}
                                        </p>
                                        {isAdmin && (
                                            <button onClick={() => handleRemoveDeposit(deposit.id)} className="p-2 sm:p-3 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg sm:rounded-xl transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
