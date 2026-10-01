import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to request reset token.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your registered work email to receive password reset instructions
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

          {result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-200">{result.message}</div>
              </div>

              {result.devResetToken && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/40 space-y-3">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Local Dev Mode Token</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result.devResetToken)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied!' : 'Copy Token'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded font-mono text-xs text-slate-300 break-all select-all border border-slate-800">
                    {result.devResetToken}
                  </div>
                  <Link
                    to={`/reset-password?token=${result.devResetToken}`}
                    className="w-full flex justify-center items-center py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow transition-colors"
                  >
                    <span>Click here to Reset Password Now</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
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
                    placeholder="e.g. employee@portal.test"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Generating...' : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
