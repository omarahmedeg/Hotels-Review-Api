const { sequelize, Hotel, Review } = require("./models");

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'count'],
          [sequelize.fn('TRUNC', sequelize.fn('AVG', sequelize.col('reviews.customer_rating')), 1), 'average_rating']
        ]
      },
      include: [{
        model: Review,
        as: 'reviews',
        attributes: []
      }],
      group: ['Hotel.id'],
      raw: true
    });

    res.status(200).json({
      status: "success",
      results: hotels.length,
      data: {
        hotels: hotels,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const getHotel = async (req, res) => {
  console.log(req.params.id);
  try {
    const hotel = await Hotel.findByPk(req.params.id, {
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('reviews.id')), 'count'],
          [sequelize.fn('TRUNC', sequelize.fn('AVG', sequelize.col('reviews.customer_rating')), 1), 'average_rating']
        ]
      },
      include: [{
        model: Review,
        as: 'reviews',
        attributes: []
      }],
      group: ['Hotel.id'],
      raw: true
    });

    const reviews = await Review.findAll({
      where: { hotel_id: req.params.id }
    });
    console.log(reviews);

    res.status(200).json({
      status: "success",
      data: {
        hotel: hotel,
        reviews: reviews,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const updateHotel = async (req, res) => {
  try {
    const [rowsUpdated, [updatedHotel]] = await Hotel.update(
      {
        name: req.body.name,
        location: req.body.location,
        stars_rating: req.body.stars_rating
      },
      {
        where: { id: req.params.id },
        returning: true
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        retaurant: updatedHotel.dataValues,
      },
    });
  } catch (err) {
    console.log(err);
  }
  console.log(req.params.id);
  console.log(req.body);
};

const deleteHotel = async (req, res) => {
  try {
    await Hotel.destroy({
      where: { id: req.params.id }
    });
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
  }
};

const createHotel = async (req, res) => {
  console.log(req.body);

  try {
    const hotel = await Hotel.create({
      name: req.body.name,
      location: req.body.location,
      stars_rating: req.body.stars_rating
    });
    console.log(hotel);
    res.status(201).json({
      status: "success",
      data: {
        hotel: hotel.dataValues,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const addReview = async (req, res) => {
  try {
    const newReview = await Review.create({
      hotel_id: req.params.id,
      name: req.body.name,
      review: req.body.review,
      customer_rating: req.body.customer_rating
    });
    console.log(newReview);
    res.status(201).json({
      status: "success",
      data: {
        review: newReview.dataValues,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getAllHotels,
  getHotel,
  deleteHotel,
  createHotel,
  updateHotel,
  addReview,
};

