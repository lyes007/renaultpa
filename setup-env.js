const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/renault_pa"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="7b11d647da908c022ffa2024ea422b03cae98fff16b83cc1e421f7b40f918eb9"

# Google OAuth (You need to set these)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Debug
NEXTAUTH_DEBUG=true
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created!');
  console.log('⚠️  Please update the following variables:');
  console.log('   - DATABASE_URL: Your PostgreSQL connection string');
  console.log('   - GOOGLE_CLIENT_ID: Your Google OAuth Client ID');
  console.log('   - GOOGLE_CLIENT_SECRET: Your Google OAuth Client Secret');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n🔧 To fix authentication issues:');
console.log('1. Update your .env.local file with correct values');
console.log('2. Restart your development server: npm run dev');
console.log('3. Clear browser cookies and try signing in again');
