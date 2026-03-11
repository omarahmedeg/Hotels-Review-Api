const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hotel = sequelize.define('Hotel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stars_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'hotels',
    timestamps: false,
  });

  return Hotel;
};

