const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// Load environment variables from .env file
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const db = {};

async function initializeDatabase() {
  try {
    // Connect to the MySQL server without specifying the database
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Check if the database exists
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    if (rows.length === 0) {
      console.log('Database does not exist, creating it...');
      await connection.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log('Database created');
    }

    // Close the initial connection
    await connection.end();

    // Reconnect using the new database
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
      host: dbConfig.host,
      dialect: 'mysql',
    });

    // Import the database models
    db.sequelize = sequelize;
    db.models = {};
    db.models.Tenant = require('./tenant')(sequelize, Sequelize.DataTypes);

    // Authenticate and sync the models
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await db.sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

db.initializeDatabase = initializeDatabase;

module.exports = db;