import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { DialogProvider } from './contexts/DialogContext';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Meals from './pages/Meals';
import Expenses from './pages/Expenses';
import Deposits from './pages/Deposits';
import Summary from './pages/Summary';
import Bazaar from './pages/Bazaar';
import Settings from './pages/Settings';

import ScrollToTop from './components/ScrollToTop';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-[#1A3A2A] rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-medium">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <DialogProvider>
      <DataProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="meals" element={<Meals />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="summary" element={<Summary />} />
            <Route path="bazaar" element={<Bazaar />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
    </DialogProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
}