const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  // Get notifications for the current user, sorted by most recent first
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  // Get total count for pagination
  const total = await Notification.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    docs: notifications
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  
  // Check if request is to mark all as read
  if (notificationId === 'all') {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  }
  
  // Find the notification
  const notification = await Notification.findById(notificationId);
  
  // Check if notification exists
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this notification'
    });
  }
  
  // Update the notification
  notification.isRead = true;
  await notification.save();
  
  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  // Check if notification exists
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
  
  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this notification'
    });
  }
  
  await notification.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create a new notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, relatedId, relatedType } = req.body;
  
  // Create the notification
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type: type || 'info',
    relatedId,
    relatedType
  });
  
  res.status(201).json({
    success: true,
    data: notification
  });
});

// Helper function to create a notification (for internal use)
exports.createSystemNotification = async (userId, title, message, type = 'info', relatedId = null, relatedType = null) => {
  try {
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
      relatedType
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};