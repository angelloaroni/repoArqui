import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Usuario = sequelize.define(
  "USER",
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    // Autenticación
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "local",
    },

    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // Información personal
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Negocio
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "arrendador",
    },

    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "active",
    },

    // Reputación
    rating_as_arrendador: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.0,
    },

    rating_as_arrendatario: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.0,
    },

    // Documentación
    document_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },

    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    driver_license: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    license_expiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Auditoría
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "USER",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Usuario;