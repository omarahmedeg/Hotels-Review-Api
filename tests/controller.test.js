const {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  addReview,
} = require('../controller');
const db = require('../db');

jest.mock('../db');

describe('Controller Unit Tests', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockReq = {
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('getAllHotels', () => {
    it('should return all hotels with status 200', async () => {
      const mockHotels = [
        { id: 1, name: 'Hotel A', location: 'NYC', average_rating: 4.5 },
        { id: 2, name: 'Hotel B', location: 'LA', average_rating: 4.0 },
      ];

      db.query.mockResolvedValue({ rows: mockHotels });

      await getAllHotels(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: {
          hotels: mockHotels,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      db.query.mockRejectedValue(mockError);

      await getAllHotels(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getHotel', () => {
    it('should return a single hotel with reviews and status 200', async () => {
      const mockHotel = { id: 1, name: 'Hotel A', location: 'NYC', average_rating: 4.5 };
      const mockReviews = [
        { id: 1, hotel_id: 1, name: 'John', review: 'Great!', customer_rating: 5 },
      ];

      mockReq.params.id = '1';

      db.query
        .mockResolvedValueOnce({ rows: [mockHotel] })
        .mockResolvedValueOnce({ rows: mockReviews });

      await getHotel(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          hotel: mockHotel,
          reviews: mockReviews,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database query failed');
      mockReq.params.id = '1';
      db.query.mockRejectedValue(mockError);

      await getHotel(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createHotel', () => {
    it('should create a hotel and return status 201', async () => {
      const newHotel = { id: 1, name: 'New Hotel', location: 'Miami', stars_rating: 5 };

      mockReq.body = {
        name: 'New Hotel',
        location: 'Miami',
        stars_rating: 5,
      };

      db.query.mockResolvedValue({ rows: [newHotel] });

      await createHotel(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO hotels (name, location, stars_rating) values ($1, $2, $3) returning *',
        ['New Hotel', 'Miami', 5]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          hotel: newHotel,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Insert failed');
      mockReq.body = { name: 'Test', location: 'Test', stars_rating: 3 };
      db.query.mockRejectedValue(mockError);

      await createHotel(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateHotel', () => {
    it('should update a hotel and return status 200', async () => {
      const updatedHotel = { id: 1, name: 'Updated Hotel', location: 'Boston', stars_rating: 4 };

      mockReq.params.id = '1';
      mockReq.body = {
        name: 'Updated Hotel',
        location: 'Boston',
        stars_rating: 4,
      };

      db.query.mockResolvedValue({ rows: [updatedHotel] });

      await updateHotel(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE hotels SET name = $1, location = $2, stars_rating = $3 where id = $4 returning *',
        ['Updated Hotel', 'Boston', 4, '1']
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          retaurant: updatedHotel,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Update failed');
      mockReq.params.id = '1';
      mockReq.body = { name: 'Test', location: 'Test', stars_rating: 3 };
      db.query.mockRejectedValue(mockError);

      await updateHotel(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteHotel', () => {
    it('should delete a hotel and return status 204', async () => {
      mockReq.params.id = '1';

      db.query.mockResolvedValue({ rows: [] });

      await deleteHotel(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM hotels where id = $1', ['1']);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Delete failed');
      mockReq.params.id = '1';
      db.query.mockImplementation(() => {
        throw mockError;
      });

      await deleteHotel(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });

  describe('addReview', () => {
    it('should add a review and return status 201', async () => {
      const newReview = {
        id: 1,
        hotel_id: 1,
        name: 'John Doe',
        review: 'Excellent stay!',
        customer_rating: 5,
      };

      mockReq.params.id = '1';
      mockReq.body = {
        name: 'John Doe',
        review: 'Excellent stay!',
        customer_rating: 5,
      };

      db.query.mockResolvedValue({ rows: [newReview] });

      await addReview(mockReq, mockRes);

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO reviews (hotel_id, name, review, customer_rating) values ($1, $2, $3, $4) returning *;',
        ['1', 'John Doe', 'Excellent stay!', 5]
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          review: newReview,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Insert review failed');
      mockReq.params.id = '1';
      mockReq.body = { name: 'Test', review: 'Test review', customer_rating: 3 };
      db.query.mockRejectedValue(mockError);

      await addReview(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(mockError);
    });
  });
});

