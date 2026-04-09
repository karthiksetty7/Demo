import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js';
import Floor from './Floor.js';
import Room from './Room.js';

const Tenant = sequelize.define(
  'Tenant',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    advance: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    joining_date: { type: DataTypes.DATE, allowNull: false },

    building_id: { type: DataTypes.INTEGER, allowNull: false },
    floor_id: { type: DataTypes.INTEGER, allowNull: false },
    room_id: { type: DataTypes.INTEGER, allowNull: false },

    files: { type: DataTypes.JSON, defaultValue: [] }, // store uploaded image info
  },
  {
    tableName: 'Tenants',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Relations
Tenant.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Tenant.belongsTo(Floor, { foreignKey: 'floor_id', as: 'floor' });
Tenant.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

export default Tenant;
