// This script merges darb_tripoli.json with additional city data
// Run: node server/scripts/merge_darb_data.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRIPOLI_FILE = path.resolve(__dirname, '../data/darb_tripoli.json');
const OUTPUT_FILE = path.resolve(__dirname, '../data/darb_all_cities.json');

// Read existing Tripoli data
const tripoliData = JSON.parse(fs.readFileSync(TRIPOLI_FILE, 'utf-8'));

// Additional cities data - PASTE THE REST OF YOUR DATA HERE
// Copy all the data from the message starting with "المنطقة الشرقية 2" 
const additionalData = [
    // PASTE YOUR DATA HERE - THE ARRAY SHOULD START HERE
    // Example format:
    // {
    //   "branchId": "المنطقة الشرقية 2",
    //   "node": "المرج 35",
    //   ...
    // },
];

// Merge the arrays
const allData = [...tripoliData, ...additionalData];

// Write to output file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2), 'utf-8');

console.log(`✅ Merged ${tripoliData.length} Tripoli records + ${additionalData.length} other cities`);
console.log(`✅ Total: ${allData.length} records written to ${OUTPUT_FILE}`);
console.log('\nNext step: Run migration script:');
console.log('npx tsx server/scripts/migrate_darb_data.ts');
