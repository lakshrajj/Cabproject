const express = require('express');
const { check } = require('express-validator');
const {
  createRide,
  getRides,
  getRide,
  updateRide,
  updateRideStatus,
  deleteRide,
  getMyRides,
} = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/rides:
 *  post:
 *    summary: Create a new ride (driver only)
 *    tags: [Rides]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - startLocation
 *              - endLocation
 *              - departureTime
 *              - availableSeats
 *              - fare
 *            properties:
 *              startLocation:
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
 *              endLocation:
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
 *              departureTime:
 *                type: string
 *                format: date-time
 *              availableSeats:
 *                type: integer
 *                minimum: 1
 *              fare:
 *                type: number
 *                minimum: 0
 *              description:
 *                type: string
 *    responses:
 *      201:
 *        description: Ride created
 *      400:
 *        description: Invalid input
 *      403:
 *        description: Not authorized (not a driver)
 */
router.post(
  '/',
  [
    check('startLocation', 'Start location is required').not().isEmpty(),
    check('startLocation.address', 'Start address is required').not().isEmpty(),
    check('startLocation.coordinates.coordinates', 'Start coordinates are required').isArray(),
    check('endLocation', 'End location is required').not().isEmpty(),
    check('endLocation.address', 'End address is required').not().isEmpty(),
    check('endLocation.coordinates.coordinates', 'End coordinates are required').isArray(),
    check('departureTime', 'Departure time is required').isISO8601(),
    check('availableSeats', 'Available seats must be at least 1').isInt({ min: 1 }),
    check('fare', 'Fare must be a positive number').isFloat({ min: 0 }),
  ],
  protect,
  authorize('driver'),
  createRide
);

/**
 * @swagger
 * /api/rides:
 *  get:
 *    summary: Get all rides with filters
 *    tags: [Rides]
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
 *        name: startDate
 *        schema:
 *          type: string
 *          format: date-time
 *        description: Filter rides after this date
 *      - in: query
 *        name: endDate
 *        schema:
 *          type: string
 *          format: date-time
 *        description: Filter rides before this date
 *      - in: query
 *        name: minSeats
 *        schema:
 *          type: integer
 *        description: Minimum available seats
 *      - in: query
 *        name: maxFare
 *        schema:
 *          type: number
 *        description: Maximum fare
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *          enum: [scheduled, in-progress, completed, cancelled]
 *        description: Filter by ride status
 *    responses:
 *      200:
 *        description: List of rides
 */
router.get('/', getRides);

/**
 * @swagger
 * /api/rides/my-rides:
 *  get:
 *    summary: Get rides created by logged in driver
 *    tags: [Rides]
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
 *          enum: [scheduled, in-progress, completed, cancelled]
 *        description: Filter by ride status
 *    responses:
 *      200:
 *        description: List of rides created by the driver
 *      403:
 *        description: Not authorized (not a driver)
 */
router.get('/my-rides', protect, authorize('driver'), getMyRides);

/**
 * @swagger
 * /api/rides/{id}:
 *  get:
 *    summary: Get a single ride
 *    tags: [Rides]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Ride ID
 *    responses:
 *      200:
 *        description: Ride details
 *      404:
 *        description: Ride not found
 */
router.get('/:id', getRide);

/**
 * @swagger
 * /api/rides/{id}:
 *  put:
 *    summary: Update a ride (driver or admin only)
 *    tags: [Rides]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Ride ID
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              startLocation:
 *                type: object
 *              endLocation:
 *                type: object
 *              departureTime:
 *                type: string
 *                format: date-time
 *              availableSeats:
 *                type: integer
 *                minimum: 1
 *              fare:
 *                type: number
 *                minimum: 0
 *              description:
 *                type: string
 *    responses:
 *      200:
 *        description: Ride updated
 *      400:
 *        description: Invalid input or ride status prevents update
 *      404:
 *        description: Ride not found
 *      403:
 *        description: Not authorized
 */
router.put(
  '/:id',
  protect,
  updateRide
);

/**
 * @swagger
 * /api/rides/{id}/status:
 *  put:
 *    summary: Update ride status (driver or admin only)
 *    tags: [Rides]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Ride ID
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
 *                enum: [scheduled, in-progress, completed, cancelled]
 *    responses:
 *      200:
 *        description: Ride status updated
 *      400:
 *        description: Invalid status
 *      404:
 *        description: Ride not found
 *      403:
 *        description: Not authorized
 */
router.put(
  '/:id/status',
  [
    check('status', 'Status is required').not().isEmpty(),
    check('status', 'Invalid status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled']),
  ],
  protect,
  updateRideStatus
);

/**
 * @swagger
 * /api/rides/{id}:
 *  delete:
 *    summary: Delete a ride (driver or admin only)
 *    tags: [Rides]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Ride ID
 *    responses:
 *      200:
 *        description: Ride deleted
 *      400:
 *        description: Cannot delete ride in progress or completed
 *      404:
 *        description: Ride not found
 *      403:
 *        description: Not authorized
 */
router.delete('/:id', protect, deleteRide);

module.exports = router;