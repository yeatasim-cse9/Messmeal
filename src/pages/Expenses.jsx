import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, banglaToEnglish } from '../utils/helpers';
import { Receipt, Store, User, Trash2, Calendar, Wallet } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function Expenses() {
    const { isAdmin } = useAuth();
    const { members, expenses, addExpense, removeExpense, selectedMonth, deposits, memberStats } = useData();
    const { showAlert, showConfirm } = useDialog();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate per-member total contribution (deposit + own expense)
    const memberContributions = {};
    members.forEach(m => {
        const stat = memberStats?.find(s => s.id === m.id);
        memberContributions[m.id] = stat ? stat.totalContribution : 0;
    });

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const form = e.target;
        const date = form.date.value;
        const expenseType = form.expenseType.value;
        const rawAmount = form.amount.value;
        const amount = Number(banglaToEnglish(rawAmount));
        const description = form.description.value;

        if (!date || !expenseType || !amount || !description) {
            showAlert('সব তথ্য দিন');
            setIsSubmitting(false);
            return;
        }

        try {
            const isBaki = expenseType === 'baki';
            const isAdditional = expenseType === 'additional';

            let type = 'regular';
            if (isBaki) type = 'baki';
            if (isAdditional) type = 'additional';

            const memberId = (isBaki || isAdditional) ? null : expenseType;
            const fundSource = (isBaki || isAdditional) ? 'fund' : form.fundSource.value;

            await addExpense({
                date, memberId, amount, description, type, fundSource, month: selectedMonth
            }, selectedMonth);

            form.reset();
            form.date.value = getTodayString();
        } catch (error) {
            showAlert("খরচ যোগ করতে সমস্যা হয়েছে");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveExpense = async (id) => {
        const confirmed = await showConfirm('এই খরচটি মুছে ফেলতে চান?');
        if (confirmed) {
            await removeExpense(id, selectedMonth);
        }
    };

    const sectionStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' };
    const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' };

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Member Contribution Summary */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={sectionStyle}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <Wallet className="text-emerald-400 mr-2 sm:mr-3 shrink-0" size={20} />
                    সদস্যদের মোট জমা
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {members.map(m => {
                        const stat = memberStats?.find(s => s.id === m.id);
                        const totalDeposit = stat?.deposit || 0;
                        const ownExpense = stat?.ownExpense || 0;
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
                                    <p className="font-black text-emerald-400 text-xl sm:text-2xl tracking-tight mb-2 break-words">
                                        ৳{englishToBangla(totalContribution.toFixed(2))}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                                        {(totalDeposit > 0 || ownExpense === 0) && (
                                            <span className="inline-flex items-center bg-white/5 px-2 py-1 rounded-md font-bold text-[10px] sm:text-xs border border-white/10" style={{ color: 'var(--text-secondary)' }}>
                                                জমা: <span className="ml-1" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(totalDeposit.toFixed(0))}</span>
                                            </span>
                                        )}
                                        {ownExpense > 0 && (
                                            <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-bold text-[10px] sm:text-xs border border-emerald-500/20">
                                                পকেট: <span className="ml-1">৳{englishToBangla(ownExpense.toFixed(0))}</span>
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
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8" style={{ color: 'var(--text-primary)' }}>নতুন খরচ যুক্ত করুন</h3>
                    <form onSubmit={handleAddExpense} className="flex flex-col gap-4 sm:gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>তারিখ</label>
                                <div className="flex items-center border pl-3 sm:pl-4 pr-2 sm:pr-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all" style={inputStyle}>
                                    <Calendar className="mr-2 sm:mr-3 shrink-0" size={16} style={{ color: 'var(--text-muted)' }} />
                                    <input type="date" name="date" defaultValue={getTodayString()} required className="bg-transparent font-bold text-emerald-400 focus:outline-none cursor-pointer outline-none w-full text-sm sm:text-base" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>কে বাজার করেছে?</label>
                                <select name="expenseType" required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-bold text-sm sm:text-base" style={inputStyle}>
                                    <option value="">নির্বাচন করুন</option>
                                    <optgroup label="সদস্য">
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="অন্যান্য">
                                        <option value="baki">দোকানে বকেয়া</option>
                                        <option value="additional">অতিরিক্ত খরচ (সবার মাঝে ভাগ হবে)</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>টাকার উৎস</label>
                                <select name="fundSource" className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base" style={inputStyle}>
                                    <option value="fund">মেসের ফান্ড থেকে</option>
                                    <option value="own">নিজের পকেট থেকে</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>টাকার পরিমাণ</label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 font-black" style={{ color: 'var(--text-muted)' }}>৳</span>
                                    <input type="text" inputMode="decimal" name="amount" placeholder="০" required className="w-full pl-8 sm:pl-10 pr-4 sm:pr-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-black text-base sm:text-lg" style={inputStyle} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-muted)' }}>বিবরণ</label>
                            <input type="text" name="description" placeholder="কী কী বাজার করা হলো" required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border focus:ring-2 focus:ring-emerald-500 font-medium text-sm sm:text-base" style={inputStyle} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="self-stretch sm:self-end bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center text-sm sm:text-base">
                            <Receipt className="mr-2" size={18} /> খরচ যোগ করুন
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={sectionStyle}>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-6 lg:mb-8 flex items-center flex-wrap gap-2" style={{ color: 'var(--text-primary)' }}>
                    বাজার ও খরচের তালিকা
                    <span className="bg-white/5 text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10" style={{ color: 'var(--text-muted)' }}>{englishToBangla(expenses.length)} টি</span>
                </h3>

                {expenses.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 rounded-xl sm:rounded-2xl border border-dashed" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)', color: 'var(--text-muted)' }}>
                        <Receipt className="mx-auto mb-3 opacity-30" size={36} style={{ color: 'var(--text-muted)' }} />
                        <p className="font-medium text-sm sm:text-base">কোনো খরচ এন্ট্রি করা হয়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                        {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                            const isBaki = expense.type === 'baki';
                            const isAdditional = expense.type === 'additional';
                            const member = members.find(m => m.id === expense.memberId);

                            let title = member?.name || 'অজ্ঞাত সদস্য';
                            if (isBaki) title = 'দোকানে বকেয়া';
                            if (expense.type === 'baki_payment') title = 'বকেয়া পরিশোধ';
                            if (expense.type === 'rent_payment') title = 'বাসা ভাড়া পরিশোধ';
                            if (isAdditional) title = 'অতিরিক্ত খরচ';

                            let sourceLabel = 'ফান্ডের টাকা';
                            if (isBaki) sourceLabel = 'বকেয়া';
                            else if (expense.type === 'baki_payment') sourceLabel = 'বকেয়া পরিশোধ';
                            else if (expense.type === 'rent_payment') sourceLabel = 'ভাড়া পরিশোধ';
                            else if (isAdditional) sourceLabel = 'সবার মাঝে ভাগ';
                            else if (expense.fundSource === 'own') sourceLabel = 'নিজের টাকা';

                            let sourceColor = 'bg-blue-500/15 text-blue-400 border-blue-500/20';
                            if (isBaki) sourceColor = 'bg-rose-500/15 text-rose-400 border-rose-500/20';
                            else if (expense.type === 'baki_payment') sourceColor = 'bg-violet-500/15 text-violet-400 border-violet-500/20';
                            else if (expense.type === 'rent_payment') sourceColor = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';
                            else if (isAdditional) sourceColor = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
                            else if (expense.fundSource === 'own') sourceColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';

                            let iconBg = 'bg-blue-500/15';
                            let iconColor = 'text-blue-400';
                            if (isBaki) { iconBg = 'bg-rose-500/15'; iconColor = 'text-rose-400'; }
                            else if (isAdditional) { iconBg = 'bg-amber-500/15'; iconColor = 'text-amber-400'; }
                            else if (expense.fundSource === 'own') { iconBg = 'bg-emerald-500/15'; iconColor = 'text-emerald-400'; }

                            // Show contribution info for own-pocket expenses
                            const memberStat = memberStats?.find(s => s.id === expense.memberId);

                            return (
                                <div
                                    key={expense.id}
                                    className="flex items-start sm:items-center justify-between p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border transition-colors group gap-2 sm:gap-4"
                                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                                >
                                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full shrink-0 flex items-center justify-center ${iconBg}`}>
                                            {isBaki ? <Store size={16} className={iconColor} /> : isAdditional ? <Receipt size={16} className={iconColor} /> : expense.fundSource === 'own' ? <Wallet size={16} className={iconColor} /> : <User size={16} className={iconColor} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                                                {title}
                                                {expense.fundSource === 'own' && memberStat && (
                                                    <span className="ml-2 text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                        মোট জমা: ৳{englishToBangla(memberStat.totalContribution.toFixed(0))}
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="font-medium text-xs sm:text-sm flex items-center flex-wrap gap-x-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                <span>{englishToBangla(expense.date)}</span>
                                                <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>•</span>
                                                <span className="truncate">{expense.description}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
                                        <div className="text-right">
                                            <p className={`font-black tracking-tight text-base sm:text-xl lg:text-2xl ${isBaki ? 'text-rose-400' : expense.fundSource === 'own' ? 'text-emerald-400' : ''}`} style={!isBaki && expense.fundSource !== 'own' ? { color: 'var(--text-primary)' } : {}}>
                                                {formatCurrency(expense.amount)}
                                            </p>
                                            <span className={`hidden sm:inline-block mt-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border uppercase tracking-wider ${sourceColor}`}>
                                                {sourceLabel}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => handleRemoveExpense(expense.id)} className="p-2 sm:p-3 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg sm:rounded-xl transition-colors shrink-0" style={{ color: 'var(--text-muted)' }}>
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
