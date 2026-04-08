import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Building from './Building.js'; // Make sure this matches the model file for Buildings

const Floor = sequelize.define(
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
        model: Building, // Sequelize model, which points to 'Buildings' table
        key: 'id',
      },
    },
  },
  {
    tableName: 'Floors',      // exact table name in MySQL
    freezeTableName: true,    // prevents Sequelize from pluralizing
    timestamps: true,         // enables createdAt & updatedAt
    createdAt: 'created_at',  // maps Sequelize createdAt to SQL created_at
    updatedAt: 'updated_at',  // maps Sequelize updatedAt to SQL updated_at
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