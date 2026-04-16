import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import buildingRoutes from './routes/buildingRoutes.js';
import floorRoutes from './routes/floorRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import rentEntryRoutes from "./routes/rentRoutes.js";
import billRoutes from "./routes/billRoutes.js";

import { connectDB, sequelize } from './config/db.js';

import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

console.log("🔥 SERVER STARTED");

// =========================
// ✅ CORS (FINAL PRODUCTION READY)
// =========================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "https://demo-production-bf0f.up.railway.app",

  // ✅ Your Vercel Frontend
  "https://demo-lilac-three-77.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin || // allow Postman / mobile apps
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") // ✅ allow all Vercel deployments
    ) {
      callback(null, true);
    } else {
      callback(new Error("❌ CORS blocked for origin: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// =========================
// BODY PARSER
// =========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =========================
// UPLOAD FOLDER
// =========================
const uploadsPath = path.join(process.cwd(), 'uploads');
const tenantsPath = path.join(uploadsPath, 'tenants');

if (!fs.existsSync(tenantsPath)) {
  fs.mkdirSync(tenantsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

// =========================
// HEALTH CHECK
// =========================
app.get('/', (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// =========================
// ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use("/api/rent", rentEntryRoutes);
app.use("/api/bills", billRoutes);

// =========================
// GLOBAL ERROR HANDLER (NEW)
// =========================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

// =========================
// START SERVER
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
