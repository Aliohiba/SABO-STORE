import Database from 'better-sqlite3';

try {
    console.log('Opening database...');
    const db = new Database('sqlite.db');
    console.log('Database opened successfully.');
    const row = db.prepare('SELECT 1 as val').get();
    console.log('Query result:', row);
    db.close();
    console.log('Done.');
} catch (err) {
    console.error('Failed to use better-sqlite3:', err);
}
