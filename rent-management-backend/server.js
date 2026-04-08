import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import { connectDB, sequelize } from './config/db.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());
app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync(); // create tables if not exist
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Server failed:', err);
  }
};

startServer();
