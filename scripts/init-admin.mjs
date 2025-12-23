import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function initAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Check if admin user already exists
    const [rows] = await connection.execute(
      'SELECT * FROM adminUsers WHERE username = ?',
      ['admin']
    );

    if (rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    await connection.execute(
      'INSERT INTO adminUsers (username, passwordHash, email, name, isActive) VALUES (?, ?, ?, ?, ?)',
      ['admin', hashedPassword, 'admin@sabostore.com', 'Admin', true]
    );

    console.log('Admin user created successfully with username: admin and password: admin123');
  } catch (error) {
    console.error('Error initializing admin:', error);
  } finally {
    await connection.end();
  }
}

initAdmin();
