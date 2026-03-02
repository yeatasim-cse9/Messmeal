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
        utilityPerMember, expenses, deposits, updateSettings
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Fixed Bills */}
            <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <Calculator className="text-slate-400 mr-3" size={24} /> ফিক্সড বিল {!isAdmin && '(শুধু দেখা)'}
                    </h3>
                    {isAdmin && (
                        <button onClick={handleAddCat} className="flex items-center text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl transition-colors border border-slate-200">
                            <Plus size={16} className="mr-1.5" /> ক্যাটাগরি তৈরি করুন
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {billCategories.map(cat => {
                        const CatIcon = IconMap[cat.icon] || Calculator;
                        return (
                            <div key={cat.id} className="group">
                                <label className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
                                    <span className="flex items-center"><CatIcon size={16} className="mr-2" /> {cat.label}</span>
                                    {isAdmin && (
                                        <div className="hidden group-hover:flex items-center gap-1.5 ml-2">
                                            <button onClick={() => handleEditCat(cat)} className="p-1 text-slate-300 hover:text-blue-500 transition-colors bg-white rounded-md shadow-sm border border-slate-100" title="এডিট করুন">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteCat(cat.id, cat.label)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors bg-white rounded-md shadow-sm border border-slate-100" title="ডিলিট করুন">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">৳</span>
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
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-slate-50 font-black text-slate-800 disabled:opacity-70 disabled:bg-slate-100"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Final Report Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-50 overflow-hidden p-6 sm:p-10">
                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center justify-between flex-wrap gap-3">
                    <span>ফাইনাল রিপোর্ট</span>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-slate-400 bg-slate-50 px-4 py-2 rounded-lg">মেম্বার প্রতি বিল: {formatCurrency(utilityPerMember)}</span>
                        <button onClick={() => generateMonthlyReport({
                            monthLabel: getBanglaMonthYear(selectedMonth),
                            memberStats, mealRate, totalMessFoodCost, totalDeposit,
                            managerCashInHand, totalBakiExpense, totalUtilityCost,
                            utilityPerMember, expenses, deposits, members
                        })} className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold text-sm transition-all shadow-md">
                            <Download size={16} /> PDF ডাউনলোড
                        </button>
                    </div>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                                <th className="pb-4 font-bold pl-2">মেম্বারের নাম</th>
                                <th className="pb-4 font-bold text-center">মিল</th>
                                <th className="pb-4 font-bold text-right">খাবার খরচ</th>
                                <th className="pb-4 font-bold text-right">ফিক্সড বিল</th>
                                <th className="pb-4 font-bold text-right">মোট জমা</th>
                                <th className="pb-4 font-bold text-right pr-4">ব্যালেন্স</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {memberStats.map(stat => (
                                <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 font-bold text-slate-900 pl-2">{stat.name}</td>
                                    <td className="py-4 text-center font-medium text-slate-600">{englishToBangla(stat.totalMeals)}</td>
                                    <td className="py-4 text-right font-medium text-slate-600">{formatCurrency(stat.foodCost)}</td>
                                    <td className="py-4 text-right font-medium text-slate-600">{formatCurrency(stat.utilityCost)}</td>
                                    <td className="py-4 text-right font-medium text-slate-600">{formatCurrency(stat.totalContribution)}</td>
                                    <td className={`py-4 text-right pr-4 font-black text-lg ${stat.balance >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>
                                        {stat.balance >= 0 ? '+ ' : '- '}{formatCurrency(Math.abs(stat.balance))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
