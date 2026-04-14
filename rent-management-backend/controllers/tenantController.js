import { Sequelize } from "sequelize";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

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
        { model: Building, as: "building", attributes: ["name"] },
        { model: Floor, as: "floor", attributes: ["floor_number"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    const cleaned = tenants.map((t) => {
      const json = t.toJSON();

      return {
        ...json,
        documents:
          typeof json.documents === "string"
            ? JSON.parse(json.documents)
            : Array.isArray(json.documents)
            ? json.documents
            : [],
        building: json.building || null,
        floor: json.floor || null,
        room: json.room || null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Tenants fetched successfully",
      count: cleaned.length,
      data: cleaned,
    });

  } catch (error) {
    console.error("GET TENANTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
      error: error.message,
    });
  }
};

/* =========================
   ADD TENANT
========================= */
export const addTenant = async (req, res) => {
  try {
    const { building_id, floor_id, room_id } = req.body;

    const existingTenant = await Tenant.findOne({
      where: {
        building_id: parseInt(building_id),
        floor_id: parseInt(floor_id),
        room_id: parseInt(room_id),
      },
    });

    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: "This room is already occupied",
      });
    }

    // Upload helper
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "tenants" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    let documents = [];

    if (req.files?.length > 0) {
      documents = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);
          return { url: result.secure_url };
        })
      );
    }

    const tenant = await Tenant.create({
      name: req.body.name,
      phone: req.body.phone,
      advance: parseFloat(req.body.advance),
      join_date: req.body.join_date,
      building_id: parseInt(building_id),
      floor_id: parseInt(floor_id),
      room_id: parseInt(room_id),
      documents,
    });

    return res.status(201).json({
      success: true,
      message: "Tenant added successfully",
      tenant,
    });

  } catch (error) {
    console.error("ADD TENANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add tenant",
      error: error.message,
    });
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
        success: false,
        message: "Tenant not found",
      });
    }

    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "tenants" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    let newDocs = [];

    if (req.files?.length > 0) {
      newDocs = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);
          return { url: result.secure_url };
        })
      );
    }

    await tenant.update({
      name: req.body.name,
      phone: req.body.phone,
      advance: parseFloat(req.body.advance),
      join_date: req.body.join_date,
      building_id: Number(req.body.building_id),
      floor_id: Number(req.body.floor_id),
      room_id: Number(req.body.room_id),
      documents: newDocs.length ? newDocs : tenant.documents,
    });

    const updatedTenant = await Tenant.findByPk(req.params.id, {
      include: [
        { model: Building, as: "building", attributes: ["name"] },
        { model: Floor, as: "floor", attributes: ["floor_number"] },
        { model: Room, as: "room", attributes: ["room_number"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      tenant: updatedTenant,
    });

  } catch (error) {
    console.error("UPDATE TENANT ERROR:", error);

    return res.status(500).json({
      success: false,
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
        success: false,
        message: "Tenant not found",
      });
    }

    const docs = Array.isArray(tenant.documents) ? tenant.documents : [];

    // Delete from Cloudinary
    for (const f of docs) {
      if (!f?.url) continue;

      try {
        const parts = f.url.split("/");
        const fileName = parts.pop();
        const folder = parts.pop();
        const publicId = `${folder}/${fileName.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn("Cloudinary delete warning:", err.message);
      }
    }

    await tenant.destroy();

    return res.status(200).json({
      success: true,
      message: "Tenant deleted successfully",
    });

  } catch (error) {
    console.error("DELETE TENANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete tenant",
      error: error.message,
    });
  }
};
