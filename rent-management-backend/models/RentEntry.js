import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Tenant from "./Tenant.js";

const RentEntry = sequelize.define(
  "RentEntry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    water: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 300,
    },

    maintenance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    electricity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    previous_due: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    paid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    advance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "not vacated",
    },

    due: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "RentEntries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [
      {
        unique: true,
        fields: ["tenant_id", "month"],
        name: "unique_rent_per_tenant_month",
      },
    ],
  }
);

// =========================
// Associations (IMPORTANT)
// =========================

// RentEntry → Tenant
RentEntry.belongsTo(Tenant, {
  foreignKey: "tenant_id",
  as: "tenant",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Tenant → RentEntries
Tenant.hasMany(RentEntry, {
  foreignKey: "tenant_id",
  as: "rent_entries",
});

export default RentEntry;
