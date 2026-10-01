import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UserCheck, 
  LogOut, 
  User, 
  FileText, 
  CheckSquare, 
  ListTodo, 
  CheckCircle, 
  LayoutDashboard, 
  Shield, 
  Users,
  Building2
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeStyles = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    HR: 'bg-blue-100 text-blue-800 border-blue-200',
    MANAGER: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    EMPLOYEE: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-slate-900 tracking-tight block">OnboardFlow</span>
                <span className="text-[11px] text-slate-500 block -mt-0.5">Enterprise Portal</span>
              </div>
            </Link>

            {/* Navigation links based on Role */}
            <nav className="hidden md:flex items-center space-x-1">
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/users"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/users') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users & RBAC</span>
                  </Link>
                  <Link
                    to="/admin/departments"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/departments') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Departments</span>
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/audit-logs') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Audit Logs</span>
                  </Link>
                </>
              )}

              {user.role === 'HR' && (
                <>
                  <Link
                    to="/hr/dashboard"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/hr/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/hr/onboarding/new"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/hr/onboarding/new') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>New Onboarding</span>
                  </Link>
                </>
              )}

              {user.role === 'MANAGER' && (
                <>
                  <Link
                    to="/manager/dashboard"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/manager/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Direct Reports</span>
                  </Link>
                </>
              )}

              {user.role === 'EMPLOYEE' && (
                <>
                  <Link
                    to="/employee/dashboard"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/employee/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    to="/employee/profile"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/employee/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/employee/documents"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/employee/documents') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Documents</span>
                  </Link>
                  <Link
                    to="/employee/checklist"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/employee/checklist') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist</span>
                  </Link>
                  <Link
                    to="/employee/tasks"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/employee/tasks') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    <span>Tasks</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-right">
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">
                  {user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email}
                </div>
                <div className="text-xs text-slate-500">
                  {user.employee?.employeeCode || user.email}
                </div>
              </div>

              {/* Role Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyles[user.role] || 'bg-slate-100 text-slate-800'}`}>
                {user.role}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
