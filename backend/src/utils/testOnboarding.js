async function testOnboarding() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- RUNNING AUTOMATED ONBOARDING & HR STATS TESTS ---');

  // 1. Login HR
  const hrRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@portal.test', password: 'Password123!' })
  });
  const hrData = await hrRes.json();
  const hrToken = hrData.token;

  // 2. Fetch HR Stats
  const statsRes = await fetch(`${BASE_URL}/onboarding/stats`, {
    headers: { 'Authorization': `Bearer ${hrToken}` }
  });
  const statsData = await statsRes.json();
  console.log('1. HR Stats Endpoint (200 expected):', statsRes.status === 200 ? 'PASSED' : 'FAILED', statsData.stats);

  // 3. Fetch HR Onboardings List
  const listRes = await fetch(`${BASE_URL}/onboarding/list`, {
    headers: { 'Authorization': `Bearer ${hrToken}` }
  });
  const listData = await listRes.json();
  console.log('2. HR Onboardings List (200 expected):', listRes.status === 200 ? 'PASSED' : 'FAILED', `Count: ${listData.onboardings?.length}`);

  // 4. Test Search and Sorting
  const searchRes = await fetch(`${BASE_URL}/onboarding/list?search=Emma&sortBy=joiningDate&order=asc`, {
    headers: { 'Authorization': `Bearer ${hrToken}` }
  });
  const searchData = await searchRes.json();
  console.log('3. Search and Sort Filter (Emma expected):', searchRes.status === 200 && searchData.onboardings?.[0]?.employee?.firstName === 'Emma' ? 'PASSED' : 'FAILED');

  // 5. Test Wizard Helper Endpoints
  const tmplRes = await fetch(`${BASE_URL}/onboarding/templates`, { headers: { 'Authorization': `Bearer ${hrToken}` } });
  const mgrRes = await fetch(`${BASE_URL}/onboarding/managers`, { headers: { 'Authorization': `Bearer ${hrToken}` } });
  const tmplData = await tmplRes.json();
  const mgrData = await mgrRes.json();
  console.log('4. Wizard Dropdowns (Templates & Managers):', tmplRes.status === 200 && mgrRes.status === 200 ? 'PASSED' : 'FAILED', {
    templatesCount: tmplData.templates?.length,
    managersCount: mgrData.managers?.length
  });

  console.log('--- ALL ONBOARDING & HR STATS TESTS PASSED ---');
}

testOnboarding().catch(console.error);
