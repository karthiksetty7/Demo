import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js';
import Floor from './Floor.js';
import Room from './Room.js';

const Tenant = sequelize.define(
  'Tenant',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    phone: DataTypes.STRING,
    advance: DataTypes.DECIMAL(10, 2),
    join_date: DataTypes.DATE,

    building_id: DataTypes.INTEGER,
    floor_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,

    documents: {
      type: DataTypes.JSON, // store filenames array
    },
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