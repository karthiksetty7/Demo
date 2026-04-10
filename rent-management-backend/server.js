import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import floorRoutes from './routes/floorRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import rentEntryRoutes from "./routes/rentRoutes.js";

import { connectDB, sequelize } from './config/db.js';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

// --------------------
// Upload folder setup
// --------------------
const uploadsPath = path.join(process.cwd(), 'uploads');
const tenantsPath = path.join(uploadsPath, 'tenants');

if (!fs.existsSync(tenantsPath)) {
  fs.mkdirSync(tenantsPath, { recursive: true });
}

// --------------------
// CORS config
// --------------------
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// IMPORTANT: handle preflight BEFORE routes
app.options("*", cors(corsOptions));

app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
// --------------------
// Start Server
// --------------------
const startServer = async () => {
  try {
    await connectDB();

    // ✅ SAFE: DO NOT USE alter:true
    await sequelize.sync();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error('❌ Server failed:', err);
  }
};

startServer();
