import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Building = sequelize.define('Building', {
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
});

export default Building;