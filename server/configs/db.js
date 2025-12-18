import mongoose from "mongoose";

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Database connected successfully');
        });
        let mongodbURI = process.env.MONGODB_URI;
        const projectName ='resume-builder';
        if(!mongodbURI) {
            console.error('❌ MONGODB_URI environment variable is not set');
            console.error('📝 Please create a .env file in the server folder with your MongoDB connection string');
            console.error('📋 See .env.example for the format');
            throw new Error('MONGODB_URI environment variable is not set');
        }
        if(mongodbURI.includes('username') || mongodbURI.includes('password') || mongodbURI.includes('xxxxx')) {
            console.error('❌ MONGODB_URI appears to be a template. Please replace with your actual connection string');
            throw new Error('MONGODB_URI is not configured properly');
        }
        if(mongodbURI.endsWith('/')) {
            mongodbURI = mongodbURI.slice(0, -1);
        }
        console.log('🔌 Attempting to connect to MongoDB...');
        await mongoose.connect(`${mongodbURI}/${projectName}`);
    } catch(error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        if(error.message.includes('authentication failed')) {
            console.error('💡 Authentication failed. Please check:');
            console.error('   1. Your database username and password in the connection string');
            console.error('   2. That the database user exists in MongoDB Atlas (Database Access)');
            console.error('   3. That your IP address is whitelisted (Network Access)');
            console.error('   4. That special characters in password are URL-encoded (e.g., @ becomes %40)');
        }
        process.exit(1);
    }
};
export default connectDB;