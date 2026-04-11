import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

import Building from './Building.js';
import Floor from './Floor.js';
import Room from './Room.js';
import Tenant from './Tenant.js';

const Bill = sequelize.define('Bill', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

  bill_number: { type: DataTypes.STRING, unique: true },

  building_id: { type: DataTypes.INTEGER, allowNull: false },
  floor_id: { type: DataTypes.INTEGER, allowNull: false },
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },

  previous_reading: { type: DataTypes.INTEGER, allowNull: false },
  current_reading: { type: DataTypes.INTEGER, allowNull: false },
  units: { type: DataTypes.INTEGER, allowNull: false },

  rate: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },

  month: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },

  generated_date: { type: DataTypes.DATEONLY },
  
}, {
   tableName: 'Bills',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// associations
Bill.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });
Bill.belongsTo(Floor, { foreignKey: 'floor_id', as: 'floor' });
Bill.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
Bill.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

export default Bill;
