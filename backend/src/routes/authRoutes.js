const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe, checkHealth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/health:
 *  get:
 *    summary: Check authentication service health
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: Service is healthy
 */
router.get('/health', checkHealth);

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *    summary: Register a new user
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - phone
 *              - password
 *            properties:
 *              name:
 *                type: string
 *              email:
 *                type: string
 *              phone:
 *                type: string
 *              password:
 *                type: string
 *              role:
 *                type: string
 *                enum: [rider, driver]
 *    responses:
 *      201:
 *        description: User registered successfully
 *      400:
 *        description: Invalid input
 */
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Please enter a valid phone number').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *    summary: Login a user
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              phone:
 *                type: string
 *              password:
 *                type: string
 *                required: true
 *    responses:
 *      200:
 *        description: Login successful
 *      401:
 *        description: Invalid credentials
 */
router.post(
  '/login',
  [
    check('password', 'Password is required').exists(),
  ],
  login
);

/**
 * @swagger
 * /api/auth/me:
 *  get:
 *    summary: Get current logged in user
 *    tags: [Auth]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Current user data
 *      401:
 *        description: Not authorized
 */
router.get('/me', protect, getMe);

module.exports = router;