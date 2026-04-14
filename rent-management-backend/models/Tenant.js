import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

import Building from "./Building.js";
import Floor from "./Floor.js";
import Room from "./Room.js";

const Tenant = sequelize.define(
  "Tenant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    advance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    join_date: {
      type: DataTypes.DATEONLY,
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

    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    tableName: "Tenants",
    timestamps: true,
  }
);

// =========================
// Associations (IMPORTANT)
// =========================

// Tenant → Building
Tenant.belongsTo(Building, {
  foreignKey: "building_id",
  as: "building",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Building.hasMany(Tenant, {
  foreignKey: "building_id",
  as: "tenants",
});

// Tenant → Floor
Tenant.belongsTo(Floor, {
  foreignKey: "floor_id",
  as: "floor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Floor.hasMany(Tenant, {
  foreignKey: "floor_id",
  as: "tenants",
});

// Tenant → Room
Tenant.belongsTo(Room, {
  foreignKey: "room_id",
  as: "room",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Room.hasMany(Tenant, {
  foreignKey: "room_id",
  as: "tenants",
});

export default Tenant;
