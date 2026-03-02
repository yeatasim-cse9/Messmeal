import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { getBanglaMonthYear } from '../utils/helpers';
import {
    LayoutGrid, Calendar as CalendarIcon, ShoppingBag, Wallet,
    PieChart, Settings, Menu, X, LogOut, Utensils
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 mb-2 relative overflow-hidden group ${isActive
                ? 'text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
        }
    >
        {({ isActive }) => (
            <>
                {isActive && (
                    <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 bg-[#F4F6F8] rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                )}
                {!isActive && (
                    <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-0" />
                )}
                <div className="relative z-10 flex items-center w-full">
                    <Icon size={22} className={`mr-4 transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-[15px]">{label}</span>
                </div>
            </>
        )}
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
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex justify-between items-center z-40 shadow-sm"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A3A2A] to-[#2C5E45] text-white flex items-center justify-center font-bold shadow-md">
                        <Utensils size={18} />
                    </div>
                    <span className="font-black text-slate-900 text-xl tracking-tight">মেস হিসাব</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors active:scale-95"
                >
                    <AnimatePresence mode="wait">
                        {isMobileMenuOpen ? (
                            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                                <X size={24} />
                            </motion.div>
                        ) : (
                            <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                                <Menu size={24} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.div>

            {/* Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`fixed md:sticky top-0 inset-y-0 left-0 w-[280px] bg-white/80 backdrop-blur-xl z-40 flex flex-col h-screen md:h-[100dvh] shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                initial={false}
                animate={{ x: isMobileMenuOpen || window.innerWidth >= 768 ? 0 : '-100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Logo Section */}
                <div className="flex items-center space-x-4 px-8 py-10">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.05 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1A3A2A] to-[#2C5E45] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-[#1A3A2A]/20"
                    >
                        <Utensils size={24} />
                    </motion.div>
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
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                    >
                        <LogOut size={20} />
                        <span>লগ আউট</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-4 md:px-8 lg:px-12 py-20 sm:py-24 md:py-12 overflow-x-hidden">

                {/* Header components (Date & Title & Actions) */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 lg:mb-10 gap-4 sm:gap-6"
                >
                    <div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="relative flex items-center gap-2 mb-2 group cursor-pointer w-max bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
                        >
                            <p className="text-slate-500 font-bold text-[13px] md:text-[14px] group-hover:text-slate-700 transition-colors">
                                {getBanglaMonthYear(selectedMonth)}
                            </p>
                            <CalendarIcon size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                title="মাস পরিবর্তন করুন"
                            />
                        </motion.div>
                        <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>
                </motion.div>


                {/* Page Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
