import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Tenant from "./Tenant.js";

const RentEntry = sequelize.define(
  "RentEntry",
  {
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },

    building: DataTypes.STRING,
    room: DataTypes.STRING,
    month: DataTypes.STRING,

    rent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    water: { type: DataTypes.DECIMAL(10, 2), defaultValue: 300 },
    maintenance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    electricity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

    previous_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    advance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: "not vacated" },
    due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  },
  {
    tableName: "RentEntries",
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

RentEntry.belongsTo(Tenant, {
  foreignKey: "tenant_id",
  as: "tenant",
});

export default RentEntry;