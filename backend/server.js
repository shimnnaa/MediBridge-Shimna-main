const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For local dev, allow any origin. Can restrict in production.
  credentials: true,
}));
app.use(express.json());

// Seeding function for default admin
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@medibridge.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('No administrator found. Seeding default admin account...');
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'active',
        phone: '1234567890',
        address: 'MediBridge Headquarters',
      });
      console.log(`Default admin seeded. Log in with: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    } else {
      console.log(`Admin account verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

// Seed admin right after database connection is established
seedAdmin();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('MediBridge API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
