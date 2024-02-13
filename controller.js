const db = require("./db");

const getAllHotels = async (req, res) => {
  try {
    const hotelRatingsData = await db.query(
      "select * from hotels left join (select hotel_id, COUNT(*), TRUNC(AVG(customer_rating),1) as average_rating from reviews group by hotel_id) reviews on hotels.id = reviews.hotel_id;"
    );
    res.status(200).json({
      status: "success",
      results: hotelRatingsData.rows.length,
      data: {
        hotels: hotelRatingsData.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
  // const results = await db.query("select * from hotels");
  // console.log(results);
  // res.status(200).json({
  //   status: "success",
  //   results: results.rows.length,
  //   data: {
  //     hotels: results.rows,
  //   },
  // });
};
const getHotel = async (req, res) => {
  console.log(req.params.id);
  try {
    const hotel = await db.query(
      "select * from hotels left join (select hotel_id, COUNT(*), TRUNC(AVG(customer_rating),1) as average_rating from reviews group by hotel_id) reviews on hotels.id = reviews.hotel_id where id = $1",
      [req.params.id]
    );
    // select * from hotels wehre id = req.params.id

    const reviews = await db.query(
      "select * from reviews where hotel_id = $1",
      [req.params.id]
    );
    console.log(reviews);

    res.status(200).json({
      status: "success",
      data: {
        hotel: hotel.rows[0],
        reviews: reviews.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const updateHotel = async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE hotels SET name = $1, location = $2, stars_rating = $3 where id = $4 returning *",
      [req.body.name, req.body.location, req.body.stars_rating, req.params.id]
    );

    res.status(200).json({
      status: "success",
      data: {
        retaurant: results.rows[0],
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
    const results = db.query("DELETE FROM hotels where id = $1", [
      req.params.id,
    ]);
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
    const results = await db.query(
      "INSERT INTO hotels (name, location, stars_rating) values ($1, $2, $3) returning *",
      [req.body.name, req.body.location, req.body.stars_rating]
    );
    console.log(results);
    res.status(201).json({
      status: "success",
      data: {
        hotel: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
};


const addReview = async (req, res) => {
  try {
    const newReview = await db.query(
      "INSERT INTO reviews (hotel_id, name, review, customer_rating) values ($1, $2, $3, $4) returning *;",
      [req.params.id, req.body.name, req.body.review, req.body.customer_rating]
    );
    console.log(newReview);
    res.status(201).json({
      status: "success",
      data: {
        review: newReview.rows[0],
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
