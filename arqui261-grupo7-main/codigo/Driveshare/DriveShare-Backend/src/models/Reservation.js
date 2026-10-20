import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

/**
 * Entidad RESERVATION (Módulo 3 — Reservas)
 * Campos alineados al ERD del backend y a las restricciones de 2.3.
 *
 * Estados: Pendiente | Confirmada | Rechazada | Cancelada | Finalizada
 */
const Reservation = sequelize.define('RESERVATION', {

    id_reservation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // STRING para coexistir con el catálogo mock (VEH-001) hasta que M2 persista vehículos
    vehicle_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    owner_id: {
        type: DataTypes.STRING(50),
        allowNull: true
    },

    vehicle_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },

    price_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },

    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },

    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Pendiente'
    },

    pickup_location: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

    return_location: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

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
    tableName: 'RESERVATION'
});

export default Reservation;
