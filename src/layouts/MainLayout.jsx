import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getBanglaMonthYear } from '../utils/helpers';
import {
    LayoutGrid, Calendar as CalendarIcon, ShoppingBag, Wallet,
    PieChart, Settings, Menu, X, LogOut, Bell, Plus, Utensils
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `w-full flex items-center px-6 py-4 rounded-xl transition-all duration-200 mb-2 ${isActive
                ? 'bg-[#F4F6F8] text-slate-900 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
            }`
        }
    >
        <Icon size={22} className={`mr-4 ${({ isActive }) => isActive ? 'text-slate-900' : 'text-slate-400'}`} />
        <span className="text-[15px]">{label}</span>
    </NavLink>
);

export default function MainLayout() {
    const { logout, isAdmin } = useAuth();
    const { selectedMonth } = useData();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'ওভারভিউ';
            case '/meals': return 'প্রতিদিনের মিল';
            case '/expenses': return 'বাজার ও খরচ';
            case '/deposits': return 'জমার হিসাব';
            case '/summary': return 'মাসিক হিসাব';
            case '/settings': return 'অ্যাডমিন সেটিংস';
            default: return 'মেস হিসাব';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-[#1A3A2A] selection:text-white">
            {/* Mobile Menu Button  */}
            <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between items-center z-40 shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A3A2A] text-white flex items-center justify-center font-bold">
                        <Utensils size={18} />
                    </div>
                    <span className="font-black text-slate-900 text-xl">মেস হিসাব</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-700">
                    {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-30 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 inset-y-0 left-0 w-[280px] bg-white transform transition-transform duration-300 ease-out z-40 flex flex-col h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100/50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                {/* Logo Section */}
                <div className="flex items-center space-x-4 px-8 py-10">
                    <div className="w-11 h-11 rounded-full bg-[#1A3A2A] text-white flex items-center justify-center font-bold text-lg shadow-md">
                        <Utensils size={22} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">মেস হিসাব</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 overflow-y-auto">
                    <NavItem to="/" icon={LayoutGrid} label="ড্যাশবোর্ড" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/meals" icon={CalendarIcon} label="প্রতিদিনের মিল" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/expenses" icon={ShoppingBag} label="বাজার ও খরচ" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/deposits" icon={Wallet} label="জমার হিসাব" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/summary" icon={PieChart} label="মাসিক হিসাব" onClick={() => setIsMobileMenuOpen(false)} />
                    {isAdmin && <NavItem to="/settings" icon={Settings} label="সেটিংস" onClick={() => setIsMobileMenuOpen(false)} />}
                </nav>

                {/* Footer (Logout) */}
                <div className="px-6 py-8">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-bold transition-colors"
                    >
                        <LogOut size={20} />
                        <span>লগ আউট</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-24 md:px-12 md:py-12 overflow-x-hidden">

                {/* Header components (Date & Title & Actions) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <div className="relative flex items-center gap-2 mb-2 group cursor-pointer w-max">
                            <p className="text-slate-400 font-medium text-[15px] group-hover:text-slate-600 transition-colors">
                                {getBanglaMonthYear(selectedMonth)}
                            </p>
                            <CalendarIcon size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="মাস পরিবর্তন করুন"
                            />
                        </div>
                        <h2 className="text-[32px] md:text-[40px] font-black text-slate-900 tracking-tight leading-none">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>
                </div>


                {/* Page Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
