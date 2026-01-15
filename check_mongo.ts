import mongoose from 'mongoose';

async function check() {
    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect('mongodb+srv://aliohiba7:Ali15101996ohiba@sabo.x3bbofa.mongodb.net/?appName=SABO', { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB!');
        console.log('State:', mongoose.connection.readyState);
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    }
}

check();
