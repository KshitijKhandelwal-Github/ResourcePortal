import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ResourceFormPage from './pages/ResourceFormPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="resources" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <ResourcesPage />
              </ProtectedRoute>
            } />
            <Route path="resources/new" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <ResourceFormPage />
              </ProtectedRoute>
            } />
            <Route path="resources/:employeeId" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <ResourceDetailPage />
              </ProtectedRoute>
            } />
            <Route path="resources/:employeeId/edit" element={
              <ProtectedRoute allowedRoles={['admin', 'senior_associate']}>
                <ResourceFormPage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'senior_associate']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
