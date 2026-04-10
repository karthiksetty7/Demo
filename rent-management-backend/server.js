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


// =========================
// 1. CORS (MUST BE FIRST)
// =========================
const corsOptions = {
  origin: [
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// =========================
// 2. BODY PARSER
// =========================
app.use(express.json());


// =========================
// 3. UPLOAD FOLDERS
// =========================
const uploadsPath = path.join(process.cwd(), 'uploads');
const tenantsPath = path.join(uploadsPath, 'tenants');

if (!fs.existsSync(tenantsPath)) {
  fs.mkdirSync(tenantsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));


// =========================
// 4. HEALTH CHECK ROUTE
// =========================
app.get('/', (req, res) => {
  res.json({ message: "API is running 🚀" });
});


// =========================
// 5. ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use("/api/rent", rentEntryRoutes);


// =========================
// 6. START SERVER
// =========================
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server failed:', err);
  }
};

startServer();
