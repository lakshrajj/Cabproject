const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const RideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    endLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    departureTime: {
      type: Date,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    description: {
      type: String,
      maxlength: 500,
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for geospatial queries
RideSchema.index({ 'startLocation.coordinates': '2dsphere' });
RideSchema.index({ 'endLocation.coordinates': '2dsphere' });

RideSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ride', RideSchema);