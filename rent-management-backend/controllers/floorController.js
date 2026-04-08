import Floor from '../models/Floor.js';
import Building from '../models/Building.js';

export const getFloors = async (req, res) => {
  try {
    const floors = await Floor.findAll({
      include: { model: Building, as: 'building', attributes: ['name'] },
    });
    res.json(floors);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const addFloor = async (req, res) => {
  const { building_id, floor_number } = req.body;
  try {
    const floor = await Floor.create({ building_id, floor_number });
    res.json({ message: 'Floor added successfully', floor });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updateFloor = async (req, res) => {
  const { id } = req.params;
  const { building_id, floor_number } = req.body;

  try {
    const floor = await Floor.findByPk(id);
    if (!floor) return res.status(404).json({ message: 'Floor not found' });

    floor.building_id = building_id;
    floor.floor_number = floor_number;
    await floor.save();

    res.json({ message: 'Floor updated successfully', floor });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteFloor = async (req, res) => {
  const { id } = req.params;

  try {
    const floor = await Floor.findByPk(id);
    if (!floor) return res.status(404).json({ message: 'Floor not found' });

    await floor.destroy();
    res.json({ message: 'Floor deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getFloorsByBuilding = async (req, res) => {
  const { buildingId } = req.params;
  try {
    const floors = await Floor.findAll({
      where: { building_id: buildingId },
    });
    res.json(floors);
  } catch (err) {
    res.status(500).json(err);
  }
};
