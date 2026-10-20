//Segundo Tema Individual\driveshare-sidecar-demo\user-service\models\user.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false
    },

    created_at: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: "users",
    timestamps: false
  }
);

export default User;