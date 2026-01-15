
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../client/src/locales/ar.json');

try {
    const raw = fs.readFileSync(filePath, 'utf8');
    JSON.parse(raw);
    console.log("JSON is Valid");
} catch (e) {
    console.error("JSON Error:", e.message);
}
