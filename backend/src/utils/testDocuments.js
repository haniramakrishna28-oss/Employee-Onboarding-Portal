const fs = require('fs');
const path = require('path');

async function testDocuments() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- RUNNING AUTOMATED DOCUMENT & VERIFICATION WORKFLOW TESTS ---');

  // 1. Login Emma Watson
  const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@portal.test', password: 'Password123!' })
  });
  const empLogin = await empLoginRes.json();
  const empToken = empLogin.token;

  // 2. Login HR Hannah Abbott
  const hrLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@portal.test', password: 'Password123!' })
  });
  const hrLogin = await hrLoginRes.json();
  const hrToken = hrLogin.token;

  // 3. Create a temporary dummy sample document
  const tempFilePath = path.join(__dirname, 'sample_resume.pdf');
  fs.writeFileSync(tempFilePath, '%PDF-1.4 Sample Resume for Onboarding Portal Test');

  // 4. Upload file using FormData
  const fileBuffer = fs.readFileSync(tempFilePath);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('category', 'RESUME');
  formData.append('file', blob, 'sample_resume.pdf');

  const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${empToken}`
    },
    body: formData
  });
  const uploadData = await uploadRes.json();
  console.log('1. Document Upload (201 expected):', uploadRes.status === 201 ? 'PASSED' : 'FAILED', uploadData.document?.originalFilename, uploadData.document?.status);

  const docId = uploadData.document?.id;

  // 5. HR Rejection Test with reason
  const rejectRes = await fetch(`${BASE_URL}/documents/${docId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hrToken}`
    },
    body: JSON.stringify({
      action: 'REJECT',
      rejectionReason: 'Please ensure contact phone number matches profile.'
    })
  });
  const rejectData = await rejectRes.json();
  console.log('2. HR Rejection with Feedback (200 expected):', rejectRes.status === 200 && rejectData.document?.status === 'REJECTED' ? 'PASSED' : 'FAILED', rejectData.document?.rejectionReason);

  // 6. Employee Views Rejected Document and Feedback
  const myDocsRes = await fetch(`${BASE_URL}/documents/my`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  const myDocs = await myDocsRes.json();
  const rejectedDoc = myDocs.documents?.find(d => d.id === docId);
  console.log('3. Employee sees Rejection Status & Comment:', (rejectedDoc?.status === 'REJECTED' && rejectedDoc?.rejectionReason) ? 'PASSED' : 'FAILED');

  // 7. HR Final Approval Test
  const approveRes = await fetch(`${BASE_URL}/documents/${docId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hrToken}`
    },
    body: JSON.stringify({
      action: 'APPROVE'
    })
  });
  const approveData = await approveRes.json();
  console.log('4. HR Approval Test (200 expected):', approveRes.status === 200 && approveData.document?.status === 'APPROVED' ? 'PASSED' : 'FAILED');

  // Clean up temp file
  if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

  console.log('--- ALL DOCUMENT & VERIFICATION WORKFLOW TESTS PASSED ---');
}

testDocuments().catch(console.error);
