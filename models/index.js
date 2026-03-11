const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    logging: false,
  });
}

const Hotel = require('./Hotel')(sequelize);
const Review = require('./Review')(sequelize);

Hotel.hasMany(Review, { foreignKey: 'hotel_id', as: 'reviews' });
Review.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

module.exports = {
  sequelize,
  Hotel,
  Review,
};

