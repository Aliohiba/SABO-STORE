import mongoose from 'mongoose';

async function check() {
    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect('mongodb://localhost:27017/online_store', { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB!');
        console.log('State:', mongoose.connection.readyState);
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

check();
