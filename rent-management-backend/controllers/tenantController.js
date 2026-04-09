import Tenant from '../models/Tenant.js';
import Building from '../models/Building.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';
import fs from 'fs';
import path from 'path';

// GET
export const getTenants = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Tenants");

    const tenants = rows.map(t => ({
      ...t,
      documents: t.documents ? JSON.parse(t.documents) : []
    }));

    res.json(tenants);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tenants" });
  }
};

// ADD
export const addTenant = async (req, res) => {
  try {
    const {
      building_id,
      floor_id,
      room_id,
      name,
      phone,
      join_date,
      advance
    } = req.body;

    // insert tenant first
    const [result] = await db.query(
      `INSERT INTO Tenants 
      (building_id, floor_id, room_id, name, phone, join_date, advance)
      VALUES (?,?,?,?,?,?,?)`,
      [building_id, floor_id, room_id, name, phone, join_date, advance]
    );

    const tenantId = result.insertId;

    // collect file paths
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map(
        file => `/uploads/tenants/${file.filename}`
      );
    }

    // store in DB
    await db.query(
      "UPDATE Tenants SET documents=? WHERE id=?",
      [JSON.stringify(documents), tenantId]
    );

    res.json({
      id: tenantId,
      ...req.body,
      documents
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding tenant" });
  }
};

// UPDATE
export const updateTenant = async (req, res) => {
  try {
    const { name, phone, advance, join_date, building_id, floor_id, room_id } = req.body;

    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const newDocuments = req.files?.map(f => ({ url: `/uploads/tenants/${f.filename}` })) || [];

    tenant.name = name;
    tenant.phone = phone;
    tenant.advance = advance;
    tenant.join_date = join_date;
    tenant.building_id = building_id;
    tenant.floor_id = floor_id;
    tenant.room_id = room_id;
    tenant.documents = [...(tenant.documents || []), ...newDocuments];

    await tenant.save();
    res.json(tenant);
  } catch (err) {
    console.error('Error updating tenant:', err);
    res.status(500).json({ message: 'Failed to update tenant' });
  }
};

// DELETE
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    tenant.documents.forEach(f => {
      const filePath = path.join('uploads/tenants', f.url.split('/').pop());
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await tenant.destroy();
    res.json({ message: 'Tenant deleted' });
  } catch (err) {
    console.error('Error deleting tenant:', err);
    res.status(500).json({ message: 'Failed to delete tenant' });
  }
};
