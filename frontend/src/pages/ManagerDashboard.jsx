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
  ListTodo, 
  Search, 
  X,
  Check,
  AlertCircle,
  FileText,
  CheckSquare,
  Sparkles
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [directReports, setDirectReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [signingOff, setSigningOff] = useState(false);
  const [signOffFeedback, setSignOffFeedback] = useState(null);

  useEffect(() => {
    fetchDirectReports();
  }, []);

  const fetchDirectReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manager/direct-reports');
      if (res.success) setDirectReports(res.directReports || []);
    } catch (err) {
      console.error('Failed to load direct reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const openReportDetails = async (report) => {
    setSelectedReport(report);
    setSignOffFeedback(null);
    setReportDetails(null);

    const onboardingId = report.onboardings?.[0]?.id;
    if (onboardingId) {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/onboarding/${onboardingId}`);
        if (res.success) setReportDetails(res.onboarding);
      } catch (err) {
        console.error('Failed to load detailed onboarding for report:', err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleManagerSignOff = async () => {
    if (!reportDetails) return;
    setSigningOff(true);
    setSignOffFeedback(null);
    try {
      const res = await api.put(`/onboarding/${reportDetails.id}/stage`, {
        stage: 'HR_FINAL_APPROVAL',
        comments: `Manager Sign-Off approved by ${user?.employee?.firstName || 'Manager'}`
      });
      if (res.success) {
        setSignOffFeedback({ type: 'success', message: 'Manager milestone sign-off approved! Sent to HR for final sign-off.' });
        setReportDetails(res.onboarding);
        fetchDirectReports();
      }
    } catch (err) {
      setSignOffFeedback({ type: 'error', message: err.message || 'Failed to approve manager sign-off.' });
    } finally {
      setSigningOff(false);
    }
  };

  const filteredReports = directReports.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const code = (r.employeeCode || '').toLowerCase();
    const email = (r.user?.email || '').toLowerCase();
    const desig = (r.designation || '').toLowerCase();
    return fullName.includes(term) || code.includes(term) || email.includes(term) || desig.includes(term);
  });

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
            Welcome back, {user?.employee?.firstName} {user?.employee?.lastName}. Track onboarding progression, approve milestone gates, and verify ramp-up tasks for your direct team members.
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
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Direct Reports Onboarding Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned team members undergoing the onboarding curriculum</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by name, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
              {filteredReports.length} {filteredReports.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading direct reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              {search ? 'No direct reports match your search query.' : 'No direct reports currently assigned to your team.'}
            </div>
          ) : (
            filteredReports.map((report) => {
              const activeOnboarding = report.onboardings?.[0];
              const progress = report.progressPercentage || activeOnboarding?.overallProgress || 25;

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
                      Stage: <span className="font-semibold text-slate-600 uppercase">{activeOnboarding?.currentStage?.replace(/_/g, ' ') || 'DOCUMENT_UPLOAD'}</span>
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
                      onClick={() => openReportDetails(report)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
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

      {/* Direct Report Review & Approval Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Manager Review
                </span>
                <h2 className="text-2xl font-bold mt-2">
                  {selectedReport.firstName} {selectedReport.lastName}
                </h2>
                <div className="text-xs text-emerald-200/80 font-mono mt-1 flex flex-wrap gap-2">
                  <span>{selectedReport.employeeCode}</span>
                  <span>•</span>
                  <span>{selectedReport.designation}</span>
                  <span>•</span>
                  <span>{selectedReport.department?.name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Alert */}
            {signOffFeedback && (
              <div className={`p-4 text-xs font-medium flex items-center space-x-2 ${
                signOffFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-rose-50 text-rose-800 border-b border-rose-100'
              }`}>
                {signOffFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{signOffFeedback.message}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="py-12 text-center text-slate-400">Loading onboarding details...</div>
              ) : reportDetails ? (
                <>
                  {/* Progress & Stage Status */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">Current Onboarding Stage</div>
                      <div className="text-base font-extrabold text-slate-900 uppercase mt-0.5">
                        {reportDetails.currentStage?.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-500">Overall Progress</div>
                      <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
                        {reportDetails.overallProgress}%
                      </div>
                    </div>
                  </div>

                  {/* Checklist Milestones */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Onboarding Checklist ({reportDetails.checklistItems?.filter(c => c.status === 'COMPLETED').length} / {reportDetails.checklistItems?.length} Completed)</span>
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                      {reportDetails.checklistItems?.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                          <span className={item.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                            {item.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manager Approval Action Banner */}
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Manager Approval Gate</span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1">
                        Confirm team orientation, IT equipment readiness, and role expectations sign-off.
                      </p>
                    </div>

                    {reportDetails.currentStage === 'COMPLETED' ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-xl flex items-center space-x-1">
                        <Check className="w-4 h-4" />
                        <span>Candidate Fully Onboarded</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleManagerSignOff}
                        disabled={signingOff}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      >
                        {signingOff ? 'Signing off...' : 'Sign-Off & Advance to HR Final Sign-off'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  No active onboarding record found for this employee.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
