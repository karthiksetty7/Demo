import Room from '../models/Room.js';
import Building from '../models/Building.js';
import Floor from '../models/Floor.js';

// GET all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        { model: Building, as: 'building', attributes: ['name'] },
        { model: Floor, as: 'floor', attributes: ['floor_number'] },
      ],
      order: [['id', 'DESC']],
    });

    res.json(rooms);

  } catch (err) {
    return res.status(500).json({
      message: 'Failed to fetch rooms'
    });
  }
};

// POST add a new room
export const addRoom = async (req, res) => {
  const { building_id, floor_id, room_number } = req.body;

  try {
    const room = await Room.create({ building_id, floor_id, room_number });

    const newRoom = await Room.findByPk(room.id, {
      include: [
        { model: Building, as: 'building', attributes: ['name'] },
        { model: Floor, as: 'floor', attributes: ['floor_number'] },
      ],
    });

    return res.json({
      message: 'Room added successfully',
      room: newRoom
    });

  } catch (err) {

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Room already exists in this floor'
      });
    }

    return res.status(500).json({
      message: 'Failed to add room'
    });
  }
};

// PUT update room
export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { building_id, floor_id, room_number } = req.body;

  try {
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    room.building_id = building_id;
    room.floor_id = floor_id;
    room.room_number = room_number;

    await room.save();

    const updatedRoom = await Room.findByPk(id, {
      include: [
        { model: Building, as: 'building', attributes: ['name'] },
        { model: Floor, as: 'floor', attributes: ['floor_number'] },
      ],
    });

    return res.json({
      message: 'Room updated successfully',
      room: updatedRoom
    });

  } catch (err) {

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Room already exists in this floor'
      });
    }

    return res.status(500).json({
      message: 'Failed to update room'
    });
  }
};

// DELETE room
export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await Room.findByPk(id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    await room.destroy();

    return res.json({
      message: 'Room deleted successfully'
    });

  } catch (err) {
    return res.status(500).json({
      message: 'Failed to delete room'
    });
  }
};