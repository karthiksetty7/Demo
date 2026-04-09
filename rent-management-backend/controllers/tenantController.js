import Tenant from '../models/Tenant.js';
import fs from 'fs';
import path from 'path';


// GET TENANTS
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      include: ['building', 'floor', 'room']
    });

    res.json(tenants);

  } catch (error) {
    console.error("GET TENANTS ERROR:", error);
    res.status(500).json({
      message: "Error fetching tenants",
      error: error.message
    });
  }
};


// ADD TENANT
export const addTenant = async (req, res) => {
  try {
    const documents = req.files?.map(
      f => ({ url: `/uploads/tenants/${f.filename}` })
    ) || [];

    const tenant = await Tenant.create({
      ...req.body,
      documents
    });

    res.json(tenant);

  } catch (error) {
    console.error("ADD TENANT ERROR:", error);
    res.status(500).json({
      message: "Error adding tenant",
      error: error.message
    });
  }
};


// UPDATE TENANT
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const newDocuments = req.files?.map(
      f => ({ url: `/uploads/tenants/${f.filename}` })
    ) || [];

    await tenant.update({
      ...req.body,
      documents: [...(tenant.documents || []), ...newDocuments]
    });

    res.json(tenant);

  } catch (err) {
    console.error('Error updating tenant:', err);
    res.status(500).json({ message: 'Failed to update tenant' });
  }
};


// DELETE TENANT
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    tenant.documents?.forEach(f => {
      const filePath = path.join(
        'uploads/tenants',
        f.url.split('/').pop()
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await tenant.destroy();

    res.json({ message: 'Tenant deleted' });

  } catch (err) {
    console.error('Error deleting tenant:', err);
    res.status(500).json({ message: 'Failed to delete tenant' });
  }
};
