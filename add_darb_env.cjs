// Script to add Darb Sabil environment variables to .env file
// Usage: node add_darb_env.cjs

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const darbEnvVars = `
# Darb Sabil API Configuration
DARB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NjIxYTg4NzczOGU4MTA1ZmE2MmY3NiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2ODAzNzAwMH0.TvQVlYbX2hGUgYoQ4XzcP__55GsIy_DbKVbjdrtbu58
DARB_ACCOUNT_ID=67a4cf7a59bfb31e4a6560cb
DARB_BASE_URL=https://v2.sabil.ly
`;

try {
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found. Creating new one...');
        fs.writeFileSync(envPath, darbEnvVars.trim() + '\n');
        console.log('✅ Created .env file with Darb Sabil configuration');
        process.exit(0);
    }

    // Read existing .env
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if Darb vars already exist
    if (envContent.includes('DARB_API_KEY')) {
        console.log('⚠️  Darb Sabil configuration already exists in .env');
        console.log('🔄 Updating existing configuration...');

        // Update existing DARB_API_KEY
        envContent = envContent.replace(
            /DARB_API_KEY=.*/,
            'DARB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJzZWNyZXRJZCI6IjY5NjIxYTg4NzczOGU4MTA1ZmE2MmY3NiIsInN1YiI6Im9hdXRoX3NlY3JldCIsImlzcyI6IkRhcmIgQXNzYWJpbCIsImF1ZCI6IkRhcmIgQXNzYWJpbCIsImlhdCI6MTc2ODAzNzAwMH0.TvQVlYbX2hGUgYoQ4XzcP__55GsIy_DbKVbjdrtbu58'
        );

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated DARB_API_KEY successfully');
        process.exit(0);
    }

    // Append Darb vars
    envContent += '\n' + darbEnvVars;
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Successfully added Darb Sabil configuration to .env');
    console.log('');
    console.log('Added variables:');
    console.log('  - DARB_API_KEY (Updated)');
    console.log('  - DARB_ACCOUNT_ID');
    console.log('  - DARB_BASE_URL');
    console.log('');
    console.log('🔄 Please restart your server for changes to take effect');
    console.log('   npm run dev');

} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    console.error('');
    console.error('Please manually add these lines to your .env file:');
    console.log(darbEnvVars);
    process.exit(1);
}
