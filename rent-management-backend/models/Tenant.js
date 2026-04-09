import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js';
import Floor from './Floor.js';
import Room from './Room.js';

const Tenant = sequelize.define('Tenant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  advance: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // match MySQL
  join_date: { type: DataTypes.DATEONLY, allowNull: false },      // match DB
  building_id: { type: DataTypes.INTEGER, allowNull: false },
  floor_id: { type: DataTypes.INTEGER, allowNull: false },
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  documents: { type: DataTypes.JSON, defaultValue: [] },          // match DB
}, {
  tableName: 'Tenants',
  freezeTableName: true,
  timestamps: true,
});

// Associations
Tenant.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Tenant.belongsTo(Floor, { foreignKey: 'floor_id', as: 'floor' });
Tenant.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

export default Tenant;
