const jwt = require('jsonwebtoken');

const testToken = jwt.sign(
  {
    email: 'test@example.com',
    organizationId: 'test-org-id',
    role: 'Member'
  },
  'supersecretinvitationkey'
);

console.log('=== TEST INVITATION LINK ===');
console.log(`http://localhost:3000/accept-invitation?token=${testToken}`);
console.log('');
console.log('Copy the above URL and paste it in your browser to test the invitation flow.');
console.log('');
console.log('Token only:');
console.log(testToken);
