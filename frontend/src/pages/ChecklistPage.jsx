import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  Circle, 
  Sparkles, 
  ShieldCheck, 
  Laptop, 
  CreditCard, 
  BookOpen, 
  FileText, 
  UserCheck, 
  Building
} from 'lucide-react';

export default function ChecklistPage() {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/checklist/my');
      if (res.success) setChecklist(res.checklist || []);
    } catch (err) {
      console.error('Failed to load checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (item) => {
    let nextStatus = 'IN_PROGRESS';
    if (item.status === 'PENDING') nextStatus = 'IN_PROGRESS';
    else if (item.status === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (item.status === 'COMPLETED') nextStatus = 'PENDING';

    setUpdatingId(item.id);
    try {
      const res = await api.put(`/checklist/${item.id}/status`, { status: nextStatus });
      if (res.success) {
        setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, status: nextStatus } : i));
      }
    } catch (err) {
      console.error('Error toggling checklist status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = checklist.filter(i => i.status === 'COMPLETED').length;
  const totalCount = checklist.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'LAPTOP':
        return <Laptop className="w-4 h-4 text-purple-600" />;
      case 'BANK_DETAILS':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'POLICY_ACK':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'ORIENTATION':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'ID_CARD':
        return <Building className="w-4 h-4 text-indigo-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <span>Onboarding Milestones & Checklist</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track key setup milestones across IT accounts, laptop provisioning, HR forms, and orientation.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{completedCount} of {totalCount} Items Completed ({progressPct}%)</span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-700">Checklist Completion</span>
          <span className="text-indigo-600 font-extrabold">{progressPct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading checklist items...</div>
        ) : checklist.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No checklist items found for this onboarding.</div>
        ) : (
          checklist.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const isInProgress = item.status === 'IN_PROGRESS';
            const isUpdating = updatingId === item.id;

            return (
              <div 
                key={item.id} 
                className={`p-5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 ${
                  isCompleted ? 'bg-slate-50/40' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => handleStatusToggle(item)}
                    disabled={isUpdating}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title={`Current: ${item.status}. Click to change status.`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 rounded bg-slate-100">
                        {getCategoryIcon(item.category)}
                      </span>
                      <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.title}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 pl-6">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-2 pl-6 pt-1 text-[11px] text-slate-400 font-medium">
                      <span>Owner: <strong className="text-slate-600 font-semibold">{item.assignedRole}</strong></span>
                      {item.completedAt && (
                        <>
                          <span>•</span>
                          <span>Completed on {new Date(item.completedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button Badge */}
                <button
                  onClick={() => handleStatusToggle(item)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : isInProgress
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isUpdating ? 'Saving...' : item.status.replace(/_/g, ' ')}
                </button>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
