// Script to add WhatsApp environment variables to .env file
// Usage: node add_whatsapp_env.cjs

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const whatsappEnvVars = `
# WhatsApp API Configuration - SMS Mobile API
WHATSAPP_API_KEY=ba56c204a8efb9ac88ae2a4c4b298d745f347323a66be590
WHATSAPP_ACCOUNT_ID=617a2b
WHATSAPP_ACCOUNT_LICENCE=335229047
WHATSAPP_BASE_URL=https://api.smsmobileapi.com
`;

try {
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found. Creating new one...');
        fs.writeFileSync(envPath, whatsappEnvVars.trim() + '\n');
        console.log('✅ Created .env file with WhatsApp configuration');
        process.exit(0);
    }

    // Read existing .env
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if WhatsApp vars already exist
    if (envContent.includes('WHATSAPP_API_KEY')) {
        console.log('⚠️  WhatsApp configuration already exists in .env');
        console.log('📝 Please update manually if needed.');
        process.exit(0);
    }

    // Append WhatsApp vars
    envContent += '\n' + whatsappEnvVars;
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Successfully added WhatsApp configuration to .env');
    console.log('');
    console.log('Added variables:');
    console.log('  - WHATSAPP_API_KEY');
    console.log('  - WHATSAPP_ACCOUNT_ID');
    console.log('  - WHATSAPP_ACCOUNT_LICENCE');
    console.log('  - WHATSAPP_BASE_URL');
    console.log('');
    console.log('🔄 Please restart your server for changes to take effect');
    console.log('   npm run dev');

} catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    console.error('');
    console.error('Please manually add these lines to your .env file:');
    console.log(whatsappEnvVars);
    process.exit(1);
}
