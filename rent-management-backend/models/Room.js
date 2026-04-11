import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js';
import Floor from './Floor.js';

const Room = sequelize.define(
  'Room',
  {
    room_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    floor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Rooms',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,

    // ✅ IMPORTANT: enforce uniqueness at ORM level
    indexes: [
      {
        unique: true,
        fields: ['building_id', 'floor_id', 'room_number'],
        name: 'unique_room_per_floor',
      },
    ],
  }
);

// =========================
// Associations
// =========================
Room.belongsTo(Building, {
  foreignKey: 'building_id',
  as: 'building',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Room.belongsTo(Floor, {
  foreignKey: 'floor_id',
  as: 'floor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default Room;
