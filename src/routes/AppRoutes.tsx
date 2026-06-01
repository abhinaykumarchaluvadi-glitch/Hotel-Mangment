import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/Dashboard';
import { BrowseRooms } from '../pages/customer/BrowseRooms';
import { Bookings } from '../pages/customer/Bookings';
import { FoodOrder } from '../pages/customer/FoodOrder';
import { Payments } from '../pages/customer/Payments';
import { Profile } from '../pages/customer/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/Dashboard';
import { ManageRooms } from '../pages/admin/ManageRooms';
import { ManageBookings } from '../pages/admin/ManageBookings';
import { FoodMenu } from '../pages/admin/FoodMenu';
import { FoodOrders } from '../pages/admin/FoodOrders';
import { ManagePayments } from '../pages/admin/ManagePayments';
import { Reports } from '../pages/admin/Reports';

import { useAuth } from '../store/AuthContext';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected Customer Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><CustomerDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/rooms" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><BrowseRooms /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bookings" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><Bookings /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/food-order" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><FoodOrder /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Layout><Payments /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin']}>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/rooms" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><ManageRooms /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/bookings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><ManageBookings /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/food-menu" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><FoodMenu /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/food-orders" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><FoodOrders /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/payments" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><ManagePayments /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } 
      />

      {/* Fallback Redirection */}
      <Route 
        path="*" 
        element={
          user 
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> 
            : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
};
