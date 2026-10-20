import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const Review = sequelize.define('REVIEW', {
    id_review: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    reservation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },

    vehicle_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },

    comment: {
        type: DataTypes.TEXT,
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
    tableName: 'REVIEW'
});

export default Review;
