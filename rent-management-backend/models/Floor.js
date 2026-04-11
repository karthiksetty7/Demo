import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js'; // Make sure this matches the model file for Buildings

export const Floor = sequelize.define(
  'Floor',
  {
    floor_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    building_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Building,
        key: 'id',
      },
    },
  },
  {
    tableName: 'Floors',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    // ✅ UNIQUE constraint here
    indexes: [
      {
        unique: true,
        fields: ['building_id', 'floor_number'],
      },
    ],
  }
);

// Association: Floor belongs to Building
Floor.belongsTo(Building, {
  foreignKey: 'building_id',
  as: 'building',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default Floor;
