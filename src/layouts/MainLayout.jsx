import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getBanglaMonthYear } from '../utils/helpers';
import {
    LayoutGrid, Calendar as CalendarIcon, ShoppingBag, Wallet,
    PieChart, Settings, Menu, X, LogOut, Utensils, Users as UsersIcon,
    Sun, Moon, User, ShieldCheck
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-200 mb-1 relative overflow-hidden group ${isActive
                ? 'font-bold bg-[var(--bg-elevated)] shadow-sm'
                : 'font-medium hover:bg-[var(--bg-elevated)]'
            }`
        }
        style={({ isActive }) => ({
            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
        })}
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full" />
                )}
                <div className="relative z-10 flex items-center w-full">
                    <Icon size={20} className="mr-3.5 transition-colors duration-200" style={{ color: isActive ? 'var(--brand)' : 'inherit' }} />
                    <span className="text-sm transition-colors duration-200" style={{ color: isActive ? 'var(--text-primary)' : 'inherit' }}>{label}</span>
                </div>
            </>
        )}
    </NavLink>
);

export default function MainLayout() {
    const { logout, isAdmin, isSuperAdmin, userProfile } = useAuth();
    const { selectedMonth, setSelectedMonth } = useData();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const location = useLocation();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

        const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'ওভারভিউ';
            case '/meals': return 'প্রতিদিনের মিল';
            case '/expenses': return 'বাজার ও খরচ';
            case '/deposits': return 'জমার হিসাব';
            case '/summary': return 'মাসিক হিসাব';
            case '/users': return 'ইউজার ম্যানেজমেন্ট';
            case '/settings': return 'অ্যাডমিন সেটিংস';
            case '/profile': return 'আমার প্রোফাইল';
            case '/super-admin': return 'সুপার অ্যাডমিন ড্যাশবোর্ড';
            default: return 'মেস হিসাব';
        }
    };

    return (
        <div className="min-h-screen flex font-sans" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Mobile Menu Button */}
            <div
                className="md:hidden fixed top-0 w-full p-4 flex justify-between items-center z-40 border-b"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Utensils size={18} />
                    </div>
                    <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>মেস হিসাব</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 inset-y-0 left-0 w-[260px] z-40 flex flex-col h-screen md:h-[100dvh] border-r transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
                {/* Logo Section */}
                <div className="flex flex-col space-y-1 px-6 py-8 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center space-x-3.5 mb-2">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/10">
                            <Utensils size={22} />
                        </div>
                        <h1 className="text-xl font-black tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {userProfile?.messName || 'মেস হিসাব'}
                        </h1>
                    </div>
                    {userProfile?.messName && (
                        <p className="text-xs font-medium text-emerald-500 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full ml-14">
                            Active Workspace
                        </p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    <NavItem to="/" icon={LayoutGrid} label="ড্যাশবোর্ড" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/profile" icon={User} label="আমার প্রোফাইল" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/meals" icon={CalendarIcon} label="প্রতিদিনের মিল" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/expenses" icon={ShoppingBag} label="বাজার ও খরচ" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/deposits" icon={Wallet} label="জমার হিসাব" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/summary" icon={PieChart} label="মাসিক হিসাব" onClick={() => setIsMobileMenuOpen(false)} />
                    {isAdmin && (
                        <>
                            <NavItem to="/users" icon={UsersIcon} label="ইউজার ম্যানেজমেন্ট" onClick={() => setIsMobileMenuOpen(false)} />
                            <NavItem to="/settings" icon={Settings} label="সেটিংস" onClick={() => setIsMobileMenuOpen(false)} />
                        </>
                    )}
                    {isSuperAdmin && (
                        <NavItem to="/super-admin" icon={ShieldCheck} label="সুপার অ্যাডমিন" onClick={() => setIsMobileMenuOpen(false)} />
                    )}
                </nav>

                {/* Footer (Logout) */}
                <div className="px-4 py-6">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm hover:bg-rose-500/10 hover:text-rose-500"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <LogOut size={18} />
                        <span>লগ আউট</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-20 sm:py-24 md:py-10 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 lg:mb-10 gap-4 sm:gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="relative flex items-center gap-2 group cursor-pointer w-max px-3 py-1.5 rounded-full border"
                                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                            >
                                <p className="font-bold text-[13px] md:text-[14px] transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                    {getBanglaMonthYear(selectedMonth)}
                                </p>
                                <CalendarIcon size={14} style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    onClick={(e) => {
                                        try {
                                            if (e.target.showPicker) {
                                                e.target.showPicker();
                                            }
                                        } catch (err) {
                                            console.warn("showPicker is not supported", err);
                                        }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    title="মাস পরিবর্তন করুন"
                                />
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="p-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
                                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                                title="থিম পরিবর্তন করুন"
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                        <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>
                </div>

                <div className="w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
