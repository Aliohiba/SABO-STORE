import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Merging Darb Sabil data files...\n');

// Read files
const tripoli = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/darb_tripoli.json'), 'utf-8'));
const others = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/darb_other_cities.json'), 'utf-8'));

// Merge
const merged = [...tripoli, ...others];

// Write
const outputPath = path.resolve(__dirname, '../data/darb_all_cities.json');
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');

console.log(`✅ Tripoli records: ${tripoli.length}`);
console.log(`✅ Other cities: ${others.length}`);
console.log(`✅ Total merged: ${merged.length}`);
console.log(`✅ Output: ${outputPath}\n`);
