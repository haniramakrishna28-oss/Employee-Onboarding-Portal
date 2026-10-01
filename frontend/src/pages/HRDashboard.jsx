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
  ShieldCheck
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

  useEffect(() => {
    fetchStats();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchOnboardings();
  }, [departmentId, status, stage, sortBy, order]);

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

  const fetchOnboardings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
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
    fetchOnboardings();
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
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
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
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Stages</option>
            <option value="DOCUMENT_UPLOAD">Document Upload</option>
            <option value="HR_REVIEW">HR Review</option>
            <option value="MANAGER_APPROVAL">Manager Approval</option>
            <option value="HR_FINAL_APPROVAL">HR Final Approval</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Sort Field */}
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

          {/* Sort Order Toggle */}
          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
            title={`Toggle sort order (Currently ${order.toUpperCase()})`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Candidate Onboardings Data Table */}
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
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            ob.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {ob.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
