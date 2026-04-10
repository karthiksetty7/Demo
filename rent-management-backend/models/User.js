import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ONLY ONE INDEX (safe)
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    freezeTableName: true, // prevents Sequelize from modifying table name behavior
  }
);

// 🔐 Hash password before creating user
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// 🔐 Hash password before updating user (important fix)
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// 🔑 Compare password method
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;
