import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        {/* Premium luxury loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        </div>
        <h2 className="text-xl font-serif tracking-wider text-primary animate-pulse">GRAND ROYALE</h2>
        <p className="text-xs text-muted-foreground tracking-widest uppercase">Loading your retreat...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save location to come back to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if role is unauthorized
    return user.role === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
