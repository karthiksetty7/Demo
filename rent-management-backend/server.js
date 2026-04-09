import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import floorRoutes from './routes/floorRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import { connectDB, sequelize } from './config/db.js';

dotenv.config();
const app = express();

// Updated CORS config
app.use(cors({
  origin: ["null", "http://localhost:3000"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"], // ✅ added 'Authorization'
  credentials: true // optional, if we use cookies
}));

app.use(express.json());
app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/tenants', tenantRoutes);


const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server failed:', err);
  }
};

startServer();
