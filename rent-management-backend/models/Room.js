import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js';
import Floor from './Floor.js';

const Room = sequelize.define(
  'Room',
  {
    room_number: { type: DataTypes.STRING, allowNull: false },
    building_id: { type: DataTypes.INTEGER, allowNull: false },
    floor_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'Rooms',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // optional: no updatedAt
  }
);

// Associations
Room.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Room.belongsTo(Floor, { foreignKey: 'floor_id', as: 'floor' });

export default Room;