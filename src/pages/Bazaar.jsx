import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User } from 'lucide-react';

export default function Bazaar() {
    const { isAdmin } = useAuth();
    const { members, utilities, setUtility, selectedMonth } = useData();

    const daysOfWeek = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
    const dayColors = ['bg-rose-50 border-rose-100', 'bg-orange-50 border-orange-100', 'bg-yellow-50 border-yellow-100', 'bg-emerald-50 border-emerald-100', 'bg-teal-50 border-teal-100', 'bg-blue-50 border-blue-100', 'bg-indigo-50 border-indigo-100'];

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 flex items-center">
                <ShoppingCart className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> বাজারের দায়িত্ব
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 lg:mb-8 font-medium">কোন দিন কে বাজার করবে তার তালিকা।</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
                {daysOfWeek.map((day, idx) => {
                    const assignedMemberId = utilities[`bazaar_${idx}`] || '';
                    const assignedMember = members.find(m => m.id === assignedMemberId);

                    return (
                        <div
                            key={idx}
                            className={`p-4 sm:p-5 rounded-[24px] border ${dayColors[idx]} shadow-sm transition-all flex flex-col items-center text-center`}
                        >
                            <div className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">{day}</div>
                            {isAdmin ? (
                                <div className="w-full relative">
                                    <select
                                        value={assignedMemberId}
                                        onChange={async (e) => {
                                            await setUtility(`bazaar_${idx}`, e.target.value, selectedMonth);
                                        }}
                                        className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm shadow-sm appearance-none outline-none"
                                    >
                                        <option value="">কেউ নেই</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <User size={14} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-slate-100 shadow-sm mb-1">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <span className="font-black text-slate-800 text-xs sm:text-sm px-2 py-1 bg-white/50 rounded-lg border border-white/50 w-full truncate">
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
