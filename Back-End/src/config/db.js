import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(`Error connect to MongoDB: ${error.message}`);
        process.exit(1);
    }
}
export default connectDB;