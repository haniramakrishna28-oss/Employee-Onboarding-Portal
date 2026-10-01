async function testProfile() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- RUNNING AUTOMATED PROFILE TESTS ---');

  // 1. Login Emma Watson
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@portal.test', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // 2. Fetch /api/employee/me
  const profileRes = await fetch(`${BASE_URL}/employee/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  console.log('1. Get My Profile (200 expected):', profileRes.status === 200 ? 'PASSED' : 'FAILED', {
    name: `${profileData.profile?.firstName} ${profileData.profile?.lastName}`,
    manager: profileData.profile?.reportingManager ? `${profileData.profile.reportingManager.firstName} ${profileData.profile.reportingManager.lastName}` : 'None',
    educationCount: profileData.profile?.education?.length
  });

  // 3. Update Profile
  const updatedData = {
    ...profileData.profile,
    phone: '+1 (555) 777-8888',
    address: {
      street: '999 High Street, Suite 500',
      city: 'Palo Alto',
      state: 'CA',
      postalCode: '94301',
      country: 'United States'
    },
    education: [
      ...(profileData.profile.education || []),
      { degree: 'M.S. in Software Systems', institution: 'Stanford University', year: '2024', grade: '3.9 GPA' }
    ]
  };

  const updateRes = await fetch(`${BASE_URL}/employee/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedData)
  });
  const updateResData = await updateRes.json();
  console.log('2. Update My Profile (200 expected):', updateRes.status === 200 && updateResData.success ? 'PASSED' : 'FAILED');

  // 4. Verify Refetch
  const refetchRes = await fetch(`${BASE_URL}/employee/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const refetchData = await refetchRes.json();
  const phoneMatched = refetchData.profile?.phone === '+1 (555) 777-8888';
  const addressMatched = refetchData.profile?.address?.city === 'Palo Alto';
  const eduCount = refetchData.profile?.education?.length;
  console.log('3. Verified Updated Profile Values in DB:', (phoneMatched && addressMatched && eduCount === 2) ? 'PASSED' : 'FAILED', {
    phone: refetchData.profile?.phone,
    city: refetchData.profile?.address?.city,
    educationCount: eduCount
  });

  console.log('--- ALL PROFILE TESTS PASSED SUCCESSFULLY ---');
}

testProfile().catch(console.error);
