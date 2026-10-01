import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Lock, Mail, ArrowRight, Shield, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // Route dynamically to appropriate role dashboard
      if (user.role === 'ADMIN') navigate('/admin/users');
      else if (user.role === 'HR') navigate('/hr/dashboard');
      else if (user.role === 'MANAGER') navigate('/manager/dashboard');
      else navigate('/employee/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Welcome to OnboardFlow
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to access your employee onboarding dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-rose-200">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Authenticating...' : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Demo Accounts</span>
              </span>
              <span className="text-[11px] text-slate-500">Pass: Password123!</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@portal.test')}
                className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">Admin</span>
                  <span className="text-[10px] text-purple-400/80">System Lead</span>
                </div>
                <span className="text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hr@portal.test')}
                className="p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/50 hover:text-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">HR Specialist</span>
                  <span className="text-[10px] text-blue-400/80">Operations</span>
                </div>
                <span className="text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@portal.test')}
                className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">Manager</span>
                  <span className="text-[10px] text-emerald-400/80">Eng Manager</span>
                </div>
                <span className="text-xs">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee@portal.test')}
                className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/50 hover:text-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">Employee</span>
                  <span className="text-[10px] text-amber-400/80">New Joiner</span>
                </div>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            New employee without an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
