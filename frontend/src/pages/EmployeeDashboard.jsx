import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  User, 
  FileText, 
  CheckSquare, 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Calendar,
  Building
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In later steps, this will fetch full onboarding details
    setLoading(false);
  }, []);

  const employee = user?.employee;
  const progress = employee?.progressPercentage || 25;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Onboarding Status: {employee?.onboardingStatus || 'IN_PROGRESS'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome aboard, {employee?.firstName || user?.email}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            We are thrilled to have you join our team as <span className="font-semibold text-white">{employee?.designation || 'Software Engineer'}</span>. Complete your profile and onboarding checklist below.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-indigo-200">
            <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <Building className="w-4 h-4 text-indigo-300" />
              <span>Department: {employee?.department?.name || 'Engineering'}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>Employee Code: {employee?.employeeCode || 'EMP-DEV-004'}</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      </div>

      {/* Live Overall Progress Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-base">Onboarding Completion Progress</span>
            <span className="text-xs text-slate-500">(Documents, Checklist, Tasks, Approvals)</span>
          </div>
          <span className="text-xl font-extrabold text-indigo-600">{progress}%</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Profile Data (Complete)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Documents (Pending Review)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Checklist (1/8 Complete)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Sign-off (Pending)</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link 
          to="/employee/profile" 
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Personal Profile</h3>
            <p className="text-xs text-slate-500 mt-1">Review contact, address, emergency contact, education, and bank information.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Manage Profile</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link 
          to="/employee/documents" 
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Upload Documents</h3>
            <p className="text-xs text-slate-500 mt-1">Upload ID proof, address proof, certificates, and check verification status.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>View Documents</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link 
          to="/employee/checklist" 
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Onboarding Checklist</h3>
            <p className="text-xs text-slate-500 mt-1">Interactive checklist items for IT account, laptop, handbook acknowledgement, etc.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Complete Checklist</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link 
          to="/employee/tasks" 
          className="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ListTodo className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Assigned Tasks</h3>
            <p className="text-xs text-slate-500 mt-1">Check priorities, deadlines, post comments, and upload deliverables.</p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>View Tasks</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>

    </div>
  );
}
