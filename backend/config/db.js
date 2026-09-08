const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.USE_LOCAL_DB === 'true') {
    console.log('🚀 Running with built-in persistent local database (backend/data/db.json).');
    return;
  }

  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/medibridge';
    console.log(`Checking MongoDB connection at: ${connStr}...`);
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('ℹ️ Local MongoDB service is not running.');
    console.log('🚀 Seamlessly running with built-in persistent local database (backend/data/db.json).');
    console.log('💡 Note: The app is fully functional. To use MongoDB, set a cloud MONGO_URI in backend/.env or start MongoDB locally.');
  }
};

module.exports = connectDB;
