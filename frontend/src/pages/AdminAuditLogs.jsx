import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Clock, Search, Filter, Activity, Terminal } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REGISTER')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('ROLE') || action.includes('STATUS')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('DELETE') || action.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          <span>Compliance & Security Audit Trail</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable event log tracking user authentications, role delegations, document reviews, and pipeline transitions.
        </p>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">No audit events recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
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
                      {log.user ? `${log.user.email} (${log.user.role})` : 'System/Anonymous'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-xs font-mono text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100"
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
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white text-xs">
                Close (ESC)
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
