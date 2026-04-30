import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User } from 'lucide-react';

export default function Bazaar() {
    const { isAdmin } = useAuth();
    const { members, utilities, setUtility, selectedMonth } = useData();

    const daysOfWeek = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
    const dayAccents = [
        'bg-rose-500/10 border-rose-500/20',
        'bg-orange-500/10 border-orange-500/20',
        'bg-amber-500/10 border-amber-500/20',
        'bg-emerald-500/10 border-emerald-500/20',
        'bg-teal-500/10 border-teal-500/20',
        'bg-blue-500/10 border-blue-500/20',
        'bg-indigo-500/10 border-indigo-500/20',
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <ShoppingCart className="mr-2 sm:mr-3 shrink-0" size={20} style={{ color: 'var(--text-muted)' }} /> বাজারের দায়িত্ব
            </h3>
            <p className="text-xs sm:text-sm mb-4 sm:mb-6 lg:mb-8 font-medium" style={{ color: 'var(--text-muted)' }}>কোন দিন কে বাজার করবে তার তালিকা।</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
                {daysOfWeek.map((day, idx) => {
                    const assignedMemberId = utilities[`bazaar_${idx}`] || '';
                    const assignedMember = members.find(m => m.id === assignedMemberId);

                    return (
                        <div
                            key={idx}
                            className={`p-4 sm:p-5 rounded-2xl border ${dayAccents[idx]} transition-all flex flex-col items-center text-center`}
                        >
                            <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>{day}</div>
                            {isAdmin ? (
                                <div className="w-full relative">
                                    <select
                                        value={assignedMemberId}
                                        onChange={async (e) => {
                                            await setUtility(`bazaar_${idx}`, e.target.value, selectedMonth);
                                        }}
                                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border font-bold focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm appearance-none outline-none"
                                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="">কেউ নেই</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                        <User size={14} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-secondary)' }}>
                                        <User size={18} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <span className="font-black text-xs sm:text-sm px-2 py-1 rounded-lg w-full truncate" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                                        {assignedMember ? assignedMember.name : 'কেউ নেই'}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
