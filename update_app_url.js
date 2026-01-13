import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Update APP_URL
    if (content.includes('APP_URL=')) {
        content = content.replace(/APP_URL=.*/g, 'APP_URL=http://localhost:5000');
    } else {
        content += '\nAPP_URL=http://localhost:5000\n';
    }

    fs.writeFileSync(envPath, content);
    console.log('✅ Updated APP_URL in .env to http://localhost:5000');
} catch (err) {
    console.error('Error updating .env:', err);
}
