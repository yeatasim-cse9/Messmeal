import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { englishToBangla, banglaToEnglish } from '../utils/helpers';
import { User, Calendar } from 'lucide-react';

const getMealInputClass = (color) => {
    const map = {
        indigo: 'bg-indigo-50 border-indigo-100 focus:ring-indigo-500 text-indigo-700',
        emerald: 'bg-emerald-50 border-emerald-100 focus:ring-emerald-500 text-emerald-700',
        amber: 'bg-amber-50 border-amber-100 focus:ring-amber-500 text-amber-700',
        slate: 'bg-slate-50 border-slate-200 focus:ring-slate-900 focus:border-slate-900 text-slate-800',
    };
    return map[color] || map.slate;
};

const getMealHeaderClass = (color) => {
    const map = {
        indigo: 'text-indigo-400',
        emerald: 'text-emerald-500',
        amber: 'text-amber-500',
        slate: 'text-slate-400',
    };
    return map[color] || map.slate;
};

export default function Meals() {
    const { isAdmin } = useAuth();
    const { members, meals, mealCategories, selectedDate, setSelectedDate, setMealValue, selectedMonth } = useData();

    const handleMealChange = async (memberId, categoryId, value) => {
        const engValue = banglaToEnglish(value);
        // allow empty or English numbers for validation
        if (engValue === '' || /^\d*\.?\d*$/.test(engValue)) {
            await setMealValue(selectedDate, memberId, categoryId, engValue, selectedMonth);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 className="text-xl font-bold text-slate-900">তারিখ অনুযায়ী মিল {isAdmin ? 'আপডেট' : 'দেখুন'}</h3>
                <div className="flex items-center bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] pl-4 pr-3 py-2.5 rounded-xl hover:border-slate-300 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500">
                    <Calendar className="text-slate-400 mr-3 shrink-0" size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent font-bold text-blue-600 focus:outline-none cursor-pointer outline-none w-[130px] sm:w-[140px]"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-sm">
                            <th className="pb-4 font-medium pl-2">সদস্যের নাম</th>
                            {mealCategories.map(cat => (
                                <th key={cat.id} className={`pb-4 font-medium text-center ${getMealHeaderClass(cat.color)}`}>{cat.label}</th>
                            ))}
                            <th className="pb-4 font-medium text-right pr-4">মোট (দিন)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map(member => {
                            const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                            let totalDaily = 0;
                            mealCategories.forEach(cat => { totalDaily += Number(dayData[cat.id] || 0); });

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-5 font-bold text-slate-800 pl-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User size={14} className="text-slate-400" />
                                            </div>
                                            <span>{member.name}</span>
                                        </div>
                                    </td>
                                    {mealCategories.map(cat => (
                                        <td key={cat.id} className="py-3 text-center">
                                            {isAdmin ? (
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="০"
                                                    value={englishToBangla(dayData[cat.id] || '')}
                                                    onChange={(e) => handleMealChange(member.id, cat.id, e.target.value)}
                                                    className={`w-14 text-center p-2 rounded-lg border font-bold ${getMealInputClass(cat.color)}`}
                                                />
                                            ) : (
                                                <span className="font-bold text-slate-700">{englishToBangla(dayData[cat.id] || '০')}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-3 text-right pr-4 font-black text-lg text-slate-900">
                                        {englishToBangla(totalDaily)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
