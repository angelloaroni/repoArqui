import Sequelize from 'sequelize';
import pg from 'pg'; 
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear instancia de Sequelize apuntando a tu localhost
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        dialectModule: pg,
        logging: console.log, // Muestra las consultas SQL en la terminal
        define: {
            freezeTableName: true,
            timestamps: false
        }
    }
);

// Probar la conexión local
sequelize.authenticate()
    .then(() => {
        console.log(`✅ Conectado correctamente a PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT})`);
    })
    .catch(err => {
        console.error('❌ Error conectando a PostgreSQL:', err.message);
    });

export default sequelize;