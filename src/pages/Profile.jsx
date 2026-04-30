import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { englishToBangla, banglaToEnglish } from '../utils/helpers';
import { User, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
    const { user, userProfile, isAdmin } = useAuth();
    const { members, memberStats, mealCategories, setMealValue, setBulkMeals, meals, selectedMonth } = useData();

    const [member, setMember] = useState(null);
    const [stats, setStats] = useState(null);
    
    // Vacation mode state
    const [vacationStart, setVacationStart] = useState('');
    const [vacationEnd, setVacationEnd] = useState('');
    const [vacationCats, setVacationCats] = useState([]);
    const [vacationAction, setVacationAction] = useState('0'); // '0' for OFF, '1' for ON
    const [isSubmittingVacation, setIsSubmittingVacation] = useState(false);

    useEffect(() => {
        if (userProfile && members.length > 0) {
            const foundMember = members.find(m => m.linkedEmail === userProfile.email);
            setMember(foundMember);
            if (foundMember) {
                const foundStats = memberStats.find(s => s.id === foundMember.id);
                setStats(foundStats);
            }
        }
    }, [userProfile, members, memberStats]);

    useEffect(() => {
        if (mealCategories.length > 0 && vacationCats.length === 0) {
            setVacationCats(mealCategories.map(c => c.id));
        }
    }, [mealCategories]);

    const isCategoryLocked = (cat, dateStr) => {
        if (isAdmin) return false;
        
        const today = new Date().toISOString().split('T')[0];
        if (dateStr < today) return true; // Past dates are locked
        if (dateStr > today) return false; // Future dates are open

        // Today: check time
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const lockTime = cat.lockTime || "09:00";
        
        return currentTime >= lockTime;
    };

    const handleToggleSingleMeal = async (dateStr, catId, turnOn) => {
        if (!member) return;
        const cat = mealCategories.find(c => c.id === catId);
        if (!cat || isCategoryLocked(cat, dateStr)) return;

        const val = turnOn ? "1" : "0";
        await setMealValue(dateStr, member.id, cat.id, val, selectedMonth);
    };

    const getMealCategoryValue = (dateStr, catId) => {
        if (!member || !meals[dateStr] || !meals[dateStr][member.id]) return 1;
        const val = meals[dateStr][member.id][catId];
        return val === undefined ? 1 : Number(val);
    };

    const getDayMealsStatus = (dateStr) => {
        if (!member || !meals[dateStr] || !meals[dateStr][member.id]) return false;
        const dayData = meals[dateStr][member.id];
        
        // Return true if ANY meal is > 0
        let isAnyOn = false;
        mealCategories.forEach(cat => {
            if (Number(dayData[cat.id] || 0) > 0) isAnyOn = true;
        });
        return isAnyOn;
    };

    const handleVacationSubmit = async () => {
        if (!vacationStart || !vacationEnd) {
            alert("দয়া করে শুরুর ও শেষের তারিখ নির্বাচন করুন!");
            return;
        }
        if (vacationStart > vacationEnd) {
            alert("শুরুর তারিখ শেষের তারিখের আগে হতে হবে!");
            return;
        }
        if (vacationCats.length === 0) {
            alert("কমপক্ষে একটি মিল নির্বাচন করুন!");
            return;
        }

        setIsSubmittingVacation(true);
        try {
            const start = new Date(vacationStart);
            const end = new Date(vacationEnd);
            const updates = [];

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                vacationCats.forEach(catId => {
                    const cat = mealCategories.find(c => c.id === catId);
                    if (cat && !isCategoryLocked(cat, dateStr)) {
                        updates.push({ date: dateStr, type: cat.id });
                    }
                });
            }

            if (updates.length > 0) {
                const actionText = vacationAction === '0' ? 'বন্ধ' : 'চালু';
                const confirmed = window.confirm(`আপনি কি ${updates.length} টি মিল ${actionText} করতে চান?`);
                if (confirmed) {
                    await setBulkMeals(updates, member.id, vacationAction, selectedMonth);
                    alert(`সফলভাবে মিল ${actionText} করা হয়েছে!`);
                    setVacationStart('');
                    setVacationEnd('');
                }
            } else {
                alert("নির্বাচিত তারিখ বা সময়ের জন্য কোনো মিল বন্ধ করার সুযোগ নেই (হয়তো সময় শেষ)।");
            }
        } catch (error) {
            console.error("Error bulk updating meals:", error);
            alert("মিল বন্ধ করতে সমস্যা হয়েছে।");
        } finally {
            setIsSubmittingVacation(false);
        }
    };

    const handleMakeSuperAdmin = async () => {
        try {
            await updateDoc(doc(db, 'global_users', user.uid), {
                globalRole: 'super_admin'
            });
            alert('সুপার অ্যাডমিন করা হয়েছে! দয়া করে পেজটি রিলোড করুন।');
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    };

    if (!member || !stats) {
        return (
            <div className="p-8 text-center text-gray-500 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                আপনার ইমেইলের সাথে কোনো মেম্বার যুক্ত নেই। দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।
            </div>
        );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const isTodayOn = getDayMealsStatus(todayStr);
    const isTomorrowOn = getDayMealsStatus(tomorrowStr);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="p-6 sm:p-8 rounded-3xl border flex items-center space-x-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 shadow-xl shadow-emerald-500/10">
                    <User size={40} />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{member.name}</h2>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{userProfile.email}</p>
                </div>
            </div>

            {/* Quick Actions (Meal Toggle) */}
            <div className="p-6 sm:p-8 rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>কুইক মিল কন্ট্রোল</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Today's Meal */}
                    <div className="p-5 rounded-2xl border flex flex-col" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                        <div className="mb-4">
                            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>আজকের মিল</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{todayStr}</p>
                        </div>
                        <div className="space-y-3">
                            {mealCategories.map(cat => {
                                const isLocked = isCategoryLocked(cat, todayStr);
                                const val = getMealCategoryValue(todayStr, cat.id);
                                const isOn = val > 0;
                                return (
                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                                            {isLocked && <span className="text-[10px] text-rose-500 font-bold flex items-center mt-1"><Clock size={10} className="mr-1"/> সময় শেষ</span>}
                                        </div>
                                        <div className="flex p-1 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                            <button
                                                onClick={() => handleToggleSingleMeal(todayStr, cat.id, true)}
                                                disabled={isLocked}
                                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isOn ? 'bg-emerald-500 text-white shadow-sm' : 'hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                চালু
                                            </button>
                                            <button
                                                onClick={() => handleToggleSingleMeal(todayStr, cat.id, false)}
                                                disabled={isLocked}
                                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!isOn ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-500/10 hover:text-rose-500 text-slate-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                বন্ধ
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tomorrow's Meal */}
                    <div className="p-5 rounded-2xl border flex flex-col" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)' }}>
                        <div className="mb-4">
                            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>আগামীকালের মিল</h4>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{tomorrowStr}</p>
                        </div>
                        <div className="space-y-3">
                            {mealCategories.map(cat => {
                                const isLocked = isCategoryLocked(cat, tomorrowStr);
                                const val = getMealCategoryValue(tomorrowStr, cat.id);
                                const isOn = val > 0;
                                return (
                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl border transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                                            {isLocked && <span className="text-[10px] text-rose-500 font-bold flex items-center mt-1"><Clock size={10} className="mr-1"/> সময় শেষ</span>}
                                        </div>
                                        <div className="flex p-1 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)' }}>
                                            <button
                                                onClick={() => handleToggleSingleMeal(tomorrowStr, cat.id, true)}
                                                disabled={isLocked}
                                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isOn ? 'bg-indigo-500 text-white shadow-sm' : 'hover:bg-indigo-500/10 hover:text-indigo-500 text-slate-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                চালু
                                            </button>
                                            <button
                                                onClick={() => handleToggleSingleMeal(tomorrowStr, cat.id, false)}
                                                disabled={isLocked}
                                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!isOn ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-500/10 hover:text-rose-500 text-slate-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                বন্ধ
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Mode (Bulk On/Off) */}
            <div className="p-6 sm:p-8 rounded-3xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>একাধিক দিন মিল চালু বা বন্ধ রাখুন</h3>
                <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>আপনি চাইলে নির্দিষ্ট তারিখ থেকে নির্দিষ্ট তারিখ পর্যন্ত একাধিক মিল একত্রে চালু বা বন্ধ করতে পারবেন।</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>শুরুর তারিখ</label>
                        <input 
                            type="date" 
                            value={vacationStart}
                            min={todayStr}
                            onChange={(e) => setVacationStart(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>শেষের তারিখ</label>
                        <input 
                            type="date" 
                            value={vacationEnd}
                            min={vacationStart || todayStr}
                            onChange={(e) => setVacationEnd(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>কী করতে চান?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="vacationAction" 
                                value="0" 
                                checked={vacationAction === '0'} 
                                onChange={(e) => setVacationAction(e.target.value)} 
                                className="w-4 h-4 text-rose-500 focus:ring-rose-500"
                            />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>মিল বন্ধ করতে চাই</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="radio" 
                                name="vacationAction" 
                                value="1" 
                                checked={vacationAction === '1'} 
                                onChange={(e) => setVacationAction(e.target.value)} 
                                className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>মিল চালু করতে চাই</span>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>যে মিলগুলোর জন্য প্রযোজ্য:</label>
                    <div className="flex flex-wrap gap-3">
                        {mealCategories.map(cat => (
                            <label key={cat.id} className="flex items-center space-x-2 cursor-pointer p-2 pr-4 rounded-lg border transition-colors hover:bg-black/5" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}>
                                <input 
                                    type="checkbox" 
                                    checked={vacationCats.includes(cat.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setVacationCats([...vacationCats, cat.id]);
                                        } else {
                                            setVacationCats(vacationCats.filter(id => id !== cat.id));
                                        }
                                    }}
                                    className={`w-4 h-4 rounded cursor-pointer ${vacationAction === '0' ? 'text-rose-500 focus:ring-rose-500' : 'text-emerald-500 focus:ring-emerald-500'}`}
                                />
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleVacationSubmit}
                    disabled={isSubmittingVacation}
                    className={`px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto ${vacationAction === '0' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}
                >
                    {isSubmittingVacation ? 'অপেক্ষা করুন...' : (vacationAction === '0' ? 'মিল বন্ধ করুন' : 'মিল চালু করুন')}
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>বর্তমান ব্যালেন্স</p>
                    <h3 className={`text-2xl font-black ${stats.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        ৳{englishToBangla(Math.abs(Math.round(stats.balance)))}
                        <span className="text-sm ml-1">{stats.balance < 0 ? 'বকেয়া' : 'পাওনা'}</span>
                    </h3>
                </div>
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>মোট জমা</p>
                    <h3 className="text-2xl font-black text-indigo-500">
                        ৳{englishToBangla(Math.round(stats.totalContribution))}
                    </h3>
                </div>
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>মোট মিল</p>
                    <h3 className="text-2xl font-black text-amber-500">
                        {englishToBangla(stats.totalMeals)} <span className="text-sm">টি</span>
                    </h3>
                </div>
                <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>মিল ও অন্যান্য খরচ</p>
                    <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        ৳{englishToBangla(Math.round(stats.foodCost + stats.utilityCost + stats.houseRent))}
                    </h3>
                </div>
            </div>

            {/* Temporary Super Admin Button for testing */}
            <div className="flex justify-center mt-8">
                <button 
                    onClick={handleMakeSuperAdmin}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-full shadow-lg"
                >
                    <ShieldAlert size={16} />
                    <span>Make Me Super Admin (Testing)</span>
                </button>
            </div>
        </div>
    );
}
