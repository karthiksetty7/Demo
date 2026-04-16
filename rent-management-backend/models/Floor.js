import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Building from "./Building.js";

const Floor = sequelize.define(
  "Floor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    floor_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    building_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Floors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    indexes: [
      {
        unique: true,
        fields: ["building_id", "floor_number"],
        name: "unique_floor_per_building",
      },
    ],
  }
);

// =========================
// Associations (IMPORTANT)
// =========================

// Floor → Building
Floor.belongsTo(Building, {
  foreignKey: "building_id",
  as: "building",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Building → Floors
Building.hasMany(Floor, {
  foreignKey: "building_id",
  as: "floors",
});

export default Floor;