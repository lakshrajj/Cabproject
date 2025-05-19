const express = require('express');
const { check } = require('express-validator');
const {
  createBooking,
  getBookingsForRide,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *  post:
 *    summary: Create a new booking (rider only)
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - ride
 *              - seats
 *              - pickupLocation
 *              - dropLocation
 *            properties:
 *              ride:
 *                type: string
 *                description: Ride ID
 *              seats:
 *                type: integer
 *                minimum: 1
 *              pickupLocation:
 *                type: object
 *                required:
 *                  - address
 *                  - coordinates
 *                properties:
 *                  address:
 *                    type: string
 *                  coordinates:
 *                    type: object
 *                    properties:
 *                      coordinates:
 *                        type: array
 *                        items:
 *                          type: number
 *              dropLocation:
 *                type: object
 *                required:
 *                  - address
 *                  - coordinates
 *                properties:
 *                  address:
 *                    type: string
 *                  coordinates:
 *                    type: object
 *                    properties:
 *                      coordinates:
 *                        type: array
 *                        items:
 *                          type: number
 *    responses:
 *      201:
 *        description: Booking created
 *      400:
 *        description: Invalid input
 *      404:
 *        description: Ride not found
 *      403:
 *        description: Not authorized (not a rider)
 */
router.post(
  '/',
  [
    check('ride', 'Ride ID is required').not().isEmpty(),
    check('seats', 'Seats must be at least 1').isInt({ min: 1 }),
    check('pickupLocation', 'Pickup location is required').not().isEmpty(),
    check('pickupLocation.address', 'Pickup address is required').not().isEmpty(),
    check('pickupLocation.coordinates.coordinates', 'Pickup coordinates are required').isArray(),
    check('dropLocation', 'Drop location is required').not().isEmpty(),
    check('dropLocation.address', 'Drop address is required').not().isEmpty(),
    check('dropLocation.coordinates.coordinates', 'Drop coordinates are required').isArray(),
  ],
  protect,
  authorize('rider'),
  createBooking
);

/**
 * @swagger
 * /api/bookings/ride/{rideId}:
 *  get:
 *    summary: Get all bookings for a ride (driver or admin only)
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: rideId
 *        schema:
 *          type: string
 *        required: true
 *        description: Ride ID
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *          enum: [pending, accepted, rejected, cancelled, completed]
 *        description: Filter by booking status
 *    responses:
 *      200:
 *        description: List of bookings for the ride
 *      404:
 *        description: Ride not found
 *      403:
 *        description: Not authorized
 */
router.get('/ride/:rideId', protect, getBookingsForRide);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *  get:
 *    summary: Get bookings made by logged in rider
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *        description: Page number
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Number of items per page
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *          enum: [pending, accepted, rejected, cancelled, completed]
 *        description: Filter by booking status
 *    responses:
 *      200:
 *        description: List of bookings made by the rider
 */
router.get('/my-bookings', protect, getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *  get:
 *    summary: Get a single booking (rider, driver or admin only)
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Booking ID
 *    responses:
 *      200:
 *        description: Booking details
 *      404:
 *        description: Booking not found
 *      403:
 *        description: Not authorized
 */
router.get('/:id', protect, getBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *  put:
 *    summary: Update booking status (driver or admin only)
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Booking ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - status
 *            properties:
 *              status:
 *                type: string
 *                enum: [accepted, rejected, completed, cancelled]
 *    responses:
 *      200:
 *        description: Booking status updated
 *      400:
 *        description: Invalid status
 *      404:
 *        description: Booking not found
 *      403:
 *        description: Not authorized
 */
router.put(
  '/:id/status',
  [
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status').isIn(['accepted', 'rejected', 'completed', 'cancelled']),
  ],
  protect,
  updateBookingStatus
);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *  put:
 *    summary: Cancel a booking (rider only)
 *    tags: [Bookings]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Booking ID
 *    responses:
 *      200:
 *        description: Booking cancelled
 *      400:
 *        description: Cannot cancel completed booking
 *      404:
 *        description: Booking not found
 *      403:
 *        description: Not authorized
 */
router.put('/:id/cancel', protect, authorize('rider'), cancelBooking);

module.exports = router;