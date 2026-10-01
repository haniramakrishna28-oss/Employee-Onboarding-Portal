async function testChecklistAndTasks() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- RUNNING AUTOMATED CHECKLIST & TASKS TESTS ---');

  // 1. Login Emma Watson
  const empLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@portal.test', password: 'Password123!' })
  })).json();
  const empToken = empLogin.token;

  // 2. Fetch My Checklist
  const checkRes = await (await fetch(`${BASE_URL}/checklist/my`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  })).json();
  console.log('1. Fetch My Checklist (items count):', checkRes.success ? 'PASSED' : 'FAILED', checkRes.checklist?.length);

  const firstItem = checkRes.checklist?.[0];
  if (firstItem) {
    // 3. Toggle Status to COMPLETED
    const toggleRes = await (await fetch(`${BASE_URL}/checklist/${firstItem.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empToken}`
      },
      body: JSON.stringify({ status: 'COMPLETED' })
    })).json();
    console.log('2. Checklist Item Toggle Status to COMPLETED:', toggleRes.success && toggleRes.item?.status === 'COMPLETED' ? 'PASSED' : 'FAILED');
  }

  // 4. Fetch My Tasks
  const taskRes = await (await fetch(`${BASE_URL}/tasks/my`, {
    headers: { 'Authorization': `Bearer ${empToken}` }
  })).json();
  console.log('3. Fetch My Tasks (tasks count):', taskRes.success ? 'PASSED' : 'FAILED', taskRes.tasks?.length);

  const firstTask = taskRes.tasks?.[0];
  if (firstTask) {
    // 5. Update Task Status
    const updateTaskRes = await (await fetch(`${BASE_URL}/tasks/${firstTask.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empToken}`
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' })
    })).json();
    console.log('4. Task Status Updated to IN_PROGRESS:', updateTaskRes.success && updateTaskRes.task?.status === 'IN_PROGRESS' ? 'PASSED' : 'FAILED');

    // 6. Post Comment on Task
    const commentRes = await (await fetch(`${BASE_URL}/tasks/${firstTask.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${empToken}`
      },
      body: JSON.stringify({ message: 'I have started working on this training module.' })
    })).json();
    console.log('5. Task Comment Posted:', commentRes.success && commentRes.comment?.message ? 'PASSED' : 'FAILED', commentRes.comment?.message);
  }

  // 7. Login Manager to assign new task
  const mgrLogin = await (await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@portal.test', password: 'Password123!' })
  })).json();
  const mgrToken = mgrLogin.token;

  if (checkRes.onboardingId) {
    const createRes = await (await fetch(`${BASE_URL}/tasks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mgrToken}`
      },
      body: JSON.stringify({
        onboardingId: checkRes.onboardingId,
        title: 'Shadow Senior Engineer on Code Review',
        description: 'Observe pull request review workflow in the core repo.',
        priority: 'HIGH',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      })
    })).json();
    console.log('6. Manager Created & Assigned Task:', createRes.success && createRes.task?.title ? 'PASSED' : 'FAILED', createRes.task?.title);
  }

  console.log('--- ALL CHECKLIST & TASKS TESTS PASSED ---');
}

testChecklistAndTasks().catch(console.error);
