'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'production';
// const config = require(__dirname + '/../config/config.json')[env];
const config = require(__dirname + '/../config/config.json')
const db = {};

//여기에 직접 값을 넣었을 때는 적용이 안된다. config에 적어주니까 된다.. 이유가 뭐지
let sequelize = new Sequelize({logging: config.logging, timezone: config.timezone, host: config.host, username: config.username, password: config.password, port: config.port, database: config.database, dialect: 'mysql' })

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;



module.exports = db;
