import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        
        // Add connection options for better reliability
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Don't exit process - let server continue running
        // Health check will show DB status
        throw error;
    }
}
export default connectDB;