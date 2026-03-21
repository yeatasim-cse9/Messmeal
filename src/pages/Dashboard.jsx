import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, englishToBangla } from '../utils/helpers';
import { TrendingUp, AlertTriangle, ShoppingBag, Utensils, Wallet, User as UserIcon, Receipt } from 'lucide-react';

export default function Dashboard() {
    const { userProfile } = useAuth();
    const {
        members, totalMeals, mealRate, totalMessFoodCost, totalBakiExpense, totalDeposit, managerCashInHand, totalAdditionalExpense, memberStats
    } = useData();

    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Stat Cards - Top Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">

                {/* Card 1: Mill Rate */}
                <div className="group bg-white hover:bg-slate-50/50 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100/60 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                                <TrendingUp size={14} />
                            </div>
                            <h3 className="text-slate-500 font-bold text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider truncate">বর্তমান মিল রেট</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight break-words">
                            ৳{englishToBangla(mealRate.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center bg-emerald-50 text-emerald-600 px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border border-emerald-100/50 truncate">
                            বর্তমান খরচ
                        </span>
                    </div>
                </div>

                {/* Card 2: Baki */}
                <div className="group bg-white hover:bg-slate-50/50 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-50 rounded-full blur-3xl group-hover:bg-rose-100/60 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100/50">
                                <AlertTriangle size={14} />
                            </div>
                            <h3 className="text-slate-500 font-bold text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider truncate">দোকানে বকেয়া</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight break-words">
                            ৳{englishToBangla(totalBakiExpense.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center bg-rose-50 text-rose-600 px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border border-rose-100/50 truncate">
                            দোকানে দিতে হবে
                        </span>
                    </div>
                </div>

                {/* Card 3: Total Mess Cost */}
                <div className="group bg-white hover:bg-slate-50/50 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100/60 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100/50">
                                <ShoppingBag size={14} />
                            </div>
                            <h3 className="text-slate-500 font-bold text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider truncate">মোট মেস খরচ</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight break-words">
                            ৳{englishToBangla((totalMessFoodCost + totalBakiExpense).toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center bg-blue-50 text-blue-600 px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border border-blue-100/50 truncate">
                            বাজার + বকেয়া
                        </span>
                    </div>
                </div>

                {/* Card 4: Additional Expenses */}
                <div className="group bg-white hover:bg-slate-50/50 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-50 rounded-full blur-3xl group-hover:bg-amber-100/60 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100/50">
                                <Receipt size={14} />
                            </div>
                            <h3 className="text-slate-500 font-bold text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider truncate">অতিরিক্ত খরচ</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight break-words">
                            ৳{englishToBangla(totalAdditionalExpense.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center bg-amber-50 text-amber-600 px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border border-amber-100/50 truncate">
                            সবার মাঝে ভাগ
                        </span>
                    </div>
                </div>

                {/* Card 5: Total Deposit & Cash */}
                <div className="col-span-2 lg:col-span-3 xl:col-span-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] hover:to-[#0F172A] p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_8px_30px_rgba(15,23,42,0.2)] flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-500 group">
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-500"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/5">
                                <Wallet size={14} />
                            </div>
                            <h3 className="text-slate-300 font-bold text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wider truncate">ফান্ডে মোট জমা</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black text-white tracking-tight break-words">
                            ৳{englishToBangla(totalDeposit.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center bg-white/10 backdrop-blur-sm text-slate-200 px-2.5 py-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border border-white/10 max-w-full">
                            হাতে: <span className="text-emerald-400 ml-1 break-words">৳{englishToBangla(managerCashInHand.toFixed(2))}</span>
                        </span>
                    </div>
                </div>

            </div>

            {/* Member List Section */}
            <div>
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900">মেম্বারদের তালিকা</h3>
                </div>

                {/* Table Header Row — hidden on mobile */}
                <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 sm:px-6 mb-3 text-[11px] sm:text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    <div>মেম্বার</div>
                    <div className="text-center">মোট মিল</div>
                    <div className="text-center">মোট জমা</div>
                    <div className="text-right">ব্যালেন্স</div>
                </div>

                {/* Member Rows */}
                <div className="space-y-2 sm:space-y-3">
                    {memberStats.map(stat => (
                        <div
                            key={stat.id}
                            className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr] items-start sm:items-center bg-white p-4 sm:p-5 rounded-xl sm:rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-colors gap-2 sm:gap-0"
                        >
                            {/* Member Info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                    <UserIcon size={16} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm sm:text-[17px] truncate">{stat.name}</span>
                                {/* Mobile-only balance */}
                                <span className={`sm:hidden ml-auto font-black text-base ${stat.balance >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                                </span>
                            </div>

                            {/* Mobile: stats row */}
                            <div className="flex sm:hidden items-center gap-4 text-xs text-slate-500 font-medium ml-11">
                                <span className="flex items-center gap-1"><Utensils size={12} className="text-slate-300" />{englishToBangla(stat.totalMeals.toFixed(1))} মিল</span>
                                <span className="flex items-center gap-1"><Wallet size={12} className="text-slate-300" />জমা ৳{englishToBangla(stat.totalContribution.toLocaleString('en-IN'))}</span>
                            </div>

                            {/* Desktop: Total Meals  */}
                            <div className="hidden sm:block text-center">
                                <span className="text-lg font-black text-slate-800">{englishToBangla(stat.totalMeals.toFixed(1))}</span>
                                <span className="text-slate-400 font-medium text-sm ml-1">মিল</span>
                            </div>

                            {/* Desktop: Total Deposit */}
                            <div className="hidden sm:block text-center">
                                <span className="text-lg font-black text-slate-800">৳{englishToBangla(stat.totalContribution.toFixed(2))}</span>
                            </div>

                            {/* Desktop: Balance */}
                            <div className={`hidden sm:block text-right font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                            </div>
                        </div>
                    ))}

                    {memberStats.length === 0 && (
                        <div className="bg-white p-8 sm:p-10 rounded-xl sm:rounded-[20px] text-center text-slate-400 border border-slate-100 text-sm sm:text-base">
                            কোনো মেম্বার পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
