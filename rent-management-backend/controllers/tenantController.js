import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

import Tenant from "../models/Tenant.js";
import Building from "../models/Building.js";
import Floor from "../models/Floor.js";
import Room from "../models/Room.js";

/* =========================
   GET ALL TENANTS
========================= */
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      order: [["id", "DESC"]],
      include: [
        {
          model: Building,
          as: "building",
          attributes: ["name"],
        },
        {
          model: Floor,
          as: "floor",
          attributes: ["floor_number"],
        },
        {
          model: Room,
          as: "room",
          attributes: ["room_number"],
        },
      ],
    });

    // CLEAN RESPONSE (VERY IMPORTANT FIX)
    const cleaned = tenants.map((t) => {
      const json = t.toJSON();

      return {
        ...json,
        documents: Array.isArray(json.documents) ? json.documents : [],
        building: json.building || null,
        floor: json.floor || null,
        room: json.room || null,
      };
    });

    res.json(cleaned);
  } catch (error) {
    console.error("GET TENANTS ERROR:", error);
    res.status(500).json({
      message: "Error fetching tenants",
      error: error.message,
    });
  }
};

/* =========================
   ADD TENANT
========================= */
export const addTenant = async (req, res) => {
  try {
    const documents =
      req.files?.map((f) => ({
        url: `/uploads/tenants/${f.filename}`,
      })) || [];

    const tenant = await Tenant.create({
      ...req.body,
      documents,
    });

    const fullTenant = await Tenant.findByPk(tenant.id, {
      include: [
        { model: Building, as: "building", attributes: ["name"] },
        { model: Floor, as: "floor", attributes: ["floor_number"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    res.status(201).json(fullTenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE TENANT
========================= */
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    const newDocs =
      req.files?.map((f) => ({
        url: `/uploads/tenants/${f.filename}`,
      })) || [];

    await tenant.update({
      ...req.body,
      documents: newDocs.length ? newDocs : tenant.documents,
    });

    // ✅ reload tenant with associations
    const updatedTenant = await Tenant.findByPk(req.params.id, {
      include: [
        { model: Building, as: "building", attributes: ["name"] },
        { model: Floor, as: "floor", attributes: ["floor_number"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    // ✅ send tenant directly (not wrapped)
    res.json(updatedTenant);

  } catch (error) {
    console.error("UPDATE TENANT ERROR:", error);

    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({
        message: error.errors.map((e) => e.message).join(", "),
      });
    }

    res.status(500).json({
      message: "Failed to update tenant",
      error: error.message,
    });
  }
};

/* =========================
   DELETE TENANT
========================= */
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        message: "Tenant not found",
      });
    }

    // ✅ ensure documents is array
    const docs = Array.isArray(tenant.documents)
      ? tenant.documents
      : [];

    // ✅ delete uploaded files safely
    for (const f of docs) {
      if (!f?.url) continue;

      const filePath = path.join(
        process.cwd(),
        "uploads",
        "tenants",
        f.url.split("/").pop()
      );

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn("File delete warning:", err.message);
      }
    }

    await tenant.destroy();

    res.json({
      message: "Tenant deleted successfully",
    });

  } catch (error) {
    console.error("DELETE TENANT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete tenant",
      error: error.message,
    });
  }
};
