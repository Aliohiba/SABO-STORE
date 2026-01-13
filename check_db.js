import mysql from 'mysql2/promise';

async function check() {
    console.log('Attempting to connect to MySQL at 127.0.0.1...');
    try {
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'password',
        });
        console.log('Connected to MySQL server!');
        await connection.end();
    } catch (err) {
        console.log('Failed to connect to MySQL error object:', err);
        console.log('Failed to connect to MySQL message:', err.message);
        console.log('Failed to connect to MySQL code:', err.code);
    }
}

check();
