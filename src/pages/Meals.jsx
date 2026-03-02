import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { englishToBangla, banglaToEnglish } from '../utils/helpers';
import { User, Calendar } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50"
        >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
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
            </motion.div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
                {members.map(member => {
                    const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                    let totalDaily = 0;
                    mealCategories.forEach(cat => { totalDaily += Number(dayData[cat.id] || 0); });

                    return (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            key={member.id}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center space-x-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User size={12} className="text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-sm truncate">{member.name}</span>
                                </div>
                                <span className="font-black text-slate-900 text-base">{englishToBangla(totalDaily)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {mealCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2">
                                        <span className={`text-xs font-medium ${getMealHeaderClass(cat.color)} truncate`}>{cat.label}</span>
                                        {isAdmin ? (
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="০"
                                                value={englishToBangla(dayData[cat.id] || '')}
                                                onChange={(e) => handleMealChange(member.id, cat.id, e.target.value)}
                                                className={`w-12 text-center p-1.5 rounded-lg border font-bold text-sm ${getMealInputClass(cat.color)}`}
                                            />
                                        ) : (
                                            <span className="font-bold text-slate-700 text-sm">{englishToBangla(dayData[cat.id] || '০')}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <motion.div variants={itemVariants} className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-400 text-xs sm:text-sm">
                            <th className="pb-3 sm:pb-4 font-medium pl-2">সদস্যের নাম</th>
                            {mealCategories.map(cat => (
                                <th key={cat.id} className={`pb-3 sm:pb-4 font-medium text-center ${getMealHeaderClass(cat.color)}`}>{cat.label}</th>
                            ))}
                            <th className="pb-3 sm:pb-4 font-medium text-right pr-4">মোট (দিন)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map(member => {
                            const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                            let totalDaily = 0;
                            mealCategories.forEach(cat => { totalDaily += Number(dayData[cat.id] || 0); });

                            return (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 sm:py-5 font-bold text-slate-800 pl-2 text-sm sm:text-base">
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <User size={12} className="text-slate-400" />
                                            </div>
                                            <span className="truncate">{member.name}</span>
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
                                                    className={`w-12 sm:w-14 text-center p-1.5 sm:p-2 rounded-lg border font-bold text-sm sm:text-base ${getMealInputClass(cat.color)}`}
                                                />
                                            ) : (
                                                <span className="font-bold text-slate-700 text-sm sm:text-base">{englishToBangla(dayData[cat.id] || '০')}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-3 text-right pr-4 font-black text-base sm:text-lg text-slate-900">
                                        {englishToBangla(totalDaily)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
}
