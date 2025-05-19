const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const riderCount = await User.countDocuments({ role: 'rider' });
    const driverCount = await User.countDocuments({ role: 'driver' });
    const blockedCount = await User.countDocuments({ isBlocked: true });
    
    const totalRides = await Ride.countDocuments();
    const scheduledRides = await Ride.countDocuments({ status: 'scheduled' });
    const inProgressRides = await Ride.countDocuments({ status: 'in-progress' });
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const acceptedBookings = await Booking.countDocuments({ status: 'accepted' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          riders: riderCount,
          drivers: driverCount,
          blocked: blockedCount,
        },
        rides: {
          total: totalRides,
          scheduled: scheduledRides,
          inProgress: inProgressRides,
          completed: completedRides,
          cancelled: cancelledRides,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          accepted: acceptedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent users
// @route   GET /api/admin/recent-users
// @access  Private/Admin
exports.getRecentUsers = async (req, res, next) => {
  try {
    const recentUsers = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent rides
// @route   GET /api/admin/recent-rides
// @access  Private/Admin
exports.getRecentRides = async (req, res, next) => {
  try {
    const recentRides = await Ride.find()
      .populate('driver', 'name')
      .sort('-createdAt')
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: recentRides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent bookings
// @route   GET /api/admin/recent-bookings
// @access  Private/Admin
exports.getRecentBookings = async (req, res, next) => {
  try {
    const recentBookings = await Booking.find()
      .populate('rider', 'name')
      .populate('ride', 'startLocation endLocation departureTime')
      .sort('-createdAt')
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: recentBookings,
    });
  } catch (error) {
    next(error);
  }
};