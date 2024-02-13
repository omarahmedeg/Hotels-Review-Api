const express = require('express');
const { getAllHotels,getHotel, deleteHotel,createHotel, updateHotel,addReview  } = require('./controller');

const router = express.Router();

router.get('/', getAllHotels)
router.get('/:id', getHotel)
router.post('/', createHotel)
router.post('/:id', addReview)
router.put('/:id', updateHotel)
router.delete('/:id', deleteHotel);

module.exports = router;