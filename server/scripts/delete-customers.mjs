import mongoose from 'mongoose';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/online_store');

console.log('Connected to MongoDB');

// Delete all customers
const result = await mongoose.connection.db.collection('customers').deleteMany({});

console.log(`Deleted ${result.deletedCount} customers`);

// Close connection
await mongoose.connection.close();
console.log('Connection closed');
