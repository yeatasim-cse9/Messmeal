import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, englishToBangla } from '../utils/helpers';
import { TrendingUp, AlertTriangle, ShoppingBag, Utensils, Wallet, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
    const { userProfile } = useAuth();
    const {
        members, totalMeals, mealRate, totalMessFoodCost, totalBakiExpense, totalDeposit, managerCashInHand, memberStats
    } = useData();

    return (
        <div className="space-y-10">
            {/* Stat Cards - Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card 1: Mill Rate */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[15px]">বর্তমান মিল রেট</h3>
                    <p className="text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla(mealRate.toFixed(2))}
                    </p>
                    <div className="flex items-center text-emerald-500 font-bold text-[14px]">
                        <TrendingUp size={16} className="mr-1.5" /> প্রতি মিল
                    </div>
                </div>

                {/* Card 2: Baki */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[15px]">দোকানে বকেয়া</h3>
                    <p className="text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla(totalBakiExpense.toLocaleString('en-IN'))}
                    </p>
                    <div className="flex items-center text-rose-500 font-bold text-[14px]">
                        <AlertTriangle size={16} className="mr-1.5" fill="currentColor" /> দিতে হবে
                    </div>
                </div>

                {/* Card 3: Total Mess Cost */}
                <div className="bg-white p-8 rounded-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between h-[180px]">
                    <h3 className="text-slate-400 font-medium text-[15px]">মোট মেস খরচ</h3>
                    <p className="text-[42px] font-black text-slate-900 leading-none tracking-tight">
                        {englishToBangla((totalMessFoodCost + totalBakiExpense).toLocaleString('en-IN'))}
                    </p>
                    <div className="flex items-center text-slate-400 font-medium text-[14px]">
                        <ShoppingBag size={16} className="mr-1.5" /> বাজার + বকেয়া
                    </div>
                </div>

                {/* Card 4: Total Deposit & Cash */}
                <div className="bg-[#1A3A2A] p-8 rounded-[24px] shadow-xl shadow-[#1A3A2A]/20 flex flex-col justify-between h-[180px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <h3 className="text-[#A2C2B2] font-medium text-[15px] mb-2">ফান্ডে মোট জমা</h3>
                        <p className="text-[42px] font-black leading-none tracking-tight">
                            {englishToBangla(totalDeposit.toLocaleString('en-IN'))}
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center text-[#A2C2B2] font-medium text-[14px]">
                        হাতে ক্যাশ <span className="text-white font-bold ml-2">{englishToBangla(managerCashInHand.toLocaleString('en-IN'))}</span>
                    </div>
                </div>

            </div>

            {/* Member List Section */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-2xl font-black text-slate-900">মেম্বারদের তালিকা</h3>
                    <button className="text-slate-400 font-medium text-[15px] hover:text-slate-900 transition-colors">সব দেখুন</button>
                </div>

                {/* Table Header Row */}
                <div className="grid grid-cols-4 px-6 mb-3 text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                    <div>মেম্বার</div>
                    <div className="text-center">মিল সংখ্যা</div>
                    <div className="text-center">জমা</div>
                    <div className="text-right">ব্যালেন্স</div>
                </div>

                {/* Member Rows */}
                <div className="space-y-3">
                    {memberStats.map(stat => (
                        <div key={stat.id} className="grid grid-cols-4 items-center bg-white p-5 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-colors">
                            {/* Member Info */}
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                    <UserIcon size={20} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-slate-900 text-[17px]">{stat.name}</span>
                            </div>

                            {/* Total Meals */}
                            <div className="flex items-center justify-center space-x-2 text-slate-500 font-medium">
                                <Utensils size={16} className="text-slate-300" />
                                <span>{englishToBangla(stat.totalMeals.toFixed(1))} টি মিল</span>
                            </div>

                            {/* Contributions */}
                            <div className="flex items-center justify-center space-x-2 text-slate-500 font-medium">
                                <Wallet size={16} className="text-slate-300" />
                                <span>৳ {englishToBangla(stat.totalContribution.toLocaleString('en-IN'))}</span>
                            </div>

                            {/* Balance */}
                            <div className={`text-right font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-slate-900' : 'text-rose-500'}`}>
                                {stat.balance >= 0 ? '+ ' : '- '}{englishToBangla(Math.abs(stat.balance).toLocaleString('en-IN'))}
                            </div>
                        </div>
                    ))}

                    {memberStats.length === 0 && (
                        <div className="bg-white p-10 rounded-[20px] text-center text-slate-400 border border-slate-100">
                            কোনো মেম্বার পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
