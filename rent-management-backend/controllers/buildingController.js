import Building from '../models/Building.js';

// Get all buildings
export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll({ order: [['id', 'DESC']] });
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Add building
export const addBuilding = async (req, res) => {
  const { name, address } = req.body;
  try {
    const building = await Building.create({ name, address });
    res.json({ message: 'Building added successfully', building });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete building
export const deleteBuilding = async (req, res) => {
  const { id } = req.params;
  try {
    await Building.destroy({ where: { id } });
    res.json({ message: 'Building deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update building
export const updateBuilding = async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  try {
    const building = await Building.findByPk(id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    building.name = name || building.name;
    building.address = address || building.address;

    await building.save();

    res.json({ message: 'Building updated successfully', building });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
