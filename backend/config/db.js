import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // .env file se MONGO_URI link le rahe hain
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`❌ Error in MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;