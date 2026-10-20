import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },   

    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    event: {
      type: DataTypes.STRING,
      allowNull: false
    },

    detail: {
      type: DataTypes.JSONB
    },

    created_at: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: "audit_log",
    timestamps: false
  }
);

export default AuditLog;