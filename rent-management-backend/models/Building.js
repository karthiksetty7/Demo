import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Building = sequelize.define(
  "Building",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: "Buildings",
    timestamps: true,
  }
);

export default Building;