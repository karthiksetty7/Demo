import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Root route (REQUIRED for Railway)
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);

// ✅ Start server ONLY after DB is ready
const startServer = async () => {
  try {
    console.log('Starting server...');

    await connectDB();        // wait for DB
    await sequelize.sync();   // wait for tables

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server failed:', err);
  }
};

startServer();

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({ error: err.message });
});