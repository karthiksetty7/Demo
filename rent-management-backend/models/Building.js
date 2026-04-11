import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Building = sequelize.define('Building', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  address: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,   // uniqueness
    validate: {
      notEmpty: true
    }
  },
});

export default Building;
