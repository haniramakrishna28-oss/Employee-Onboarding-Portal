import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Building, 
  ArrowRight,
  ShieldCheck,
  ListTodo
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [directReports, setDirectReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDirectReports();
  }, []);

  const fetchDirectReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manager/direct-reports');
      if (res.success) setDirectReports(res.directReports);
    } catch (err) {
      console.error('Failed to load direct reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCount = directReports.filter(r => r.onboardingStatus !== 'COMPLETED').length;
  const completedCount = directReports.filter(r => r.onboardingStatus === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-200 mb-3 border border-white/10">
            Reporting Manager Dashboard
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Team Readiness & Direct Reports
          </h1>
          <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
            Welcome back, {user?.employee?.firstName} {user?.employee?.lastName}. Track onboarding progression, approve milestone gates, and assign ramp-up tasks for your direct team members.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Direct Reports</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{directReports.length}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Onboardings</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{inProgressCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fully Onboarded</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Direct Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Direct Reports Onboarding Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned team members undergoing the onboarding curriculum</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {directReports.length} Team Members
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading direct reports...</div>
          ) : directReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No direct reports currently assigned to your team.</div>
          ) : (
            directReports.map((report) => {
              const activeOnboarding = report.onboardings?.[0];
              const progress = report.progressPercentage || 25;

              return (
                <div key={report.id} className="p-6 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* Employee Info */}
                  <div className="flex items-center space-x-4 min-w-[280px]">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base shadow-sm">
                      {report.firstName[0]}{report.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {report.firstName} {report.lastName}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-indigo-600">{report.designation || 'Engineer'}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{report.employeeCode}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>Joined: {new Date(report.joiningDate || report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Stage */}
                  <div className="w-full md:w-64 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Completion</span>
                      <span className="font-bold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Stage: <span className="font-semibold text-slate-600">{activeOnboarding?.currentStage || 'DOCUMENT_UPLOAD'}</span>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      report.onboardingStatus === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {report.onboardingStatus}
                    </span>

                    <button
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
