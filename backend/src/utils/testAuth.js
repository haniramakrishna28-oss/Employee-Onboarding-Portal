async function runAuthTests() {
  const BASE_URL = 'http://localhost:5000/api/auth';
  console.log('--- RUNNING AUTOMATED AUTH API TESTS ---');

  // Test 1: Login Admin
  const adminLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@portal.test', password: 'Password123!' })
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('1. Admin Login:', adminLoginRes.status === 200 && adminLoginData.success ? 'PASSED' : 'FAILED', adminLoginData.user?.email, adminLoginData.user?.role);

  // Test 2: Verify Protected /me Endpoint
  const adminToken = adminLoginData.token;
  const meRes = await fetch(`${BASE_URL}/me`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const meData = await meRes.json();
  console.log('2. Protected /me Check:', meRes.status === 200 && meData.user?.email === 'admin@portal.test' ? 'PASSED' : 'FAILED');

  // Test 3: Invalid Password Rejection
  const badLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@portal.test', password: 'WrongPassword!' })
  });
  console.log('3. Invalid Password Rejection (401 expected):', badLoginRes.status === 401 ? 'PASSED' : 'FAILED');

  // Test 4: Register New Candidate
  const testEmail = `new.hire.${Date.now()}@portal.test`;
  const regRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecurePassword123!',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1 555-987-6543'
    })
  });
  const regData = await regRes.json();
  console.log('4. New Employee Registration:', regRes.status === 201 && regData.success ? 'PASSED' : 'FAILED', regData.user?.employee?.employeeCode);

  // Test 5: Forgot Password & Dev Token Issuance
  const forgotRes = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  console.log('5. Forgot Password Request:', forgotRes.status === 200 && forgotData.devResetToken ? 'PASSED' : 'FAILED', 'Token length:', forgotData.devResetToken?.length);

  // Test 6: Reset Password with Token
  const resetRes = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: forgotData.devResetToken,
      newPassword: 'BrandNewPassword456!'
    })
  });
  const resetData = await resetRes.json();
  console.log('6. Reset Password Execution:', resetRes.status === 200 && resetData.success ? 'PASSED' : 'FAILED');

  // Test 7: Login with New Password
  const newLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'BrandNewPassword456!' })
  });
  const newLoginData = await newLoginRes.json();
  console.log('7. Login with Updated Password:', newLoginRes.status === 200 && newLoginData.success ? 'PASSED' : 'FAILED');

  console.log('--- ALL AUTH API TESTS COMPLETED ---');
}

runAuthTests().catch(console.error);
