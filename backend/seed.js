const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Medicine = require('./models/Medicine');
const Request = require('./models/Request');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding default administrator...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@medibridge.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'active',
        phone: '1234567890',
        address: 'MediBridge Headquarters',
      });
      console.log(`Default admin seeded successfully: ${adminEmail}`);
    } else {
      console.log(`Admin account already exists: ${adminEmail}`);
    }

    // You can add more initial mock data seeding here if needed in the future

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    
    console.log('Clearing database (Users, Medicines, Requests)...');
    await User.deleteMany();
    await Medicine.deleteMany();
    await Request.deleteMany();
    
    console.log('Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
