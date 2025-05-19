const express = require('express');
const {
  getDashboardStats,
  getRecentUsers,
  getRecentRides,
  getRecentBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

/**
 * @swagger
 * /api/admin/stats:
 *  get:
 *    summary: Get dashboard statistics
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: Dashboard statistics
 *      403:
 *        description: Not authorized
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/admin/recent-users:
 *  get:
 *    summary: Get recent users
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of recent users
 *      403:
 *        description: Not authorized
 */
router.get('/recent-users', getRecentUsers);

/**
 * @swagger
 * /api/admin/recent-rides:
 *  get:
 *    summary: Get recent rides
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of recent rides
 *      403:
 *        description: Not authorized
 */
router.get('/recent-rides', getRecentRides);

/**
 * @swagger
 * /api/admin/recent-bookings:
 *  get:
 *    summary: Get recent bookings
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    responses:
 *      200:
 *        description: List of recent bookings
 *      403:
 *        description: Not authorized
 */
router.get('/recent-bookings', getRecentBookings);

module.exports = router;