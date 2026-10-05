import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Clock, Search, Filter, Activity, Terminal, X, RefreshCw } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      if (res.success) setLogs(res.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('REGISTER')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (act.includes('ROLE') || act.includes('STATUS')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (act.includes('APPROVE') || act.includes('VERIF')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  const safeFormatJson = (raw) => {
    if (!raw) return '{}';
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(raw);
    }
  };

  const actionTypes = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    const actorEmail = (log.user?.email || '').toLowerCase();
    const actorName = log.user?.employee
      ? `${log.user.employee.firstName || ''} ${log.user.employee.lastName || ''}`.toLowerCase()
      : '';
    const action = (log.action || '').toLowerCase();
    const entity = (log.entity || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const ip = (log.ipAddress || '').toLowerCase();

    return (
      actorEmail.includes(term) ||
      actorName.includes(term) ||
      action.includes(term) ||
      entity.includes(term) ||
      details.includes(term) ||
      ip.includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <span>Compliance & Security Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable event log tracking user authentications, role delegations, document reviews, and pipeline transitions.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
          title="Refresh audit logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search by actor name, email, action, entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="">All Actions ({logs.length})</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-2 rounded-lg whitespace-nowrap">
            {filteredLogs.length} of {logs.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4 text-right">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    {search || actionFilter ? 'No audit events match current filters.' : 'No audit events recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {log.entity}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-800">
                      <div className="font-medium">
                        {log.user?.employee ? `${log.user.employee.firstName} ${log.user.employee.lastName}` : (log.user?.email || 'System/Anonymous')}
                      </div>
                      {log.user?.employee && (
                        <div className="text-[11px] text-slate-400">{log.user.email} • {log.user.role}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-xs font-mono text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded border border-indigo-100 transition-colors cursor-pointer"
                        >
                          View Payload
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-700 text-white relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Audit Event: {selectedLog.action}</span>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            <div className="space-y-3 mb-4 text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-200">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Entity:</span>
                <span className="font-mono text-slate-200">{selectedLog.entity} ({selectedLog.entityId || 'N/A'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">Actor:</span>
                <span className="text-slate-200">{selectedLog.user?.email || 'System'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">IP Address:</span>
                <span className="font-mono text-slate-200">{selectedLog.ipAddress || '::1'}</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-400 mb-1">Payload:</div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 border border-slate-800">
              {safeFormatJson(selectedLog.details)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
