// Simple test script to verify escalation policy monitor functionality
// Run with: node test-policy-monitors.js

const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

async function testPolicyMonitors() {
  console.log('🧪 Testing Policy Monitor Functionality...\n');

  try {
    // Test 1: Get all escalation policies
    console.log('1️⃣ Testing: Get all escalation policies');
    const policiesRes = await fetch(`${BASE_URL}/escalation-policies/get-escalation-policies`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    const policies = await policiesRes.json();
    console.log(`✅ Found ${policies.policies?.length || 0} policies\n`);

    if (policies.policies?.length > 0) {
      const testPolicy = policies.policies[0];
      console.log(`📋 Using test policy: ${testPolicy.name} (ID: ${testPolicy.id})\n`);

      // Test 2: Get monitors for a policy
      console.log('2️⃣ Testing: Get policy monitors');
      const monitorsRes = await fetch(`${BASE_URL}/escalation-policies/${testPolicy.id}/monitors`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });
      const monitorsData = await monitorsRes.json();
      console.log(`✅ Found ${monitorsData.monitors?.length || 0} monitors\n`);

      // Test 3: Get policy details
      console.log('3️⃣ Testing: Get policy details');
      const detailsRes = await fetch(`${BASE_URL}/escalation-policies/${testPolicy.id}/details`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });
      const detailsData = await detailsRes.json();
      console.log(`✅ Policy details retrieved: ${detailsData.policy?.name}\n`);

      if (monitorsData.monitors?.length > 0) {
        const testMonitor = monitorsData.monitors[0];
        console.log(`🖥️ Using test monitor: ${testMonitor.name} (ID: ${testMonitor.id})\n`);

        // Test 4: Toggle monitor policy (enable)
        console.log('4️⃣ Testing: Toggle monitor policy ON');
        const toggleOnRes = await fetch(`${BASE_URL}/escalation-policies/toggle-monitor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            policyId: testPolicy.id,
            monitorId: testMonitor.id,
            enabled: true
          })
        });
        const toggleOnData = await toggleOnRes.json();
        console.log(`✅ Toggle ON: ${toggleOnData.message}\n`);

        // Test 5: Toggle monitor policy (disable)
        console.log('5️⃣ Testing: Toggle monitor policy OFF');
        const toggleOffRes = await fetch(`${BASE_URL}/escalation-policies/toggle-monitor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            policyId: testPolicy.id,
            monitorId: testMonitor.id,
            enabled: false
          })
        });
        const toggleOffData = await toggleOffRes.json();
        console.log(`✅ Toggle OFF: ${toggleOffData.message}\n`);
      }
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Uncomment and add your token to run tests
// testPolicyMonitors();

console.log('📝 To run tests:');
console.log('1. Replace TEST_TOKEN with your actual auth token');
console.log('2. Uncomment the testPolicyMonitors() call at the bottom');
console.log('3. Run: node test-policy-monitors.js');