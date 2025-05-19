const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const BookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    dropLocation: {
      address: { type: String, required: true },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    totalFare: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

BookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
BookingSchema.index({ 'dropLocation.coordinates': '2dsphere' });

BookingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Booking', BookingSchema);