import mongoose from 'mongoose';

// Connect to MongoDB
await mongoose.connect('mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO');

console.log('Connected to MongoDB');

// Delete all customers
const result = await mongoose.connection.db.collection('customers').deleteMany({});

console.log(`Deleted ${result.deletedCount} customers`);

// Close connection
await mongoose.connection.close();
console.log('Connection closed');
