import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import DocumentsPage from './pages/DocumentsPage';
import ChecklistPage from './pages/ChecklistPage';
import TasksPage from './pages/TasksPage';
import HRDashboard from './pages/HRDashboard';
import OnboardingNew from './pages/OnboardingNew';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import AdminAuditLogs from './pages/AdminAuditLogs';
import ManagerDashboard from './pages/ManagerDashboard';

// Root redirector based on authenticated role
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
  if (user.role === 'HR') return <Navigate to="/hr/dashboard" replace />;
  if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

// Temporary placeholder for features 5-14 to be populated in upcoming steps
function PlaceholderView({ title, description, role }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-3 border border-indigo-100">
          {role} Workspace
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        <div className="text-xs text-slate-400 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
          Ready for Feature Implementation
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Employee Routes */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'HR']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'HR']}>
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/documents"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'HR', 'MANAGER']}>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/checklist"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'HR', 'MANAGER']}>
                    <ChecklistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/tasks"
                element={
                  <ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN', 'HR', 'MANAGER']}>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected HR Routes */}
              <Route
                path="/hr/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                    <HRDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hr/onboarding/new"
                element={
                  <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                    <OnboardingNew />
                  </ProtectedRoute>
                }
              />

              {/* Protected Manager Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDepartments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
