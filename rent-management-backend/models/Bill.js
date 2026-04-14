import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Tenant from "./Tenant.js";

const Bill = sequelize.define(
  "Bill",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    bill_number: {
      type: DataTypes.STRING,
      unique: true,
    },

    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    previous_reading: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    current_reading: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    units: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    generated_date: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    tableName: "Bills",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// =========================
// Associations (IMPORTANT)
// =========================

// Bill → Tenant
Bill.belongsTo(Tenant, {
  foreignKey: "tenant_id",
  as: "tenant",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Tenant → Bills
Tenant.hasMany(Bill, {
  foreignKey: "tenant_id",
  as: "bills",
});

export default Bill;
