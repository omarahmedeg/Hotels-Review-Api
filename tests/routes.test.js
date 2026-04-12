const request = require('supertest');
const app = require('../server');
const db = require('../db');

jest.mock('../db');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('GET /api/hotels', () => {
    it('should return all hotels with status 200', async () => {
      const mockHotels = [
        { id: 1, name: 'Hotel A', location: 'NYC', stars_rating: 5, average_rating: 4.5 },
        { id: 2, name: 'Hotel B', location: 'LA', stars_rating: 4, average_rating: 4.0 },
      ];

      db.query.mockResolvedValue({ rows: mockHotels });

      const response = await request(app).get('/api/hotels');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        results: 2,
        data: {
          hotels: mockHotels,
        },
      });
    });

    it('should return empty array when no hotels exist', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/hotels');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        results: 0,
        data: {
          hotels: [],
        },
      });
    });
  });

  describe('GET /api/hotels/:id', () => {
    it('should return a single hotel with reviews and status 200', async () => {
      const mockHotel = { id: 1, name: 'Hotel A', location: 'NYC', stars_rating: 5, average_rating: 4.5 };
      const mockReviews = [
        { id: 1, hotel_id: 1, name: 'John', review: 'Great!', customer_rating: 5 },
        { id: 2, hotel_id: 1, name: 'Jane', review: 'Nice place', customer_rating: 4 },
      ];

      db.query
        .mockResolvedValueOnce({ rows: [mockHotel] })
        .mockResolvedValueOnce({ rows: mockReviews });

      const response = await request(app).get('/api/hotels/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          hotel: mockHotel,
          reviews: mockReviews,
        },
      });
    });

    it('should return hotel with empty reviews array', async () => {
      const mockHotel = { id: 1, name: 'Hotel A', location: 'NYC', stars_rating: 5 };

      db.query
        .mockResolvedValueOnce({ rows: [mockHotel] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/api/hotels/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          hotel: mockHotel,
          reviews: [],
        },
      });
    });
  });

  describe('POST /api/hotels', () => {
    it('should create a new hotel and return status 201', async () => {
      const newHotel = { id: 1, name: 'New Hotel', location: 'Miami', stars_rating: 5 };

      db.query.mockResolvedValue({ rows: [newHotel] });

      const response = await request(app)
        .post('/api/hotels')
        .send({
          name: 'New Hotel',
          location: 'Miami',
          stars_rating: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          hotel: newHotel,
        },
      });
    });

    it('should call db.query with correct parameters', async () => {
      const newHotel = { id: 1, name: 'Test Hotel', location: 'Boston', stars_rating: 4 };

      db.query.mockResolvedValue({ rows: [newHotel] });

      await request(app)
        .post('/api/hotels')
        .send({
          name: 'Test Hotel',
          location: 'Boston',
          stars_rating: 4,
        });

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO hotels (name, location, stars_rating) values ($1, $2, $3) returning *',
        ['Test Hotel', 'Boston', 4]
      );
    });
  });

  describe('POST /api/hotels/:id (addReview)', () => {
    it('should add a review and return status 201', async () => {
      const newReview = {
        id: 1,
        hotel_id: 1,
        name: 'John Doe',
        review: 'Excellent stay!',
        customer_rating: 5,
      };

      db.query.mockResolvedValue({ rows: [newReview] });

      const response = await request(app)
        .post('/api/hotels/1')
        .send({
          name: 'John Doe',
          review: 'Excellent stay!',
          customer_rating: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          review: newReview,
        },
      });
    });

    it('should call db.query with correct parameters including hotel_id', async () => {
      const newReview = { id: 1, hotel_id: 5, name: 'Jane', review: 'Good', customer_rating: 4 };

      db.query.mockResolvedValue({ rows: [newReview] });

      await request(app)
        .post('/api/hotels/5')
        .send({
          name: 'Jane',
          review: 'Good',
          customer_rating: 4,
        });

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO reviews (hotel_id, name, review, customer_rating) values ($1, $2, $3, $4) returning *;',
        ['5', 'Jane', 'Good', 4]
      );
    });
  });

  describe('PUT /api/hotels/:id', () => {
    it('should update a hotel and return status 200', async () => {
      const updatedHotel = { id: 1, name: 'Updated Hotel', location: 'Chicago', stars_rating: 4 };

      db.query.mockResolvedValue({ rows: [updatedHotel] });

      const response = await request(app)
        .put('/api/hotels/1')
        .send({
          name: 'Updated Hotel',
          location: 'Chicago',
          stars_rating: 4,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          retaurant: updatedHotel,
        },
      });
    });

    it('should call db.query with correct parameters', async () => {
      const updatedHotel = { id: 2, name: 'Test Update', location: 'Seattle', stars_rating: 3 };

      db.query.mockResolvedValue({ rows: [updatedHotel] });

      await request(app)
        .put('/api/hotels/2')
        .send({
          name: 'Test Update',
          location: 'Seattle',
          stars_rating: 3,
        });

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE hotels SET name = $1, location = $2, stars_rating = $3 where id = $4 returning *',
        ['Test Update', 'Seattle', 3, '2']
      );
    });
  });

  describe('DELETE /api/hotels/:id', () => {
    it('should delete a hotel and return status 204', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const response = await request(app).delete('/api/hotels/1');

      expect(response.status).toBe(204);
    });

    it('should call db.query with correct hotel id', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await request(app).delete('/api/hotels/5');

      expect(db.query).toHaveBeenCalledWith('DELETE FROM hotels where id = $1', ['5']);
    });
  });
});

