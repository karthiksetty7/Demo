import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Building from "./Building.js";
import Floor from "./Floor.js";

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    room_number: {
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

    floor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Rooms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,

    indexes: [
      {
        unique: true,
        fields: ["building_id", "floor_id", "room_number"],
        name: "unique_room_per_floor",
      },
    ],
  }
);

// =========================
// Associations (IMPORTANT)
// =========================

// Room → Building
Room.belongsTo(Building, {
  foreignKey: "building_id",
  as: "building",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Building → Rooms
Building.hasMany(Room, {
  foreignKey: "building_id",
  as: "rooms",
});

// Room → Floor
Room.belongsTo(Floor, {
  foreignKey: "floor_id",
  as: "floor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Floor → Rooms
Floor.hasMany(Room, {
  foreignKey: "floor_id",
  as: "rooms",
});

export default Room;
