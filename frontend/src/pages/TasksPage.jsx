import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  Send, 
  Plus, 
  X, 
  User, 
  Flag,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [feedback, setFeedback] = useState(null);

  // New task modal (HR / Manager)
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    onboardingId: ''
  });
  const [onboardings, setOnboardings] = useState([]);
  const [creatingTask, setCreatingTask] = useState(false);

  const canCreateTask = ['HR', 'MANAGER', 'ADMIN'].includes(user?.role);

  useEffect(() => {
    fetchTasks();
    if (canCreateTask) {
      loadOnboardings();
    }
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/my');
      if (res.success) setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOnboardings = async () => {
    try {
      const res = await api.get('/onboarding/list');
      if (res.success) {
        setOnboardings(res.onboardings);
        if (res.onboardings.length > 0) {
          setNewTask(prev => ({ ...prev, onboardingId: res.onboardings[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleAddComment = async (taskId, e) => {
    e.preventDefault();
    const message = commentInputs[taskId]?.trim();
    if (!message) return;

    setSubmittingComment(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { message });
      if (res.success && res.comment) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return { ...t, comments: [...(t.comments || []), res.comment] };
          }
          return t;
        }));
        setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.onboardingId) return;

    setCreatingTask(true);
    try {
      const res = await api.post('/tasks/create', newTask);
      if (res.success) {
        setShowModal(false);
        setNewTask({ title: '', description: '', priority: 'MEDIUM', deadline: '', onboardingId: onboardings[0]?.id || '' });
        setFeedback({ type: 'success', message: 'Task assigned successfully!' });
        fetchTasks();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign task.' });
    } finally {
      setCreatingTask(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isOverdue = (deadline, status) => {
    if (!deadline || status === 'COMPLETED') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <ListTodo className="w-6 h-6 text-indigo-600" />
            <span>Onboarding Tasks & Action Items</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Prioritized ramp-up deliverables, team alignments, and discussion threads.
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2 text-sm font-medium">
            {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold text-slate-500">Dismiss</button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-5">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No tasks currently assigned. You are all caught up!
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = isOverdue(task.deadline, task.status);

            return (
              <div 
                key={task.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${
                  overdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      {overdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>OVERDUE</span>
                        </span>
                      )}
                      <h3 className="font-bold text-slate-900 text-base">{task.title}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      {task.deadline && (
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                      <span>•</span>
                      <span>Assigned by: {task.createdBy?.employee ? `${task.createdBy.employee.firstName} ${task.createdBy.employee.lastName}` : 'HR/Manager'}</span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleStatusChange(task.id, 'TODO')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        task.status === 'TODO' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      To-Do
                    </button>
                    <button
                      onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        task.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        task.status === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-slate-600 py-3 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Discussion Thread */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Discussion & Updates ({task.comments?.length || 0})</span>
                  </div>

                  {task.comments && task.comments.length > 0 && (
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                      {task.comments.map((c) => (
                        <div key={c.id} className="text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">
                              {c.user?.employee ? `${c.user.employee.firstName} ${c.user.employee.lastName}` : c.user?.email}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{c.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <form onSubmit={(e) => handleAddComment(task.id, e)} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add a comment or update on this task..."
                      value={commentInputs[task.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [task.id]: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment[task.id] || !commentInputs[task.id]?.trim()}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Assign New Task Modal (HR / Manager) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Assign Onboarding Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Candidate *</label>
                <select
                  value={newTask.onboardingId}
                  onChange={(e) => setNewTask({ ...newTask, onboardingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {onboardings.map((ob) => (
                    <option key={ob.id} value={ob.id}>
                      {ob.employee?.firstName} {ob.employee?.lastName} ({ob.employee?.department?.name || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Security & Phishing Training"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Description</label>
                <textarea
                  rows="3"
                  placeholder="Details, expectations, or links to training material..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {creatingTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
