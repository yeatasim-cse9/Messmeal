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
        const expenseType = form.expenseType.value; // 'baki', 'additional', or memberId
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
                date,
                memberId,
                amount,
                description,
                type,
                fundSource,
                month: selectedMonth
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Form — Admin Only */}
            {isAdmin && (
                <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">নতুন খরচ যুক্ত করুন</h3>
                    <form onSubmit={handleAddExpense} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">তারিখ</label>
                                <div className="flex items-center bg-slate-50 border border-slate-200 pl-4 pr-3 py-3 rounded-xl hover:border-slate-300 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500">
                                    <Calendar className="text-slate-400 mr-3 shrink-0" size={18} />
                                    <input type="date" name="date" defaultValue={getTodayString()} required className="bg-transparent font-bold text-blue-600 focus:outline-none cursor-pointer outline-none w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">কে বাজার করেছে?</label>
                                <select name="expenseType" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-bold text-slate-800">
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
                                <label className="block text-sm font-medium text-slate-400 mb-2">টাকার উৎস (মেম্বারের ক্ষেত্রে)</label>
                                <select name="fundSource" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700">
                                    <option value="fund">মেসের ফান্ড থেকে</option>
                                    <option value="own">নিজের পকেট থেকে</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">টাকার পরিমাণ</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
                                    <input type="text" inputMode="decimal" name="amount" placeholder="০" required className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-black text-slate-900 text-lg" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">বিবরণ</label>
                            <input type="text" name="description" placeholder="কী কী বাজার করা হলো (যেমন: চাল, ডাল, মুরগি)" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="self-end bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center">
                            <Receipt className="mr-2" size={20} /> খরচ যোগ করুন
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                    বাজার ও খরচের তালিকা
                    <span className="ml-3 bg-slate-50 text-slate-400 text-sm px-3 py-1 rounded-full">{englishToBangla(expenses.length)} টি এন্ট্রি</span>
                </h3>

                {expenses.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Receipt className="mx-auto text-slate-300 mb-3" size={48} />
                        <p className="text-slate-500 font-medium">কোনো খরচ এন্ট্রি করা হয়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                            const isBaki = expense.type === 'baki';
                            const isAdditional = expense.type === 'additional';
                            const member = members.find(m => m.id === expense.memberId);

                            let title = member?.name || 'অজ্ঞাত সদস্য';
                            if (isBaki) title = 'দোকানে বকেয়া';
                            if (isAdditional) title = 'অতিরিক্ত খরচ';

                            let sourceLabel = 'ফান্ডের টাকা';
                            if (isBaki) sourceLabel = 'দোকানে বকেয়া';
                            else if (isAdditional) sourceLabel = 'সবার মাঝে ভাগ হবে';
                            else if (expense.fundSource === 'own') sourceLabel = 'নিজের টাকা';

                            let sourceColor = 'bg-blue-50 text-blue-600 border-blue-100';
                            if (isBaki) sourceColor = 'bg-rose-50 text-rose-600 border-rose-100';
                            else if (isAdditional) sourceColor = 'bg-amber-50 text-amber-600 border-amber-100';

                            return (
                                <div key={expense.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white transition-colors group gap-4">
                                    <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                                        <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center border ${isBaki ? 'bg-rose-50 border-rose-100' : isAdditional ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                                            {isBaki ? <Store size={20} className="text-rose-500" /> : isAdditional ? <Receipt size={20} className="text-amber-500" /> : <User size={20} className="text-slate-400" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
                                            <p className="text-slate-500 font-medium text-sm flex items-center">
                                                <span className="mr-3">{englishToBangla(expense.date)}</span>
                                                <span>• {expense.description}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 ml-16 sm:ml-0">
                                        <div className="text-left sm:text-right">
                                            <p className={`font-black tracking-tight text-xl sm:text-2xl ${isBaki ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {formatCurrency(expense.amount)}
                                            </p>
                                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${sourceColor}`}>
                                                {sourceLabel}
                                            </span>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => handleRemoveExpense(expense.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0">
                                                <Trash2 size={20} />
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
