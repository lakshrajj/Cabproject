const express = require('express');
const { check } = require('express-validator');
const {
  getUsers,
  getUser,
  updateProfile,
  updateDriverDetails,
  toggleBlockUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *  get:
 *    summary: Get all users (admin only)
 *    tags: [Users]
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
 *        name: role
 *        schema:
 *          type: string
 *          enum: [rider, driver, admin]
 *        description: Filter by role
 *    responses:
 *      200:
 *        description: List of users
 *      401:
 *        description: Not authorized
 */
router.get('/', protect, authorize('admin'), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *  get:
 *    summary: Get a single user (admin only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID
 *    responses:
 *      200:
 *        description: User details
 *      404:
 *        description: User not found
 *      401:
 *        description: Not authorized
 */
router.get('/:id', protect, authorize('admin'), getUser);

/**
 * @swagger
 * /api/users/profile:
 *  put:
 *    summary: Update user profile
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              phone:
 *                type: string
 *              profilePicture:
 *                type: string
 *    responses:
 *      200:
 *        description: Profile updated
 *      400:
 *        description: Invalid input
 */
router.put(
  '/profile',
  [
    check('name', 'Name must be valid').optional(),
    check('phone', 'Phone must be valid').optional(),
  ],
  protect,
  updateProfile
);

/**
 * @swagger
 * /api/users/driver-details:
 *  put:
 *    summary: Update driver details (driver only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - carModel
 *              - carColor
 *              - licensePlate
 *              - licenseNumber
 *            properties:
 *              carModel:
 *                type: string
 *              carColor:
 *                type: string
 *              licensePlate:
 *                type: string
 *              licenseNumber:
 *                type: string
 *    responses:
 *      200:
 *        description: Driver details updated
 *      400:
 *        description: Invalid input
 *      403:
 *        description: Not authorized (not a driver)
 */
router.put(
  '/driver-details',
  [
    check('carModel', 'Car model is required').not().isEmpty(),
    check('carColor', 'Car color is required').not().isEmpty(),
    check('licensePlate', 'License plate is required').not().isEmpty(),
    check('licenseNumber', 'License number is required').not().isEmpty(),
  ],
  protect,
  authorize('driver'),
  updateDriverDetails
);

/**
 * @swagger
 * /api/users/{id}/block:
 *  put:
 *    summary: Block/unblock a user (admin only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID
 *    responses:
 *      200:
 *        description: User blocked/unblocked
 *      404:
 *        description: User not found
 */
router.put('/:id/block', protect, authorize('admin'), toggleBlockUser);

/**
 * @swagger
 * /api/users/{id}:
 *  delete:
 *    summary: Delete a user (admin only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID
 *    responses:
 *      200:
 *        description: User deleted
 *      404:
 *        description: User not found
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;