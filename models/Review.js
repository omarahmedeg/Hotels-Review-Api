const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'hotels',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    customer_rating: {
      type: DataTypes.DECIMAL(10, 1),
      allowNull: false,
    },
  }, {
    tableName: 'reviews',
    timestamps: false,
  });

  return Review;
};

