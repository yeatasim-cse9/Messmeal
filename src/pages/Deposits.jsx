import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, banglaToEnglish } from '../utils/helpers';
import { Wallet, User, Trash2 } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function Deposits() {
    const { isAdmin } = useAuth();
    const { members, deposits, addDeposit, removeDeposit, selectedMonth } = useData();
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

    return (
        <div className="space-y-6">
            {/* Form — Admin Only */}
            {isAdmin && (
                <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">নতুন জমা যুক্ত করুন</h3>
                    <form onSubmit={handleDeposit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">তারিখ</label>
                                <input type="date" name="date" defaultValue={getTodayString()} required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-medium text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">সদস্যের নাম</label>
                                <select name="memberId" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-bold text-slate-800">
                                    <option value="">নির্বাচন করুন</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">জমার পরিমাণ</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500">৳</span>
                                    <input type="text" inputMode="decimal" name="amount" placeholder="০" required className="w-full pl-10 pr-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 font-black text-emerald-900 text-lg" />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="self-end bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center">
                            <Wallet className="mr-2" size={20} /> জমা যোগ করুন
                        </button>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                    জমার তালিকা
                    <span className="ml-3 bg-emerald-50 text-emerald-600 text-sm font-bold px-3 py-1 rounded-full">{englishToBangla(deposits.length)} টি এন্ট্রি</span>
                </h3>

                {deposits.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Wallet className="mx-auto text-emerald-300 mb-3" size={48} />
                        <p className="text-slate-500 font-medium">কোনো জমা এন্ট্রি করা হয়নি</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {deposits.sort((a, b) => new Date(b.date) - new Date(a.date)).map(deposit => {
                            const member = members.find(m => m.id === deposit.memberId);
                            return (
                                <div key={deposit.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm bg-white transition-all group gap-4">
                                    <div className="flex items-start sm:items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-50 shrink-0 flex items-center justify-center border border-emerald-100">
                                            <User size={20} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg mb-1">{member?.name || 'অজ্ঞাত সদস্য'}</h4>
                                            <p className="text-slate-500 font-medium text-sm flex items-center">
                                                <span className="mr-3">{englishToBangla(deposit.date)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 ml-16 sm:ml-0">
                                        <p className="font-black tracking-tight text-xl sm:text-2xl text-emerald-600">
                                            + {formatCurrency(deposit.amount)}
                                        </p>
                                        {isAdmin && (
                                            <button onClick={() => handleRemoveDeposit(deposit.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0">
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
