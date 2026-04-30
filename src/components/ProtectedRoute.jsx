import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin, requireSuperAdmin }) {
    const { user, loading, isAdmin, isSuperAdmin } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    if (requireAdmin && !isAdmin && !isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}
