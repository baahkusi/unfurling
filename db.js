const dotenv = require('dotenv');
dotenv.config();

const { Sequelize } = require('sequelize');

const db = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.NODE_ENV === 'testing' ? 'test.sqlite' : 'db.sqlite'
});

module.exports = db;
