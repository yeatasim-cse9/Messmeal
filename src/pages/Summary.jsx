import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { formatCurrency, englishToBangla, getBanglaMonthYear, IconMap, banglaToEnglish } from '../utils/helpers';
import { generateMonthlyReport } from '../utils/pdfExport';
import { Calculator, Download, Trash2, Edit2, Plus } from 'lucide-react';

export default function Summary() {
    const { isAdmin } = useAuth();
    const {
        members, billCategories, utilities, setUtility, selectedMonth,
        memberStats, mealRate, totalMessFoodCost, totalDeposit,
        managerCashInHand, totalBakiExpense, totalUtilityCost,
        totalAdditionalExpense, utilityPerMember, expenses, deposits, updateSettings
    } = useData();
    const { showPrompt, showConfirm } = useDialog();

    const handleAddCat = async () => {
        const name = await showPrompt("নতুন বিলের নাম দিন (যেমন: বুয়ার বিল)");
        if (!name) return;
        const newCat = { id: `bill_${Date.now()}`, label: name, icon: 'Calculator' };
        await updateSettings({ billCategories: [...billCategories, newCat] });
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

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Fixed Bills */}
            <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
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
                            <div key={cat.id} className="group">
                                <label className="flex items-center justify-between text-[11px] sm:text-xs lg:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">
                                    <span className="flex items-center truncate"><CatIcon size={14} className="mr-1.5 sm:mr-2 shrink-0" /> <span className="truncate">{cat.label}</span></span>
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
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Final Report Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50 overflow-hidden p-4 sm:p-6 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">ফাইনাল রিপোর্ট</h3>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-[11px] sm:text-sm font-medium text-slate-400 bg-slate-50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg truncate">
                            বিল প্রতি জন: {formatCurrency(utilityPerMember)}
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
                        <div key={stat.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-slate-900 text-sm truncate">{stat.name}</span>
                                <span className={`font-black text-base ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toFixed(0))}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-500 font-medium">
                                <span>মিল: <strong className="text-slate-700">{englishToBangla(stat.totalMeals)}</strong></span>
                                <span className="text-right">খাবার: <strong className="text-slate-700">{formatCurrency(stat.foodCost)}</strong></span>
                                <span>বিল: <strong className="text-slate-700">{formatCurrency(stat.utilityCost)}</strong></span>
                                <span className="text-right">অতিরিক্ত: <strong className="text-amber-600">{formatCurrency(stat.additionalExpense)}</strong></span>
                                <span>জমা: <strong className="text-slate-700">{formatCurrency(stat.totalContribution)}</strong></span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto -mx-2 px-2">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-slate-400 text-[11px] lg:text-xs uppercase tracking-wider font-bold">
                                <th className="pb-4 pl-3">মেম্বার</th>
                                <th className="pb-4 text-center">মোট মিল</th>
                                <th className="pb-4 text-center">খাবার খরচ</th>
                                <th className="pb-4 text-center">ফিক্সড বিল</th>
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
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.foodCost.toFixed(0))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.utilityCost.toFixed(0))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-amber-600">৳{englishToBangla(stat.additionalExpense.toFixed(0))}</span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <span className="font-black text-slate-800">৳{englishToBangla(stat.totalContribution.toFixed(0))}</span>
                                    </td>
                                    <td className={`py-4 text-right pr-3 font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toFixed(0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Info Row */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1">মিল রেট</div>
                        <div className="text-lg sm:text-xl font-black text-slate-900">৳{englishToBangla(mealRate.toFixed(2))}</div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1">মোট বাজার</div>
                        <div className="text-lg sm:text-xl font-black text-slate-900">{formatCurrency(totalMessFoodCost)}</div>
                    </div>
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                        <div className="text-[10px] sm:text-xs text-amber-500 font-medium mb-1">মোট অতিরিক্ত খরচ</div>
                        <div className="text-lg sm:text-xl font-black text-amber-600">{formatCurrency(totalAdditionalExpense)}</div>
                    </div>
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                        <div className="text-[10px] sm:text-xs text-emerald-500 font-medium mb-1">হাতে আছে</div>
                        <div className="text-lg sm:text-xl font-black text-emerald-700">{formatCurrency(managerCashInHand)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
