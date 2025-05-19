const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '1234567890',
  password: 'admin123',
  role: 'admin',
};

const riderUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567891',
    password: 'password123',
    role: 'rider',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567892',
    password: 'password123',
    role: 'rider',
    profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

const driverUsers = [
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '1234567893',
    password: 'password123',
    role: 'driver',
    profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
    driverDetails: {
      carModel: 'Toyota Camry',
      carColor: 'Blue',
      licensePlate: 'ABC123',
      licenseNumber: 'DL789456',
    },
  },
  {
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '1234567894',
    password: 'password123',
    role: 'driver',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    driverDetails: {
      carModel: 'Honda Civic',
      carColor: 'Red',
      licensePlate: 'XYZ789',
      licenseNumber: 'DL123456',
    },
  },
];

// Seed DB
const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Ride.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('Data cleared...');
    
    // Create users with hashed passwords
    const hashedAdminPassword = await bcrypt.hash(adminUser.password, 10);
    const admin = await User.create({
      ...adminUser,
      password: hashedAdminPassword,
    });
    console.log('Admin user created');
    
    const riders = [];
    for (const rider of riderUsers) {
      const hashedPassword = await bcrypt.hash(rider.password, 10);
      const newRider = await User.create({
        ...rider,
        password: hashedPassword,
      });
      riders.push(newRider);
    }
    console.log('Rider users created');
    
    const drivers = [];
    for (const driver of driverUsers) {
      const hashedPassword = await bcrypt.hash(driver.password, 10);
      const newDriver = await User.create({
        ...driver,
        password: hashedPassword,
      });
      drivers.push(newDriver);
    }
    console.log('Driver users created');
    
    // Create rides
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    const rides = [
      {
        driver: drivers[0]._id,
        startLocation: {
          address: 'Downtown',
          coordinates: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
        },
        endLocation: {
          address: 'Airport',
          coordinates: {
            type: 'Point',
            coordinates: [-122.3786, 37.6213],
          },
        },
        departureTime: tomorrow,
        availableSeats: 3,
        fare: 25,
        description: 'Regular commute to the airport',
        status: 'scheduled',
      },
      {
        driver: drivers[1]._id,
        startLocation: {
          address: 'Shopping Mall',
          coordinates: {
            type: 'Point',
            coordinates: [-122.4101, 37.7834],
          },
        },
        endLocation: {
          address: 'University',
          coordinates: {
            type: 'Point',
            coordinates: [-122.2585, 37.8719],
          },
        },
        departureTime: dayAfter,
        availableSeats: 2,
        fare: 15,
        description: 'Going to university campus',
        status: 'scheduled',
      },
    ];
    
    const createdRides = await Ride.insertMany(rides);
    console.log('Rides created');
    
    // Create bookings
    const bookings = [
      {
        ride: createdRides[0]._id,
        rider: riders[0]._id,
        seats: 1,
        pickupLocation: {
          address: 'Downtown Station',
          coordinates: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
        },
        dropLocation: {
          address: 'Terminal 2',
          coordinates: {
            type: 'Point',
            coordinates: [-122.3786, 37.6213],
          },
        },
        totalFare: 25,
        status: 'pending',
      },
      {
        ride: createdRides[1]._id,
        rider: riders[1]._id,
        seats: 1,
        pickupLocation: {
          address: 'Mall Entrance',
          coordinates: {
            type: 'Point',
            coordinates: [-122.4101, 37.7834],
          },
        },
        dropLocation: {
          address: 'Campus Gate',
          coordinates: {
            type: 'Point',
            coordinates: [-122.2585, 37.8719],
          },
        },
        totalFare: 15,
        status: 'pending',
      },
    ];
    
    await Booking.insertMany(bookings);
    console.log('Bookings created');
    
    // Add booking references to rides
    createdRides[0].bookings.push(bookings[0]._id);
    createdRides[1].bookings.push(bookings[1]._id);
    
    await createdRides[0].save();
    await createdRides[1].save();
    
    // Create notifications
    const notifications = [
      // Admin notifications
      {
        user: admin._id,
        title: 'Welcome to Carpooling App',
        message: 'Thank you for joining as an admin. You can manage users, rides and bookings.',
        type: 'info',
        isRead: false
      },
      
      // Rider notifications
      {
        user: riders[0]._id,
        title: 'New Ride Available',
        message: 'A new ride to the Airport is available. Book now!',
        type: 'info',
        relatedId: createdRides[0]._id,
        relatedType: 'ride',
        isRead: false
      },
      {
        user: riders[0]._id,
        title: 'Booking Update',
        message: 'Your booking is pending approval from the driver.',
        type: 'warning',
        relatedId: bookings[0]._id,
        relatedType: 'booking',
        isRead: false
      },
      
      // Driver notifications
      {
        user: drivers[0]._id,
        title: 'New Booking Request',
        message: 'You have a new booking request from John Doe.',
        type: 'success',
        relatedId: bookings[0]._id,
        relatedType: 'booking',
        isRead: false
      },
      {
        user: drivers[1]._id,
        title: 'New Booking Request',
        message: 'You have a new booking request from Jane Smith.',
        type: 'success',
        relatedId: bookings[1]._id,
        relatedType: 'booking',
        isRead: false
      }
    ];
    
    await Notification.insertMany(notifications);
    console.log('Notifications created');
    
    console.log('Data seeding completed!');
    console.log('\nUse these credentials to log in:');
    console.log('Admin: email=admin@example.com, password=admin123');
    console.log('Rider: email=john@example.com, password=password123');
    console.log('Driver: email=bob@example.com, password=password123');
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();