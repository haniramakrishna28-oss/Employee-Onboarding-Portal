import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Building, 
  UserPlus, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  X,
  Eye,
  Check,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function HRDashboard() {
  const [stats, setStats] = useState(null);
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [stage, setStage] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Candidate Review Modal State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [modalTab, setModalTab] = useState('documents'); // 'documents' | 'checklist' | 'pipeline'
  const [reviewingDocId, setReviewingDocId] = useState(null);
  const [rejectionModalDoc, setRejectionModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [advancingStage, setAdvancingStage] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOnboardings();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, departmentId, status, stage, sortBy, order]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/onboarding/stats');
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error('Error fetching HR stats:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.success) setDepartments(res.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchOnboardings = async (overrideSearch = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (overrideSearch && overrideSearch.trim()) params.append('search', overrideSearch.trim());
      if (departmentId) params.append('departmentId', departmentId);
      if (status) params.append('status', status);
      if (stage) params.append('stage', stage);
      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/onboarding/list?${params.toString()}`);
      if (res.success) setOnboardings(res.onboardings);
    } catch (err) {
      console.error('Error loading onboardings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOnboardings(search);
  };

  const openCandidateReview = async (onboardingId) => {
    setLoadingCandidate(true);
    setActionFeedback(null);
    setModalTab('documents');
    try {
      const res = await api.get(`/onboarding/${onboardingId}`);
      if (res.success) {
        setSelectedCandidate(res.onboarding);
      }
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setLoadingCandidate(false);
    }
  };

  const handleDocumentReview = async (docId, action, reason = '') => {
    if (action === 'REJECT' && !reason.trim()) {
      setActionFeedback({ type: 'error', message: 'Rejection reason is required.' });
      return;
    }

    setReviewingDocId(docId);
    setActionFeedback(null);
    try {
      const res = await api.post(`/documents/${docId}/review`, {
        action,
        rejectionReason: reason
      });
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
        setRejectionModalDoc(null);
        setRejectionReason('');
        // Refresh candidate modal details & dashboard stats
        const refreshed = await api.get(`/onboarding/${selectedCandidate.id}`);
        if (refreshed.success) setSelectedCandidate(refreshed.onboarding);
        fetchStats();
        fetchOnboardings();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Document review action failed.' });
    } finally {
      setReviewingDocId(null);
    }
  };

  const handleAdvanceStage = async (nextStage) => {
    if (!selectedCandidate) return;
    setAdvancingStage(true);
    setActionFeedback(null);
    try {
      const res = await api.put(`/onboarding/${selectedCandidate.id}/stage`, {
        stage: nextStage,
        comments: `Advanced to ${nextStage.replace(/_/g, ' ')} by HR`
      });
      if (res.success) {
        setActionFeedback({ type: 'success', message: res.message });
        setSelectedCandidate(res.onboarding);
        fetchStats();
        fetchOnboardings();
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to advance stage.' });
    } finally {
      setAdvancingStage(false);
    }
  };

  const getStageBadge = (stg) => {
    switch (stg) {
      case 'DOCUMENT_UPLOAD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HR_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MANAGER_APPROVAL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'HR_FINAL_APPROVAL':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>HR Onboarding Command Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time candidate telemetry, document verification pipelines, and milestone sign-offs.
          </p>
        </div>

        <Link
          to="/hr/onboarding/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Onboarding</span>
        </Link>
      </div>

      {/* 6 Real-Time Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Workforce</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.totalEmployees ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active in organization</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Joiners</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{stats?.newJoiners ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Joined last 30 days</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats?.pendingOnboardings ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active pipelines</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{stats?.completedOnboardings ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fully signed off</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Docs</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">{stats?.pendingDocuments ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting verification</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">{stats?.overdueTasks ?? '—'}</div>
          <div className="text-[11px] text-slate-400 mt-1">Past deadline</div>
        </div>

      </div>

      {/* Filter, Search & Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search candidate, email, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Stages</option>
            <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
            <option value="HR_REVIEW">HR_REVIEW</option>
            <option value="MANAGER_APPROVAL">MANAGER_APPROVAL</option>
            <option value="HR_FINAL_APPROVAL">HR_FINAL_APPROVAL</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="joiningDate">Joining Date</option>
            <option value="deadline">Target Deadline</option>
            <option value="overallProgress">Progress %</option>
          </select>

          {/* Order Toggle */}
          <button
            onClick={() => setOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs flex items-center space-x-1"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] font-bold">{order}</span>
          </button>
        </div>

      </div>

      {/* Candidate Onboardings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Department & Manager</th>
                <th className="py-3.5 px-4">Joining / Deadline</th>
                <th className="py-3.5 px-4">Progress %</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading candidate onboardings...</td>
                </tr>
              ) : onboardings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No onboarding records match the specified filters.</td>
                </tr>
              ) : (
                onboardings.map((ob) => {
                  const emp = ob.employee;
                  const progress = Math.round(ob.overallProgress || emp?.progressPercentage || 0);

                  return (
                    <tr key={ob.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {emp ? `${emp.firstName[0]}${emp.lastName[0]}` : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned'}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {emp?.employeeCode} • {emp?.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-slate-800">{emp?.department?.name || 'General'}</div>
                        <div className="text-xs text-slate-500">
                          Mgr: {emp?.reportingManager ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}` : 'Unassigned'}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-800 font-medium">
                          Joined: {new Date(ob.joiningDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400">
                          Due: {new Date(ob.deadline).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-4 px-4 w-44">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-slate-700">{progress}%</span>
                          <span className="text-[11px] text-slate-400">
                            {ob._count?.documents || 0} docs • {ob._count?.checklistItems || 0} items
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageBadge(ob.currentStage)}`}>
                          {ob.currentStage.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openCandidateReview(ob.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <span>Review & Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Onboarding & Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Candidate Onboarding
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedCandidate.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {selectedCandidate.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mt-2">
                  {selectedCandidate.employee?.firstName} {selectedCandidate.employee?.lastName}
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap gap-3">
                  <span>Code: {selectedCandidate.employee?.employeeCode}</span>
                  <span>•</span>
                  <span>Dept: {selectedCandidate.employee?.department?.name}</span>
                  <span>•</span>
                  <span>Role: {selectedCandidate.employee?.designation}</span>
                  <span>•</span>
                  <span>Manager: {selectedCandidate.employee?.reportingManager ? `${selectedCandidate.employee.reportingManager.firstName} ${selectedCandidate.employee.reportingManager.lastName}` : 'Unassigned'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Progress Bar */}
            <div className="bg-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-300 border-t border-slate-700">
              <div className="flex items-center space-x-3 w-full max-w-md">
                <span>Progress: <strong className="text-white">{selectedCandidate.overallProgress}%</strong></span>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${selectedCandidate.overallProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs">
                Current Stage: <span className="font-semibold text-emerald-400 uppercase">{selectedCandidate.currentStage?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Action Feedback Banner */}
            {actionFeedback && (
              <div className={`p-4 text-xs font-medium flex items-center space-x-2 ${
                actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' : 'bg-rose-50 text-rose-800 border-b border-rose-100'
              }`}>
                {actionFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
              <button
                onClick={() => setModalTab('documents')}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  modalTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Uploaded Documents ({selectedCandidate.documents?.length || 0})</span>
              </button>
              <button
                onClick={() => setModalTab('checklist')}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  modalTab === 'checklist' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Milestones & Tasks ({selectedCandidate.checklistItems?.length || 0})</span>
              </button>
              <button
                onClick={() => setModalTab('pipeline')}
                className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  modalTab === 'pipeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approval Pipeline</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">

              {/* TAB 1: DOCUMENTS REVIEW */}
              {modalTab === 'documents' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Review and verify documents submitted by the candidate. Approved documents contribute 35% toward final completion.
                  </div>

                  {(!selectedCandidate.documents || selectedCandidate.documents.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No documents uploaded yet by this candidate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCandidate.documents.map((doc) => {
                        const isApproved = doc.status === 'APPROVED';
                        const isRejected = doc.status === 'REJECTED';
                        const isReviewing = reviewingDocId === doc.id;

                        return (
                          <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900 text-sm">{doc.category.replace(/_/g, ' ')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {doc.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-1">
                                {doc.originalFilename} • {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </div>
                              {doc.rejectionReason && (
                                <div className="text-xs text-rose-600 mt-1 font-medium bg-rose-50 p-2 rounded border border-rose-100">
                                  Rejection feedback: {doc.rejectionReason}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                              <a
                                href={doc.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View File</span>
                              </a>

                              {!isApproved && (
                                <>
                                  <button
                                    onClick={() => handleDocumentReview(doc.id, 'APPROVE')}
                                    disabled={isReviewing}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => setRejectionModalDoc(doc)}
                                    disabled={isReviewing}
                                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
                                  >
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHECKLIST & TASKS */}
              {modalTab === 'checklist' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Onboarding Milestones</h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedCandidate.checklistItems?.map((item) => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            {item.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500" />
                            )}
                            <span className={item.status === 'COMPLETED' ? 'line-through text-slate-400 font-medium' : 'text-slate-800 font-semibold'}>
                              {item.title}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">Assigned Tasks</h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                      {selectedCandidate.tasks?.map((t) => (
                        <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{t.title}</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Due: {new Date(t.deadline).toLocaleDateString()} • Priority: {t.priority}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: APPROVAL PIPELINE */}
              {modalTab === 'pipeline' && (
                <div className="space-y-6">
                  <div className="text-xs text-slate-500">
                    Sequential multi-stage approval workflow. HR Initial Review ➔ Manager Approval ➔ HR Final Approval ➔ Completed.
                  </div>

                  <div className="space-y-3">
                    {selectedCandidate.approvals?.map((appr, idx) => (
                      <div key={appr.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            appr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {appr.stepNumber}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{appr.stage.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-slate-400">
                              Approver Role: <strong className="text-slate-600">{appr.approverRole}</strong>
                              {appr.comments && ` • "${appr.comments}"`}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          appr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {appr.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stage Advance Action */}
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Advance Onboarding Pipeline</h4>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        Current stage is <strong className="underline">{selectedCandidate.currentStage?.replace(/_/g, ' ')}</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCandidate.currentStage !== 'COMPLETED' ? (
                        <>
                          {selectedCandidate.currentStage === 'DOCUMENT_UPLOAD' && (
                            <button
                              onClick={() => handleAdvanceStage('HR_REVIEW')}
                              disabled={advancingStage}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              {advancingStage ? 'Advancing...' : 'Advance to HR Review'}
                            </button>
                          )}
                          {selectedCandidate.currentStage === 'HR_REVIEW' && (
                            <button
                              onClick={() => handleAdvanceStage('MANAGER_APPROVAL')}
                              disabled={advancingStage}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              {advancingStage ? 'Advancing...' : 'Approve & Send to Manager'}
                            </button>
                          )}
                          {(selectedCandidate.currentStage === 'MANAGER_APPROVAL' || selectedCandidate.currentStage === 'HR_FINAL_APPROVAL') && (
                            <button
                              onClick={() => handleAdvanceStage('COMPLETED')}
                              disabled={advancingStage}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              {advancingStage ? 'Finalizing...' : 'Final Sign-Off (Mark Completed)'}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center space-x-1">
                          <Check className="w-4 h-4" />
                          <span>Candidate Fully Onboarded</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Document Rejection Prompt Modal */}
      {rejectionModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base">Reject Document</h3>
              <button onClick={() => setRejectionModalDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Provide specific feedback to the candidate for rejecting <strong>{rejectionModalDoc.category}</strong>:
            </p>
            <textarea
              rows={3}
              placeholder="e.g., File is blurry, expired ID, or signature missing..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectionModalDoc(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDocumentReview(rejectionModalDoc.id, 'REJECT', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
