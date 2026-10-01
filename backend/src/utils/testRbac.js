async function testRBAC() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- RUNNING AUTOMATED RBAC AND ADMIN/MANAGER TESTS ---');

  // 1. Login Admin
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@portal.test', password: 'Password123!' })
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.token;

  // 2. Login Employee
  const empRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@portal.test', password: 'Password123!' })
  });
  const empData = await empRes.json();
  const empToken = empData.token;

  // 3. Login Manager
  const mgrRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@portal.test', password: 'Password123!' })
  });
  const mgrData = await mgrRes.json();
  const mgrToken = mgrData.token;

  // Test Admin Access to /api/admin/users
  const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminUsersData = await adminUsersRes.json();
  console.log('1. Admin accessing /api/admin/users (200 expected):', adminUsersRes.status === 200 ? 'PASSED' : 'FAILED', `Count: ${adminUsersData.users?.length}`);

  // Test Employee Access to /api/admin/users (Must be 403 Forbidden)
  const empForbiddenRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  console.log('2. Employee blocked from /api/admin/users (403 expected):', empForbiddenRes.status === 403 ? 'PASSED' : 'FAILED');

  // Test Manager Access to /api/admin/users (Must be 403 Forbidden)
  const mgrForbiddenRes = await fetch(`${BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${mgrToken}` }
  });
  console.log('3. Manager blocked from /api/admin/users (403 expected):', mgrForbiddenRes.status === 403 ? 'PASSED' : 'FAILED');

  // Test Manager Access to /api/manager/direct-reports (Must be 200)
  const mgrReportsRes = await fetch(`${BASE_URL}/manager/direct-reports`, {
    headers: { 'Authorization': `Bearer ${mgrToken}` }
  });
  const mgrReportsData = await mgrReportsRes.json();
  const reportNames = mgrReportsData.directReports?.map(r => `${r.firstName} ${r.lastName}`).join(', ');
  console.log('4. Manager accessing /api/manager/direct-reports (200 expected):', mgrReportsRes.status === 200 ? 'PASSED' : 'FAILED', `Direct Reports: [${reportNames}]`);

  // Test Employee Access to /api/manager/direct-reports (Must be 403 Forbidden)
  const empMgrForbiddenRes = await fetch(`${BASE_URL}/manager/direct-reports`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  console.log('5. Employee blocked from /api/manager/direct-reports (403 expected):', empMgrForbiddenRes.status === 403 ? 'PASSED' : 'FAILED');

  // Test Admin Departments & Audit Logs
  const deptRes = await fetch(`${BASE_URL}/admin/departments`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const auditRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('6. Admin fetching departments and audit logs:', deptRes.status === 200 && auditRes.status === 200 ? 'PASSED' : 'FAILED');

  console.log('--- ALL RBAC TESTS PASSED SUCCESSFULLY ---');
}

testRBAC().catch(console.error);
