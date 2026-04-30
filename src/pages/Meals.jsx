import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { englishToBangla, banglaToEnglish } from '../utils/helpers';
import { User, Calendar } from 'lucide-react';

const getMealInputStyle = (color) => {
    const map = {
        indigo: { backgroundColor: 'var(--indigo-dim)', borderColor: 'var(--indigo)', color: 'var(--indigo)' },
        emerald: { backgroundColor: 'var(--emerald-dim)', borderColor: 'var(--emerald)', color: 'var(--emerald)' },
        amber: { backgroundColor: 'var(--amber-dim)', borderColor: 'var(--amber)', color: 'var(--amber)' },
        slate: { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' },
    };
    return map[color] || map.slate;
};

const getMealHeaderStyle = (color) => {
    const map = {
        indigo: { color: 'var(--indigo)' },
        emerald: { color: 'var(--emerald)' },
        amber: { color: 'var(--amber)' },
        slate: { color: 'var(--text-muted)' },
    };
    return map[color] || map.slate;
};

export default function Meals() {
    const { isAdmin, userProfile } = useAuth();
    const { members, meals, mealCategories, selectedDate, setSelectedDate, setMealValue, selectedMonth } = useData();

    const isCategoryLocked = (cat) => {
        if (isAdmin) return false;
        
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate < today) return true; // Past dates are locked
        if (selectedDate > today) return false; // Future dates are open

        // Today: check time
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const lockTime = cat.lockTime || "09:00";
        
        return currentTime >= lockTime;
    };

    const handleMealChange = async (member, categoryId, value) => {
        const isLinked = userProfile?.email === member.linkedEmail;
        const cat = mealCategories.find(c => c.id === categoryId);
        const locked = isCategoryLocked(cat);

        if (!isAdmin && (!isLinked || locked)) return;

        const engValue = banglaToEnglish(value);
        if (engValue === '' || /^\d*\.?\d*$/.test(engValue)) {
            await setMealValue(selectedDate, member.id, categoryId, engValue, selectedMonth);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-8 gap-3 sm:gap-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>তারিখ অনুযায়ী মিল {isAdmin ? 'আপডেট' : 'দেখুন'}</h3>
                <div className="flex items-center border pl-3 sm:pl-4 pr-2 sm:pr-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)' }}>
                    <Calendar className="mr-2 sm:mr-3 shrink-0" size={16} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent font-bold text-emerald-400 focus:outline-none cursor-pointer outline-none text-sm sm:text-base w-[120px] sm:w-[140px]"
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
                            className="p-4 rounded-2xl border"
                            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}
                        >
                            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-secondary)' }}>
                                        <User size={16} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <span className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-secondary)' }}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>মোট:</span>
                                    <span className="font-black text-base" style={{ color: 'var(--text-primary)' }}>{englishToBangla(totalDaily)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {mealCategories.map(cat => (
                                    <div key={cat.id} className="flex flex-col p-2.5 rounded-xl gap-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black truncate mr-2" style={getMealHeaderStyle(cat.color)}>{cat.label}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{cat.lockTime || '09:00'}</span>
                                        </div>
                                        {(isAdmin || (userProfile?.email === member.linkedEmail && !isCategoryLocked(cat))) ? (
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="০"
                                                value={englishToBangla(dayData[cat.id] === undefined ? '1' : dayData[cat.id])}
                                                onChange={(e) => handleMealChange(member, cat.id, e.target.value)}
                                                className={`w-full text-center py-2 rounded-xl border font-black text-sm transition-all focus:ring-2 focus:scale-105 ${isCategoryLocked(cat) ? 'opacity-50 grayscale' : ''}`}
                                                style={getMealInputStyle(cat.color)}
                                            />
                                        ) : (
                                            <span className="font-black text-sm w-full h-10 flex items-center justify-center rounded-xl opacity-80" style={getMealInputStyle(cat.color)}>{englishToBangla(dayData[cat.id] === undefined ? '1' : (dayData[cat.id] || '০'))}</span>
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
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            <th className="pb-5 font-bold text-xs sm:text-sm pl-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>সদস্যের নাম</th>
                            {mealCategories.map(cat => (
                                <th key={cat.id} className="pb-5 font-bold text-center text-xs sm:text-sm uppercase tracking-wider" style={getMealHeaderStyle(cat.color)}>{cat.label}</th>
                            ))}
                            <th className="pb-5 font-bold text-right pr-6 uppercase tracking-wider text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>মোট (দিন)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => {
                            const dayData = (meals[selectedDate] && meals[selectedDate][member.id]) || {};
                            let totalDaily = 0;
                            mealCategories.forEach(cat => { 
                                const val = dayData[cat.id];
                                totalDaily += (val === undefined) ? 1 : Number(val);
                            });

                            return (
                                <tr key={member.id} className="group" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <td className="py-2 sm:py-6 font-bold pl-4 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-secondary)' }}>
                                                <User size={18} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                            <span className="font-black truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                                        </div>
                                    </td>
                                    {mealCategories.map(cat => {
                                        const locked = isCategoryLocked(cat);
                                        const isLinked = userProfile?.email === member.linkedEmail;
                                        const canEdit = isAdmin || (isLinked && !locked);

                                        return (
                                            <td key={cat.id} className="py-2 text-center">
                                                {canEdit ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="০"
                                                            value={englishToBangla(dayData[cat.id] || '')}
                                                            onChange={(e) => handleMealChange(member, cat.id, e.target.value)}
                                                            className="w-14 sm:w-16 text-center py-2.5 rounded-xl border font-black text-sm sm:text-base transition-all focus:ring-2 focus:scale-110"
                                                            style={getMealInputStyle(cat.color)}
                                                        />
                                                        <span className="text-[9px] font-bold text-slate-400">{cat.lockTime || '09:00'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="font-black text-sm sm:text-base w-12 h-12 inline-flex items-center justify-center rounded-xl opacity-80" style={getMealInputStyle(cat.color)}>{englishToBangla(dayData[cat.id] || '০')}</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="py-2 text-right pr-6">
                                        <div className="inline-flex items-center justify-center min-w-[3rem] p-2 bg-emerald-500 text-white rounded-xl font-black text-base sm:text-lg shadow-lg shadow-emerald-500/20">
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
