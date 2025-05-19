const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  createNotification
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(protect);

// User routes
router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin routes
router.post('/', authorize('admin'), createNotification);

module.exports = router;