import React from 'react'; // refreshed
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
import Users from './pages/Users';
import Profile from './pages/Profile';
import Migration from './pages/Migration';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

import ScrollToTop from './components/ScrollToTop';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-900 border-t-emerald-400 rounded-full mb-4 animate-spin"></div>
          <p className="font-medium" style={{ color: 'var(--text-muted)' }}>লোড হচ্ছে...</p>
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
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="migration" element={
                <ProtectedRoute requireSuperAdmin>
                  <Migration />
                </ProtectedRoute>
              } />
              <Route path="super-admin" element={
                <ProtectedRoute requireSuperAdmin>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
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