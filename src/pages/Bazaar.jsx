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
        <div className="bg-white p-6 sm:p-10 rounded-[32px] shadow-sm border border-slate-50">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                <ShoppingCart className="text-slate-400 mr-3" size={24} /> বাজারের দায়িত্ব
            </h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">কোন দিন কে বাজার করবে তার তালিকা দেখুন।</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {daysOfWeek.map((day, idx) => {
                    const assignedMemberId = utilities[`bazaar_${idx}`] || '';
                    const assignedMember = members.find(m => m.id === assignedMemberId);

                    return (
                        <div key={idx} className={`p-5 rounded-2xl border ${dayColors[idx]} transition-all`}>
                            <div className="text-sm font-bold text-slate-500 mb-3">{day}</div>
                            {isAdmin ? (
                                <select
                                    value={assignedMemberId}
                                    onChange={async (e) => {
                                        await setUtility(`bazaar_${idx}`, e.target.value, selectedMonth);
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="">কেউ নির্ধারিত হয়নি</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200">
                                        <User size={18} className="text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-800">
                                        {assignedMember ? assignedMember.name : 'কেউ নির্ধারিত হয়নি'}
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
