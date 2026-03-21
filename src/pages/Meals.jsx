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
        if (engValue === '' || /^\d*\.?\d*$/.test(engValue)) {
            await setMealValue(selectedDate, memberId, categoryId, engValue, selectedMonth);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">তারিখ অনুযায়ী মিল {isAdmin ? 'আপডেট' : 'দেখুন'}</h3>
                <div className="flex items-center bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:border-slate-300 transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500">
                    <Calendar className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={16} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent font-bold text-blue-600 focus:outline-none cursor-pointer outline-none text-sm sm:text-base w-[120px] sm:w-[140px]"
                    />
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
                {members.map(member => {
                    const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                    let totalDaily = 0;
                    mealCategories.forEach(cat => { totalDaily += Number(dayData[cat.id] || 0); });

                    return (
                        <div
                            key={member.id}
                            className="p-4 rounded-[24px] border border-slate-100 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]"
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <User size={16} className="text-slate-400" />
                                    </div>
                                    <span className="font-black text-slate-800 text-base truncate">{member.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট:</span>
                                    <span className="font-black text-slate-900 text-base">{englishToBangla(totalDaily)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mealCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 border border-slate-100/30">
                                        <span className={`text-[11px] font-black ${getMealHeaderClass(cat.color)} truncate mr-2`}>{cat.label}</span>
                                        {isAdmin ? (
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="০"
                                                value={englishToBangla(dayData[cat.id] || '')}
                                                onChange={(e) => handleMealChange(member.id, cat.id, e.target.value)}
                                                className={`w-12 text-center py-2 rounded-xl border font-black text-sm shadow-sm transition-all focus:ring-2 focus:scale-105 ${getMealInputClass(cat.color)}`}
                                            />
                                        ) : (
                                            <span className="font-black text-slate-700 text-sm bg-white w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100/50 shadow-sm">{englishToBangla(dayData[cat.id] || '০')}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="pb-5 font-bold text-slate-400 text-xs sm:text-sm pl-4 uppercase tracking-wider">সদস্যের নাম</th>
                            {mealCategories.map(cat => (
                                <th key={cat.id} className={`pb-5 font-bold text-center text-xs sm:text-sm uppercase tracking-wider ${getMealHeaderClass(cat.color)}`}>{cat.label}</th>
                            ))}
                            <th className="pb-5 font-bold text-right pr-6 uppercase tracking-wider text-slate-400 text-xs sm:text-sm">মোট (দিন)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map(member => {
                            const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                            let totalDaily = 0;
                            mealCategories.forEach(cat => { totalDaily += Number(dayData[cat.id] || 0); });

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-2 sm:py-6 font-bold text-slate-800 pl-4 text-sm sm:text-base">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                                                <User size={18} className="text-slate-400" />
                                            </div>
                                            <span className="font-black text-slate-900 truncate">{member.name}</span>
                                        </div>
                                    </td>
                                    {mealCategories.map(cat => (
                                        <td key={cat.id} className="py-2 text-center">
                                            {isAdmin ? (
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="০"
                                                    value={englishToBangla(dayData[cat.id] || '')}
                                                    onChange={(e) => handleMealChange(member.id, cat.id, e.target.value)}
                                                    className={`w-14 sm:w-16 text-center py-2.5 rounded-xl border font-black text-sm sm:text-base shadow-sm transition-all focus:ring-2 focus:scale-110 ${getMealInputClass(cat.color)}`}
                                                />
                                            ) : (
                                                <span className="font-black text-slate-700 text-sm sm:text-base bg-white w-12 h-12 inline-flex items-center justify-center rounded-xl border border-slate-100 shadow-sm">{englishToBangla(dayData[cat.id] || '০')}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-2 text-right pr-6">
                                        <div className="inline-flex items-center justify-center min-w-[3rem] p-2 bg-slate-900 text-white rounded-xl font-black text-base sm:text-lg shadow-lg shadow-slate-900/10">
                                            {englishToBangla(totalDaily)}
                                        </div>
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
