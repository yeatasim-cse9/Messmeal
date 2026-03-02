import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, banglaToEnglish } from '../utils/helpers';
import { Receipt, Store, User, Trash2, Calendar } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function Expenses() {
    const { isAdmin } = useAuth();
    const { members, expenses, addExpense, removeExpense, selectedMonth } = useData();
    const { showAlert, showConfirm } = useDialog();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            {/* Form — Admin Only */}
            {isAdmin && (
                <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 sm:mb-6 lg:mb-8">নতুন খরচ যুক্ত করুন</h3>
                    <form onSubmit={handleAddExpense} className="flex flex-col gap-4 sm:gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">তারিখ</label>
                                <div className="flex items-center bg-slate-50 border border-slate-200 pl-3 sm:pl-4 pr-2 sm:pr-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:border-slate-300 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500">
                                    <Calendar className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={16} />
                                    <input type="date" name="date" defaultValue={getTodayString()} required className="bg-transparent font-bold text-blue-600 focus:outline-none cursor-pointer outline-none w-full text-sm sm:text-base" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">কে বাজার করেছে?</label>
                                <select name="expenseType" required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-bold text-slate-800 text-sm sm:text-base">
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
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">টাকার উৎস</label>
                                <select name="fundSource" className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-sm sm:text-base">
                                    <option value="fund">মেসের ফান্ড থেকে</option>
                                    <option value="own">নিজের পকেট থেকে</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">টাকার পরিমাণ</label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                                    <input type="text" inputMode="decimal" name="amount" placeholder="০" required className="w-full pl-8 sm:pl-10 pr-4 sm:pr-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-black text-slate-900 text-base sm:text-lg" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">বিবরণ</label>
                            <input type="text" name="description" placeholder="কী কী বাজার করা হলো" required className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700 text-sm sm:text-base" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="self-stretch sm:self-end bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center text-sm sm:text-base">
                            <Receipt className="mr-2" size={18} /> খরচ যোগ করুন
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 sm:mb-6 lg:mb-8 flex items-center flex-wrap gap-2">
                    বাজার ও খরচের তালিকা
                    <span className="bg-slate-50 text-slate-400 text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{englishToBangla(expenses.length)} টি</span>
                </h3>

                {expenses.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl sm:rounded-2xl border border-dashed border-slate-200">
                        <Receipt className="mx-auto text-slate-300 mb-3" size={36} />
                        <p className="text-slate-500 font-medium text-sm sm:text-base">কোনো খরচ এন্ট্রি করা হয়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                        {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                            const isBaki = expense.type === 'baki';
                            const isAdditional = expense.type === 'additional';
                            const member = members.find(m => m.id === expense.memberId);

                            let title = member?.name || 'অজ্ঞাত সদস্য';
                            if (isBaki) title = 'দোকানে বকেয়া';
                            if (isAdditional) title = 'অতিরিক্ত খরচ';

                            let sourceLabel = 'ফান্ডের টাকা';
                            if (isBaki) sourceLabel = 'বকেয়া';
                            else if (isAdditional) sourceLabel = 'সবার মাঝে ভাগ';
                            else if (expense.fundSource === 'own') sourceLabel = 'নিজের টাকা';

                            let sourceColor = 'bg-blue-50 text-blue-600 border-blue-100';
                            if (isBaki) sourceColor = 'bg-rose-50 text-rose-600 border-rose-100';
                            else if (isAdditional) sourceColor = 'bg-amber-50 text-amber-600 border-amber-100';

                            return (
                                <div key={expense.id} className="flex items-start sm:items-center justify-between p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-colors group gap-2 sm:gap-4">
                                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full shrink-0 flex items-center justify-center border ${isBaki ? 'bg-rose-50 border-rose-100' : isAdditional ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                            {isBaki ? <Store size={16} className="text-rose-500" /> : isAdditional ? <Receipt size={16} className="text-amber-500" /> : <User size={16} className="text-slate-400" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{title}</h4>
                                            <p className="text-slate-500 font-medium text-[11px] sm:text-sm flex items-center flex-wrap gap-x-2">
                                                <span>{englishToBangla(expense.date)}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="truncate">{expense.description}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-6 lg:gap-8 shrink-0">
                                        <div className="text-right">
                                            <p className={`font-black tracking-tight text-base sm:text-xl lg:text-2xl ${isBaki ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {formatCurrency(expense.amount)}
                                            </p>
                                            <span className={`hidden sm:inline-block mt-1 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border uppercase tracking-wider ${sourceColor}`}>
                                                {sourceLabel}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => handleRemoveExpense(expense.id)} className="p-2 sm:p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-colors shrink-0">
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
