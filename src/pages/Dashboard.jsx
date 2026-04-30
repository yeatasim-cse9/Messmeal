import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, englishToBangla } from '../utils/helpers';
import { TrendingUp, AlertTriangle, ShoppingBag, Utensils, Wallet, User as UserIcon, Receipt } from 'lucide-react';

export default function Dashboard() {
    const { userProfile } = useAuth();
    const {
        members, totalMeals, mealRate, totalMessFoodCost, totalBakiExpense, totalBakiPaid, totalDeposit, managerCashInHand, totalAdditionalExpense, memberStats
    } = useData();

    const cardBase = "group p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] border flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-300";
    const cardStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' };

    return (
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Stat Cards - Top Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">

                {/* Card 1: Mill Rate */}
                <div className={cardBase} style={cardStyle}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                                <TrendingUp size={14} />
                            </div>
                            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>বর্তমান মিল রেট</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            ৳{englishToBangla(mealRate.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border truncate" style={{ backgroundColor: 'var(--emerald-dim)', color: 'var(--emerald)', borderColor: 'var(--emerald)' }}>
                            বর্তমান খরচ
                        </span>
                    </div>
                </div>

                {/* Card 2: Baki */}
                <div className={cardBase} style={cardStyle}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                                <AlertTriangle size={14} />
                            </div>
                            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>দোকানে বকেয়া</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            ৳{englishToBangla(totalBakiExpense.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        {totalBakiPaid > 0 ? (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border truncate" style={{ backgroundColor: 'var(--emerald-dim)', color: 'var(--emerald)', borderColor: 'var(--emerald)' }}>
                                পরিশোধ: ৳{englishToBangla(totalBakiPaid.toFixed(0))} • বাকি: ৳{englishToBangla((totalBakiExpense - totalBakiPaid).toFixed(0))}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border truncate" style={{ backgroundColor: 'var(--rose-dim)', color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                                দোকানে দিতে হবে
                            </span>
                        )}
                    </div>
                </div>

                {/* Card 3: Total Mess Cost */}
                <div className={cardBase} style={cardStyle}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                                <ShoppingBag size={14} />
                            </div>
                            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>মোট মেস খরচ</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            ৳{englishToBangla((totalMessFoodCost + totalBakiExpense).toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border truncate" style={{ backgroundColor: 'var(--blue-dim)', color: 'var(--blue)', borderColor: 'var(--blue)' }}>
                            বাজার + বকেয়া
                        </span>
                    </div>
                </div>

                {/* Card 4: Additional Expenses */}
                <div className={cardBase} style={cardStyle}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                                <Receipt size={14} />
                            </div>
                            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>অতিরিক্ত খরচ</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            ৳{englishToBangla(totalAdditionalExpense.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-[11px] border truncate" style={{ backgroundColor: 'var(--amber-dim)', color: 'var(--amber)', borderColor: 'var(--amber)' }}>
                            সবার মাঝে ভাগ
                        </span>
                    </div>
                </div>

                {/* Card 5: Fund Balance */}
                <div className="col-span-2 lg:col-span-3 xl:col-span-1 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[24px] border flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all duration-500 group" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--emerald)' }}>
                    <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl group-hover:opacity-80 transition-opacity duration-500 opacity-20" style={{ backgroundColor: 'var(--emerald)' }}></div>
                    <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: 'var(--emerald)' }}></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--emerald-dim)', color: 'var(--emerald)' }}>
                                <Wallet size={14} />
                            </div>
                            <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>ফান্ডের বর্তমান ব্যালেন্স</h3>
                        </div>
                        <p className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight break-words" style={{ color: 'var(--text-primary)' }}>
                            ৳{englishToBangla(managerCashInHand.toFixed(2))}
                        </p>
                    </div>
                    <div className="relative z-10 mt-3 sm:mt-4">
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg font-bold text-[10px] sm:text-[11px] border max-w-full" style={{ backgroundColor: 'var(--emerald-dim)', color: 'var(--emerald)', borderColor: 'var(--emerald)' }}>
                            মোট জমা: <span className="ml-1 break-words font-black">৳{englishToBangla(totalDeposit.toFixed(2))}</span>
                        </span>
                    </div>
                </div>

            </div>

            {/* Member List Section */}
            <div>
                <div className="flex justify-between items-end mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>মেম্বারদের তালিকা</h3>
                </div>

                {/* Table Header Row — hidden on mobile */}
                <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr] px-4 sm:px-6 mb-3 text-[11px] sm:text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
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
                            className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1fr_1fr_1fr] items-start sm:items-center p-4 sm:p-5 rounded-xl sm:rounded-[20px] border transition-colors gap-2 sm:gap-0"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            {/* Member Info */}
                            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                                    <UserIcon size={16} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <span className="font-bold text-sm sm:text-[17px] truncate" style={{ color: 'var(--text-primary)' }}>{stat.name}</span>
                                {/* Mobile-only balance */}
                                <span className={`sm:hidden ml-auto font-black text-base ${stat.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {stat.balance >= 0 ? '+' : '-'}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                                </span>
                            </div>

                            {/* Mobile: stats row */}
                            <div className="flex sm:hidden items-center gap-4 text-xs font-medium ml-11" style={{ color: 'var(--text-muted)' }}>
                                <span className="flex items-center gap-1"><Utensils size={12} style={{ color: 'var(--text-dim)' }} />{englishToBangla(stat.totalMeals.toFixed(1))} মিল</span>
                                <span className="flex items-center gap-1"><Wallet size={12} style={{ color: 'var(--text-dim)' }} />জমা ৳{englishToBangla(stat.totalContribution.toLocaleString('en-IN'))}</span>
                            </div>

                            {/* Desktop: Total Meals  */}
                            <div className="hidden sm:block text-center">
                                <span className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{englishToBangla(stat.totalMeals.toFixed(1))}</span>
                                <span className="font-medium text-sm ml-1" style={{ color: 'var(--text-muted)' }}>মিল</span>
                            </div>

                            {/* Desktop: Total Deposit */}
                            <div className="hidden sm:block text-center">
                                <span className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>৳{englishToBangla(stat.totalContribution.toFixed(2))}</span>
                            </div>

                            {/* Desktop: Balance */}
                            <div className={`hidden sm:block text-right font-black text-xl tracking-tight ${stat.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {stat.balance >= 0 ? '+ ' : '- '}৳{englishToBangla(Math.abs(stat.balance).toFixed(2))}
                            </div>
                        </div>
                    ))}

                    {memberStats.length === 0 && (
                        <div className="p-8 sm:p-10 rounded-xl sm:rounded-[20px] text-center border text-sm sm:text-base" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                            কোনো মেম্বার পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
