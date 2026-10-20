import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuditLog = sequelize.define(
  'AUDIT_LOG',
  {

    id_audit: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    email: {
      type: DataTypes.STRING(150)
    },

    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    http_method: {
      type: DataTypes.STRING(10),
      allowNull: false
    },

    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    status_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT
    },

    ip_address: {
      type: DataTypes.STRING(100)
    },

    user_agent: {
      type: DataTypes.TEXT
    }

  },
  {

    tableName: 'AUDIT_LOG',

    timestamps: true,

    createdAt: 'created_at',

    updatedAt: false

  }

);

export default AuditLog;