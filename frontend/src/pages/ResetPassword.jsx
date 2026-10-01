import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Please provide a valid reset token.');
      return;
    }

    if (!hasLength || !hasUpper || !hasNumber) {
      setError('Please meet all password security rules.');
      return;
    }

    if (!isMatch) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword
      });
      if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your new security credentials below
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

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Password Updated!</h3>
              <p className="text-sm text-slate-300">
                Your password has been changed successfully. You can now log into your account.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm transition-all"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste 64-char reset token here"
                  className="block w-full px-3.5 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3.5 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/60 space-y-1.5 text-xs text-slate-400">
                <div className={`flex items-center space-x-2 ${hasLength ? 'text-emerald-400' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center space-x-2 ${hasUpper ? 'text-emerald-400' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center space-x-2 ${hasNumber ? 'text-emerald-400' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>At least one number (0-9)</span>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center space-x-2 ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span>{isMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Resetting...' : (
                    <>
                      <span>Set New Password</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-medium text-slate-400 hover:text-white">
                  Cancel and return to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
