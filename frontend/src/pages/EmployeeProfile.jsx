import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Building, 
  Save, 
  Check, 
  AlertCircle, 
  Plus, 
  Trash2,
  Calendar,
  HeartPulse
} from 'lucide-react';

export default function EmployeeProfile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    personalEmail: '',
    dateOfBirth: '',
    gender: 'PREFER_NOT_TO_SAY',
    maritalStatus: 'SINGLE',
    bloodGroup: 'O+',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
      altPhone: ''
    },
    education: [],
    previousExperience: []
  });

  const [orgDetails, setOrgDetails] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employee/me');
      if (res.success && res.profile) {
        const p = res.profile;
        setOrgDetails({
          employeeCode: p.employeeCode,
          designation: p.designation,
          department: p.department?.name,
          reportingManager: p.reportingManager ? `${p.reportingManager.firstName} ${p.reportingManager.lastName}` : 'None Assigned',
          joiningDate: p.joiningDate ? new Date(p.joiningDate).toLocaleDateString() : 'Pending'
        });

        setFormData({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          personalEmail: p.personalEmail || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || 'PREFER_NOT_TO_SAY',
          maritalStatus: p.maritalStatus || 'SINGLE',
          bloodGroup: p.bloodGroup || 'O+',
          address: p.address || { street: '', city: '', state: '', postalCode: '', country: '' },
          emergencyContact: p.emergencyContact || { name: '', relation: '', phone: '', altPhone: '' },
          education: Array.isArray(p.education) ? p.education : [],
          previousExperience: Array.isArray(p.previousExperience) ? p.previousExperience : []
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.put('/employee/me', formData);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Profile information saved successfully!' });
        // Update user context with new name if changed
        if (user && user.employee) {
          setUser({
            ...user,
            employee: {
              ...user.employee,
              firstName: formData.firstName,
              lastName: formData.lastName
            }
          });
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', grade: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.education];
      updated[index][field] = value;
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Experience Helpers
  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      previousExperience: [...prev.previousExperience, { company: '', designation: '', from: '', to: '' }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.previousExperience];
      updated[index][field] = value;
      return { ...prev, previousExperience: updated };
    });
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      previousExperience: prev.previousExperience.filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Contact', icon: User },
    { id: 'address', label: 'Residential Address', icon: MapPin },
    { id: 'emergency', label: 'Emergency Contact', icon: HeartPulse },
    { id: 'education', label: 'Education History', icon: GraduationCap },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'organization', label: 'Job & Reporting', icon: Building }
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading employee profile data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25">
            {formData.firstName?.[0]}{formData.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {formData.firstName} {formData.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {orgDetails?.employeeCode || 'EMP-CODE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {orgDetails?.designation} • {orgDetails?.department}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Notification Toast */}
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

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* TAB 1: Personal & Contact */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Personal & Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Personal Email</label>
                <input
                  type="email"
                  placeholder="personal.email@example.com"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Residential Address */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Residential Address Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Avenue, Apt 4B"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Province</label>
                  <input
                    type="text"
                    placeholder="California"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal / ZIP Code</label>
                  <input
                    type="text"
                    placeholder="94110"
                    value={formData.address.postalCode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={formData.address.country}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Emergency Contact */}
        {activeTab === 'emergency' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Emergency Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Watson"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, name: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent / Sibling"
                  value={formData.emergencyContact.relation}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, relation: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0001"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, phone: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alternative Phone</label>
                <input
                  type="tel"
                  placeholder="Optional alternate phone"
                  value={formData.emergencyContact.altPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact, altPhone: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Education History */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Academic Qualifications</h2>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            {formData.education.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No education records added yet. Click &quot;Add Degree&quot; to include your academic history.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree / Qualification</label>
                        <input
                          type="text"
                          placeholder="e.g. B.S. in Computer Science"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Institution / University</label>
                        <input
                          type="text"
                          placeholder="e.g. UC Berkeley"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passing Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022"
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grade / CGPA</label>
                        <input
                          type="text"
                          placeholder="e.g. 3.8 GPA"
                          value={edu.grade}
                          onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Work Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Previous Employment Records</h2>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Employment</span>
              </button>
            </div>

            {formData.previousExperience.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No previous experience records recorded. Fresh graduates can proceed without prior entries.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.previousExperience.map((exp, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Acme Labs"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Designation / Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Software Engineer"
                          value={exp.designation}
                          onChange={(e) => updateExperience(index, 'designation', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2022"
                          value={exp.from}
                          onChange={(e) => updateExperience(index, 'from', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2024"
                          value={exp.to}
                          onChange={(e) => updateExperience(index, 'to', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Organization Details */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Organizational Assignment & Hierarchy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Employee Identification</span>
                <div className="text-lg font-bold text-slate-900 font-mono mt-1">{orgDetails?.employeeCode}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Official Designation</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{orgDetails?.designation}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Assigned Department</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{orgDetails?.department || 'Unassigned'}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-500">Reporting Manager</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{orgDetails?.reportingManager}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-slate-500">Date of Joining</span>
                <div className="text-base font-bold text-slate-900 mt-1">{orgDetails?.joiningDate}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic">
              Note: Organizational assignment fields are maintained by HR Operations and can only be altered with administrative authorization.
            </p>
          </div>
        )}

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
