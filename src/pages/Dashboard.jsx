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
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">

                {/* Card 1: Mill Rate */}
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[11px] sm:text-[13px] lg:text-[15px]">বর্তমান মিল রেট</h3>
                    <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla(mealRate.toFixed(2))}
                    </p>
                    <div className="flex items-center text-emerald-500 font-bold text-[11px] sm:text-[13px] lg:text-[14px]">
                        <TrendingUp size={14} className="mr-1 shrink-0" /> প্রতি মিল
                    </div>
                </div>

                {/* Card 2: Baki */}
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[11px] sm:text-[13px] lg:text-[15px]">দোকানে বকেয়া</h3>
                    <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla(totalBakiExpense.toLocaleString('en-IN'))}
                    </p>
                    <div className="flex items-center text-rose-500 font-bold text-[11px] sm:text-[13px] lg:text-[14px]">
                        <AlertTriangle size={14} className="mr-1 shrink-0" fill="currentColor" /> দিতে হবে
                    </div>
                </div>

                {/* Card 3: Total Mess Cost */}
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[11px] sm:text-[13px] lg:text-[15px]">মোট মেস খরচ</h3>
                    <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla((totalMessFoodCost + totalBakiExpense).toLocaleString('en-IN'))}
                    </p>
                    <div className="flex items-center text-slate-400 font-medium text-[11px] sm:text-[13px] lg:text-[14px]">
                        <ShoppingBag size={14} className="mr-1 shrink-0" /> বাজার + বকেয়া
                    </div>
                </div>

                {/* Card 4: Additional Expenses */}
                <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-amber-100 flex flex-col justify-between min-h-[120px] sm:min-h-[150px] lg:min-h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[11px] sm:text-[13px] lg:text-[15px]">অতিরিক্ত খরচ</h3>
                    <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-black text-amber-600 leading-none tracking-tight">
                        {englishToBangla(totalAdditionalExpense.toLocaleString('en-IN'))}
                    </p>
                    <div className="flex items-center text-amber-500 font-bold text-[11px] sm:text-[13px] lg:text-[14px]">
                        <Receipt size={14} className="mr-1 shrink-0" /> মোট অতিরিক্ত
                    </div>
                </div>

                {/* Card 4: Total Deposit & Cash */}
                <div className="bg-[#1A3A2A] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] shadow-xl shadow-[#1A3A2A]/20 flex flex-col justify-between min-h-[120px] sm:min-h-[150px] lg:min-h-[180px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <h3 className="text-[#A2C2B2] font-medium text-[11px] sm:text-[13px] lg:text-[15px] mb-1 sm:mb-2">ফান্ডে মোট জমা</h3>
                        <p className="text-[24px] sm:text-[32px] lg:text-[42px] font-black leading-none tracking-tight">
                            {englishToBangla(totalDeposit.toLocaleString('en-IN'))}
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center text-[#A2C2B2] font-medium text-[11px] sm:text-[13px] lg:text-[14px]">
                        হাতে <span className="text-white font-bold ml-1 sm:ml-2">{englishToBangla(managerCashInHand.toLocaleString('en-IN'))}</span>
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
                        <div key={stat.id} className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr] items-start sm:items-center bg-white p-4 sm:p-5 rounded-xl sm:rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-colors gap-2 sm:gap-0">
                            {/* Member Info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                    <UserIcon size={16} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-slate-900 text-sm sm:text-[17px] truncate">{stat.name}</span>
                                {/* Mobile-only balance */}
                                <span className={`sm:hidden ml-auto font-black text-base ${stat.balance >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toLocaleString('en-IN'))}
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
                                <span className="text-lg font-black text-slate-800">৳{englishToBangla(stat.totalContribution.toLocaleString('en-IN'))}</span>
                            </div>

                            {/* Desktop: Balance */}
                            <div className={`hidden sm:block text-right font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toLocaleString('en-IN'))}
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
