import Tenant from '../models/Tenant.js';
import fs from 'fs';
import path from 'path';

export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tenants" });
  }
};

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
    res.status(500).json({ message: "Error adding tenant" });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant)
      return res.status(404).json({ message: 'Tenant not found' });

    // new uploaded files
    const newDocs = req.files?.map(
      f => ({ url: `/uploads/tenants/${f.filename}` })
    ) || [];

    await tenant.update({
      ...req.body,
      // replace old documents completely
      documents: newDocs.length ? newDocs : tenant.documents
    });

    res.json(tenant);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update tenant' });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id);

    if (!tenant)
      return res.status(404).json({ message: 'Tenant not found' });

    tenant.documents?.forEach(f => {
      const filePath = path.join(
        process.cwd(),
        'uploads/tenants',
        f.url.split('/').pop()
      );

      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    });

    await tenant.destroy();

    res.json({ message: 'Tenant deleted' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tenant' });
  }
};
