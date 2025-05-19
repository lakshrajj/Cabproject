const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private/Driver
exports.createRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Check if user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can create rides',
      });
    }
    
    const {
      startLocation,
      endLocation,
      departureTime,
      availableSeats,
      fare,
      description,
    } = req.body;
    
    const ride = await Ride.create({
      driver: req.user.id,
      startLocation,
      endLocation,
      departureTime,
      availableSeats,
      fare,
      description,
    });
    
    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rides (with filters and pagination)
// @route   GET /api/rides
// @access  Public
exports.getRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const minSeats = parseInt(req.query.minSeats, 10) || 1;
    const maxFare = parseInt(req.query.maxFare, 10);
    const status = req.query.status;
    
    // Build query
    const query = {
      availableSeats: { $gte: minSeats },
    };
    
    if (startDate && endDate) {
      query.departureTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.departureTime = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.departureTime = { $lte: new Date(endDate) };
    }
    
    if (maxFare) {
      query.fare = { $lte: maxFare };
    }
    
    if (status) {
      query.status = status;
    }
    
    // Pagination options
    const options = {
      page,
      limit,
      sort: { departureTime: 1 },
      populate: {
        path: 'driver',
        select: 'name profilePicture driverDetails',
      },
    };
    
    const rides = await Ride.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single ride
// @route   GET /api/rides/:id
// @access  Public
exports.getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate({
      path: 'driver',
      select: 'name profilePicture driverDetails',
    });
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ride
// @route   PUT /api/rides/:id
// @access  Private/Driver
exports.updateRide = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    let ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }
    
    // Check if user is the ride owner
    if (ride.driver.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride',
      });
    }
    
    // Can't update a ride that is in progress, completed, or cancelled
    if (ride.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ride that is ${ride.status}`,
      });
    }
    
    const {
      startLocation,
      endLocation,
      departureTime,
      availableSeats,
      fare,
      description,
    } = req.body;
    
    // Update fields
    if (startLocation) ride.startLocation = startLocation;
    if (endLocation) ride.endLocation = endLocation;
    if (departureTime) ride.departureTime = departureTime;
    if (availableSeats) ride.availableSeats = availableSeats;
    if (fare) ride.fare = fare;
    if (description !== undefined) ride.description = description;
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ride status
// @route   PUT /api/rides/:id/status
// @access  Private/Driver or Admin
exports.updateRideStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { status } = req.body;
    
    if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    let ride = await Ride.findById(req.params.id);
    
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
        message: 'Not authorized to update this ride',
      });
    }
    
    // Update status
    ride.status = status;
    
    // If ride is completed or cancelled, update all pending bookings to rejected
    if (status === 'completed' || status === 'cancelled') {
      await Booking.updateMany(
        { 
          ride: ride._id, 
          status: 'pending'
        },
        { 
          status: 'rejected' 
        }
      );
    }
    
    // If ride is completed, update all accepted bookings to completed
    if (status === 'completed') {
      await Booking.updateMany(
        { 
          ride: ride._id, 
          status: 'accepted'
        },
        { 
          status: 'completed' 
        }
      );
    }
    
    await ride.save();
    
    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ride
// @route   DELETE /api/rides/:id
// @access  Private/Driver or Admin
exports.deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
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
        message: 'Not authorized to delete this ride',
      });
    }
    
    // Can't delete a ride that is in progress or completed
    if (['in-progress', 'completed'].includes(ride.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a ride that is ${ride.status}`,
      });
    }
    
    // Delete all bookings associated with this ride
    await Booking.deleteMany({ ride: ride._id });
    
    await ride.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Ride deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get rides created by logged in driver
// @route   GET /api/rides/my-rides
// @access  Private/Driver
exports.getMyRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    
    // Check if user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can access my-rides',
      });
    }
    
    const query = { driver: req.user.id };
    if (status) {
      query.status = status;
    }
    
    const options = {
      page,
      limit,
      sort: { departureTime: -1 },
      populate: {
        path: 'bookings',
        select: 'rider status seats totalFare',
        populate: {
          path: 'rider',
          select: 'name profilePicture',
        },
      },
    };
    
    const rides = await Ride.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: rides,
    });
  } catch (error) {
    next(error);
  }
};