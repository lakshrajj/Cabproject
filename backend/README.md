# Local Carpooling App

A local carpooling application backend and admin panel, similar to BlaBlaCar, but designed for a single city region.

## Features

- **User Authentication**:
  - JWT-based authentication
  - Email/phone login
  - Role-based access control (Driver/Rider/Admin)

- **Driver Features**:
  - Post rides with details (pickup, drop, date/time, seats, fare)
  - Accept/reject ride requests
  - View all ride requests
  - Track ride status

- **Rider Features**:
  - Search for available rides
  - Request/book rides
  - Track ride status
  - View booking history

- **Admin Panel**:
  - Dashboard with statistics
  - User management (view/delete/block)
  - Ride management
  - Booking management
  - Manual ride status updates

## Tech Stack

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication
  - Express Validator

- **API Documentation**:
  - Swagger UI

- **Admin Panel**:
  - HTML/CSS/JavaScript
  - Bootstrap 5
  - Vanilla JavaScript (no framework)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd carpooling-app
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
# Copy the sample .env file
cp .env.example .env

# Edit the .env file with your settings
```

4. Seed the database
```
npm run seed
```

5. Start the server
```
# Development mode
npm run dev

# Production mode
npm start
```

6. Access the application
   - API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs
   - Admin Panel: http://localhost:5000/admin

### Admin Credentials (After Seeding)

- Email: admin@example.com
- Password: admin123

### Sample User Credentials (After Seeding)

- **Rider**: 
  - Email: john@example.com
  - Password: password123

- **Driver**:
  - Email: bob@example.com
  - Password: password123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/driver-details` - Update driver details (driver only)
- `PUT /api/users/:id/block` - Block/unblock user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Rides

- `POST /api/rides` - Create a new ride (driver only)
- `GET /api/rides` - Get all rides with filters
- `GET /api/rides/my-rides` - Get rides created by logged in driver
- `GET /api/rides/:id` - Get single ride
- `PUT /api/rides/:id` - Update a ride (driver or admin only)
- `PUT /api/rides/:id/status` - Update ride status (driver or admin only)
- `DELETE /api/rides/:id` - Delete a ride (driver or admin only)

### Bookings

- `POST /api/bookings` - Create a new booking (rider only)
- `GET /api/bookings/ride/:rideId` - Get all bookings for a ride (driver or admin only)
- `GET /api/bookings/my-bookings` - Get bookings made by logged in rider
- `GET /api/bookings/:id` - Get a single booking (rider, driver or admin only)
- `PUT /api/bookings/:id/status` - Update booking status (driver or admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking (rider only)

### Admin

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/recent-users` - Get recent users
- `GET /api/admin/recent-rides` - Get recent rides
- `GET /api/admin/recent-bookings` - Get recent bookings

## License

This project is licensed under the ISC License.