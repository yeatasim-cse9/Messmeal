import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Bazaar() {
    const { isAdmin } = useAuth();
    const { members, utilities, setUtility, selectedMonth } = useData();

    const daysOfWeek = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];
    const dayColors = ['bg-rose-50 border-rose-100', 'bg-orange-50 border-orange-100', 'bg-yellow-50 border-yellow-100', 'bg-emerald-50 border-emerald-100', 'bg-teal-50 border-teal-100', 'bg-blue-50 border-blue-100', 'bg-indigo-50 border-indigo-100'];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white p-4 sm:p-6 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-sm border border-slate-50"
        >
            <motion.h3 variants={itemVariants} className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 flex items-center">
                <ShoppingCart className="text-slate-400 mr-2 sm:mr-3 shrink-0" size={20} /> বাজারের দায়িত্ব
            </motion.h3>
            <motion.p variants={itemVariants} className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 lg:mb-8 font-medium">কোন দিন কে বাজার করবে তার তালিকা।</motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3 lg:gap-4">
                {daysOfWeek.map((day, idx) => {
                    const assignedMemberId = utilities[`bazaar_${idx}`] || '';
                    const assignedMember = members.find(m => m.id === assignedMemberId);

                    return (
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                            key={idx}
                            className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border ${dayColors[idx]} transition-all`}
                        >
                            <div className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-500 mb-2 sm:mb-3">{day}</div>
                            {isAdmin ? (
                                <select
                                    value={assignedMemberId}
                                    onChange={async (e) => {
                                        await setUtility(`bazaar_${idx}`, e.target.value, selectedMonth);
                                    }}
                                    className="w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm shadow-sm"
                                >
                                    <option value="">কেউ নেই</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                                        {assignedMember ? assignedMember.name : 'কেউ নেই'}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
