import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  UserCheck, 
  Building, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export default function OnboardingNew() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default dates
  const today = new Date().toISOString().split('T')[0];
  const defaultDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: '',
    managerId: '',
    templateId: '',
    joiningDate: today,
    deadline: defaultDeadline
  });

  useEffect(() => {
    loadWizardData();
  }, []);

  const loadWizardData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, mgrRes, tmplRes] = await Promise.all([
        api.get('/onboarding/available-employees'),
        api.get('/admin/departments'),
        api.get('/onboarding/managers'),
        api.get('/onboarding/templates')
      ]);

      if (empRes.success) setEmployees(empRes.employees);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (mgrRes.success) setManagers(mgrRes.managers);
      if (tmplRes.success) {
        setTemplates(tmplRes.templates);
        // Default to first template if available
        if (tmplRes.templates.length > 0) {
          setFormData(prev => ({ ...prev, templateId: tmplRes.templates[0].id }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load onboarding wizard options.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (empId) => {
    const selected = employees.find(e => e.id === empId);
    setFormData(prev => ({
      ...prev,
      employeeId: empId,
      departmentId: selected?.departmentId || prev.departmentId,
      managerId: selected?.reportingManagerId || prev.managerId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId) {
      setError('Please select an employee candidate.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/onboarding/create', formData);
      if (res.success) {
        navigate('/hr/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize onboarding.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link to="/hr/dashboard" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to HR Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Onboarding Provisioning Wizard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Initiate New Employee Onboarding</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure department, manager assignment, checklist milestones, and compliance deadlines.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Wizard Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Step 1: Candidate Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            1. Select Employee Candidate *
          </label>
          
          {loading ? (
            <div className="text-sm text-slate-400 py-3">Loading available joiners...</div>
          ) : employees.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <span>All registered employees currently have an active onboarding in progress.</span>
              <Link to="/admin/users" className="font-semibold underline">
                Add another employee account
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {employees.map((emp) => {
                const isSelected = formData.employeeId === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleEmployeeSelect(emp.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {emp.employeeCode} • {emp.user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Department & Reporting Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Assigned Department *
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Reporting Manager *
            </label>
            <select
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Reporting Manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.designation || 'Manager'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              4. Official Joining Date *
            </label>
            <input
              type="date"
              required
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              5. Onboarding Target Deadline *
            </label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Step 4: Template Selection & Preview */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            6. Onboarding Template & Curriculum *
          </label>
          
          <select
            value={formData.templateId}
            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.title} {t.isDefault ? '(Default)' : ''}</option>
            ))}
          </select>

          {selectedTemplate && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="font-semibold text-slate-900">{selectedTemplate.title}</div>
              <p>{selectedTemplate.description}</p>
              <div className="flex items-center space-x-3 text-indigo-700 font-semibold pt-1">
                <span>Includes 8 Standard Checklist Milestones</span>
                <span>•</span>
                <span>3 Initial Ramp-Up Tasks</span>
                <span>•</span>
                <span>3-Tier Approval Gates</span>
              </div>
            </div>
          )}
        </div>

        {/* Launch Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting || !formData.employeeId}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span>Initializing Workflow...</span>
            ) : (
              <>
                <span>Launch Onboarding Workflow</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
