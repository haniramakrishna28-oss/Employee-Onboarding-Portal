import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Building2, Plus, Users, Check, AlertCircle, X, Trash2, Edit3, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/departments');
      if (res.success) setDepartments(res.departments);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load departments' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        const res = await api.put(`/admin/departments/${editingDept.id}`, formData);
        if (res.success) {
          setShowModal(false);
          setEditingDept(null);
          setFormData({ name: '', code: '', description: '' });
          fetchDepartments();
          setFeedback({ type: 'success', message: `Department "${res.department.name}" updated successfully!` });
        }
      } else {
        const res = await api.post('/admin/departments', formData);
        if (res.success) {
          setShowModal(false);
          setFormData({ name: '', code: '', description: '' });
          fetchDepartments();
          setFeedback({ type: 'success', message: 'Department created successfully!' });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || `Failed to ${editingDept ? 'update' : 'create'} department` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/departments/${deleteTarget.id}`);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message || `Department "${deleteTarget.name}" deleted successfully!` });
        setDeleteTarget(null);
        fetchDepartments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete department' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Organizational Departments</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure company divisions, assignment rules, and department codes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm transition-all shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2 text-sm font-medium">
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <span>Loading departments...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No departments found</p>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first department.</p>
          </div>
        ) : (
          departments.map((d) => {
            const memberCount = d._count?.employees || 0;
            return (
              <div 
                key={d.id} 
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                      {d.code}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5">{d.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[36px]">
                    {d.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Created: {new Date(d.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(d)}
                      title="Edit Department"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      title={memberCount > 0 ? `Cannot delete: ${memberCount} assigned employee(s)` : 'Delete Department'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        memberCount > 0
                          ? 'text-slate-300 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingDept(null); }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal & Compliance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unique Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LGL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary of department responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingDept(null); }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? (editingDept ? 'Saving...' : 'Creating...') : (editingDept ? 'Save Changes' : 'Create Department')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-start space-x-3">
              <div className={`p-2.5 rounded-xl ${
                (deleteTarget._count?.employees || 0) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {(deleteTarget._count?.employees || 0) > 0 ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {(deleteTarget._count?.employees || 0) > 0 ? 'Cannot Delete Department' : 'Delete Department'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Department: <strong className="text-slate-800">{deleteTarget.name}</strong> ({deleteTarget.code})
                </p>
              </div>
              <button 
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(deleteTarget._count?.employees || 0) > 0 ? (
              <div className="mt-4 space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                  This department currently has <strong>{deleteTarget._count.employees} assigned employee(s)</strong>. To ensure organizational integrity, departments with active employees cannot be deleted. Please reassign the employees to another department first.
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete this department? This action will remove the department record from the system and cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{deleting ? 'Deleting...' : 'Delete Department'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
