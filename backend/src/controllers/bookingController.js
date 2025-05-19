const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { createSystemNotification } = require('./notificationController');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Rider
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Check if user is a rider
    if (req.user.role !== 'rider') {
      return res.status(403).json({
        success: false,
        message: 'Only riders can create bookings',
      });
    }
    
    const {
      ride: rideId,
      seats,
      pickupLocation,
      dropLocation,
    } = req.body;
    
    // Check if ride exists and is available
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }
    
    // Check if the ride is scheduled (not in-progress, completed or cancelled)
    if (ride.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot book a ride that is ${ride.status}`,
      });
    }
    
    // Check if there are enough available seats
    if (ride.availableSeats < seats) {
      return res.status(400).json({
        success: false,
        message: `Not enough available seats. Only ${ride.availableSeats} seats available`,
      });
    }
    
    // Check if the rider is not the driver
    if (ride.driver.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own ride',
      });
    }
    
    // Calculate total fare
    const totalFare = ride.fare * seats;
    
    // Create booking
    const booking = await Booking.create({
      ride: rideId,
      rider: req.user.id,
      seats,
      pickupLocation,
      dropLocation,
      totalFare,
    });
    
    // Add booking to ride's bookings array
    ride.bookings.push(booking._id);
    
    // If the booking is automatically accepted, reduce available seats
    // For this app, we'll keep the request/approval flow
    
    await ride.save();
    
    // Populate rider and ride data
    await booking.populate([
      { path: 'rider', select: 'name profilePicture' },
      { 
        path: 'ride', 
        select: 'driver startLocation endLocation departureTime fare',
        populate: { 
          path: 'driver', 
          select: 'name profilePicture driverDetails' 
        }
      }
    ]);
    
    // Create notification for driver
    await createSystemNotification(
      ride.driver.toString(),
      'New Booking Request',
      `${req.user.name} has requested a ride from ${booking.pickupLocation.address} to ${booking.dropLocation.address}.`,
      'info',
      booking._id,
      'booking'
    );
    
    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for a ride (driver only)
// @route   GET /api/bookings/ride/:rideId
// @access  Private/Driver
exports.getBookingsForRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }
    
    // Check if user is the ride owner or admin
    if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these bookings',
      });
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    
    const query = { ride: req.params.rideId };
    if (status) {
      query.status = status;
    }
    
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: 'rider',
        select: 'name profilePicture phone',
      },
    };
    
    const bookings = await Booking.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for a rider
// @route   GET /api/bookings/my-bookings
// @access  Private/Rider
exports.getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    
    const query = { rider: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: {
        path: 'ride',
        select: 'driver startLocation endLocation departureTime fare status',
        populate: {
          path: 'driver',
          select: 'name profilePicture driverDetails',
        },
      },
    };
    
    const bookings = await Booking.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private/Owner or Driver or Admin
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('rider', 'name profilePicture phone')
      .populate({
        path: 'ride',
        select: 'driver startLocation endLocation departureTime fare status',
        populate: {
          path: 'driver',
          select: 'name profilePicture driverDetails',
        },
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    // Check if user is the booking owner, ride driver, or admin
    const isRider = booking.rider._id.toString() === req.user.id;
    const isDriver = booking.ride.driver._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isRider && !isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (driver only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Driver or Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { status } = req.body;
    
    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    const ride = await Ride.findById(booking.ride);
    
    // Check if user is the ride driver or admin
    const isDriver = ride.driver.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }
    
    // Rider can only cancel their own booking
    if (status === 'cancelled' && req.user.id === booking.rider.toString()) {
      booking.status = 'cancelled';
      
      // If the booking was accepted, increase available seats
      if (booking.status === 'accepted') {
        ride.availableSeats += booking.seats;
      }
      
      await booking.save();
      await ride.save();
      
      return res.status(200).json({
        success: true,
        data: booking,
      });
    }
    
    // Prevent status change if ride is already completed or cancelled
    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change booking status for a ${ride.status} ride`,
      });
    }
    
    // If accepting a booking
    if (status === 'accepted' && booking.status === 'pending') {
      // Check if there are enough seats
      if (ride.availableSeats < booking.seats) {
        return res.status(400).json({
          success: false,
          message: `Not enough available seats. Only ${ride.availableSeats} seats available`,
        });
      }
      
      // Reduce available seats
      ride.availableSeats -= booking.seats;
    }
    
    // If rejecting a previously accepted booking
    if (status === 'rejected' && booking.status === 'accepted') {
      // Increase available seats
      ride.availableSeats += booking.seats;
    }
    
    booking.status = status;
    
    await booking.save();
    await ride.save();
    
    // Create notification for rider about status change
    let notificationTitle, notificationMessage, notificationType;
    
    switch(status) {
      case 'accepted':
        notificationTitle = 'Booking Accepted';
        notificationMessage = `Your booking for the ride to ${ride.endLocation.address} has been accepted.`;
        notificationType = 'success';
        break;
      case 'rejected':
        notificationTitle = 'Booking Rejected';
        notificationMessage = `Your booking for the ride to ${ride.endLocation.address} has been rejected.`;
        notificationType = 'error';
        break;
      case 'completed':
        notificationTitle = 'Ride Completed';
        notificationMessage = `Your ride to ${ride.endLocation.address} has been marked as completed.`;
        notificationType = 'success';
        break;
      case 'cancelled':
        notificationTitle = 'Booking Cancelled';
        notificationMessage = `Your booking for the ride to ${ride.endLocation.address} has been cancelled.`;
        notificationType = 'warning';
        break;
    }
    
    await createSystemNotification(
      booking.rider.toString(),
      notificationTitle,
      notificationMessage,
      notificationType,
      booking._id,
      'booking'
    );
    
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (rider only)
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Rider
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    // Check if user is the booking owner
    if (booking.rider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }
    
    // Cannot cancel a completed booking
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking',
      });
    }
    
    // Cannot cancel if already cancelled or rejected
    if (['cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`,
      });
    }
    
    const ride = await Ride.findById(booking.ride);
    
    // If the booking was accepted, increase available seats
    if (booking.status === 'accepted') {
      ride.availableSeats += booking.seats;
      await ride.save();
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    // Notify driver about cancellation
    await createSystemNotification(
      ride.driver.toString(),
      'Booking Cancelled',
      `A booking for your ride to ${ride.endLocation.address} has been cancelled by the rider.`,
      'warning',
      booking._id,
      'booking'
    );
    
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};