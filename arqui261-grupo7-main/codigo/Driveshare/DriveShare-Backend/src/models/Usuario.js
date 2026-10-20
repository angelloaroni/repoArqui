import sequelize from '../config/database.js'
import { DataTypes } from 'sequelize'

const Usuario = sequelize.define('USER', { // Mapeado a la tabla USER 

    id_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true // Mantiene el orden secuencial autoincremental (1, 2, 3...)
    },

    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },

    // --- CAMPOS PARA GOOGLE OAUTH Y FLUJO HÍBRIDO ---
    provider: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'local' // Puede ser 'local' o 'google'
    },

    google_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },

    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true // Permitir nulo es clave para los usuarios de Google
    },

    // --- INFORMACIÓN BÁSICA DEL PERFIL ---
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    lastname: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    phone: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    gender: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // --- ROLES Y ESTADOS DEL NEGOCIO ---
    role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'arrendador'
    },

    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'active'
    },

    // --- REPUTACIÓN (RATINGS) ---
    rating_as_arrendador: {
        type: DataTypes.NUMERIC(3, 2),
        allowNull: true,
        defaultValue: 5.00
    },

    rating_as_arrendatario: {
        type: DataTypes.NUMERIC(3, 2),
        allowNull: true,
        defaultValue: 5.00
    },

    // --- DOCUMENTACIÓN REQUERIDA POR DRIVESHARE ---
    document_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    nationality: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    driver_license: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    license_expiration: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    // --- TIMESTAMPS DE AUDITORÍA ---
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }

}, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'USER'
});

export default Usuario;