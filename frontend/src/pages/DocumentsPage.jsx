import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  MessageSquare,
  FileCheck,
  FileX
} from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Review modal state (for HR / Admin)
  const [reviewModalDoc, setReviewModalDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fileInputRef = useRef({});

  const isHRorAdmin = ['HR', 'ADMIN'].includes(user?.role);

  const categories = [
    { key: 'RESUME', title: 'Resume / Curriculum Vitae', desc: 'Current professional resume in PDF format.', required: true },
    { key: 'ID_PROOF', title: 'Government Photo ID', desc: 'Passport, National Identity Card, or Driver’s License.', required: true },
    { key: 'ADDRESS_PROOF', title: 'Proof of Residence', desc: 'Recent utility bill, bank statement, or lease agreement.', required: true },
    { key: 'EDUCATION_CERT', title: 'Degree Certificate / Transcript', desc: 'Highest educational qualification certificate.', required: true },
    { key: 'PREV_EMPLOYMENT', title: 'Previous Employment / Relieving Letter', desc: 'Experience letter from most recent employer.', required: false },
    { key: 'BANK_DETAILS', title: 'Cancelled Cheque / Bank Proof', desc: 'Direct deposit bank verification with routing info.', required: true },
    { key: 'OTHER', title: 'Additional Credentials', desc: 'Professional licenses, certifications, or tax forms.', required: false },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents/my');
      if (res.success) setDocuments(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (category, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File exceeds 5MB maximum allowed limit.' });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setFeedback({ type: 'error', message: 'Invalid file type. Only PDF, PNG, JPG, and DOCX are allowed.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    setUploadingCategory(category);
    setFeedback(null);
    try {
      const res = await api.post('/documents/upload', formData);
      if (res.success) {
        setFeedback({ type: 'success', message: `${file.name} uploaded successfully!` });
        fetchDocuments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'File upload failed.' });
    } finally {
      setUploadingCategory(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Document removed successfully.' });
        fetchDocuments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete document.' });
    }
  };

  const handleReviewAction = async (action) => {
    if (action === 'REJECT' && !rejectionReason.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a reason for rejecting this document.' });
      return;
    }

    setReviewing(true);
    try {
      const res = await api.post(`/documents/${reviewModalDoc.id}/review`, {
        action,
        rejectionReason
      });
      if (res.success) {
        setReviewModalDoc(null);
        setRejectionReason('');
        setFeedback({ type: 'success', message: res.message });
        fetchDocuments();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Review action failed.' });
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (doc) => {
    if (!doc) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span>Not Uploaded</span>
        </span>
      );
    }
    switch (doc.status) {
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            <span>Uploaded (Pending Review)</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Under Review</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified & Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <FileX className="w-3 h-3" />
            <span>Action Required / Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-6 h-6 text-indigo-600" />
            <span>Compliance Document Verification</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload required credentials for verification by the HR team. Formats: PDF, PNG, JPG, DOCX (Max 5MB).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Local Storage</span>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center space-x-2 text-sm font-medium">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold text-slate-500">Dismiss</button>
        </div>
      )}

      {/* Document Slots List */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const doc = documents.find(d => d.category === cat.key);
          const isUploading = uploadingCategory === cat.key;
          const isApproved = doc?.status === 'APPROVED';
          const isRejected = doc?.status === 'REJECTED';

          return (
            <div 
              key={cat.key}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                isRejected 
                  ? 'border-rose-300 ring-1 ring-rose-200 shadow-sm' 
                  : isApproved 
                  ? 'border-emerald-200 shadow-sm' 
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Title & Description */}
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-base">{cat.title}</h3>
                    {cat.required && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        MANDATORY
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{cat.desc}</p>

                  {/* Document details if uploaded */}
                  {doc && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 font-mono">
                      <span>File: {doc.originalFilename}</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Rejection comment banner */}
                  {isRejected && doc.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start space-x-2 text-xs text-rose-800">
                      <MessageSquare className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">HR Feedback: </span>
                        <span>{doc.rejectionReason}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Badge & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end">
                  
                  {getStatusBadge(doc)}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={(el) => (fileInputRef.current[cat.key] = el)}
                    onChange={(e) => handleFileChange(cat.key, e)}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                    className="hidden"
                  />

                  {/* Actions depending on state */}
                  <div className="flex items-center space-x-2">
                    {doc ? (
                      <>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>

                        <a
                          href={doc.filePath}
                          download={doc.originalFilename}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {!isApproved && (
                          <>
                            <button
                              onClick={() => fileInputRef.current[cat.key]?.click()}
                              disabled={isUploading}
                              className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Replace with new file"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                              <span>Replace</span>
                            </button>

                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* HR Review Action Button */}
                        {isHRorAdmin && !isApproved && (
                          <button
                            onClick={() => {
                              setReviewModalDoc(doc);
                              setRejectionReason(doc.rejectionReason || '');
                            }}
                            className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer shadow-sm"
                          >
                            <span>Review (HR)</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current[cat.key]?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Document Inline Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewDoc.originalFilename}</h3>
                <span className="text-xs text-slate-500 font-mono">Category: {previewDoc.category}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto my-4 bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
              {previewDoc.mimeType?.startsWith('image/') ? (
                <img src={previewDoc.filePath} alt="Document Preview" className="max-h-[60vh] object-contain rounded" />
              ) : previewDoc.mimeType === 'application/pdf' ? (
                <iframe src={previewDoc.filePath} title="PDF Preview" className="w-full h-[60vh] rounded border-0" />
              ) : (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">Direct inline preview is not supported for this file format.</p>
                  <a
                    href={previewDoc.filePath}
                    download={previewDoc.originalFilename}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to View</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Document Review Modal */}
      {reviewModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">HR Document Verification</h3>
              <button onClick={() => setReviewModalDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><span className="font-semibold text-slate-700">Category:</span> {reviewModalDoc.category}</div>
                <div><span className="font-semibold text-slate-700">File:</span> {reviewModalDoc.originalFilename}</div>
                <div><span className="font-semibold text-slate-700">Uploaded:</span> {new Date(reviewModalDoc.uploadedAt).toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Review Feedback / Rejection Reason (Mandatory if Rejecting)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Please provide a clearer scanned copy showing the complete passport expiration date."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction('REJECT')}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors disabled:opacity-50"
                >
                  {reviewing ? 'Processing...' : 'Reject Document'}
                </button>

                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction('APPROVE')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {reviewing ? 'Processing...' : 'Approve Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
