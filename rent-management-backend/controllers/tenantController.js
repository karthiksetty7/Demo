import Tenant from '../models/Tenant.js';
import Building from '../models/Building.js';
import Floor from '../models/Floor.js';
import Room from '../models/Room.js';

// GET
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      include: [
        { model: Building, as: 'building', attributes: ['name'] },
        { model: Floor, as: 'floor', attributes: ['floor_number'] },
        { model: Room, as: 'room', attributes: ['room_number'] },
      ],
      order: [['id', 'DESC']],
    });

    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD
export const addTenant = async (req, res) => {
  try {
    const files = req.files?.map(f => f.filename) || [];

    const tenant = await Tenant.create({
      ...req.body,
      documents: files,
    });

    res.json({ tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id);
    if (!tenant) return res.status(404).json({ message: 'Not found' });

    const files = req.files?.map(f => f.filename);

    await tenant.update({
      ...req.body,
      documents: files?.length ? files : tenant.documents,
    });

    res.json({ tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteTenant = async (req, res) => {
  await Tenant.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
};
