import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  emailOrPhone: yup
    .string()
    .required('Email or phone number is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Registration validation schema
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    )
    .required('Phone number is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

// Driver details validation schema
export const driverDetailsSchema = yup.object().shape({
  carModel: yup
    .string()
    .required('Car model is required'),
  carColor: yup
    .string()
    .required('Car color is required'),
  licensePlate: yup
    .string()
    .required('License plate is required'),
  licenseNumber: yup
    .string()
    .required('License number is required'),
});

// Create ride validation schema
export const createRideSchema = yup.object().shape({
  startLocation: yup
    .object()
    .shape({
      address: yup.string().required('Start address is required'),
      coordinates: yup
        .object()
        .shape({
          coordinates: yup.array().min(2).required('Start coordinates are required'),
        })
        .required(),
    })
    .required('Start location is required'),
  endLocation: yup
    .object()
    .shape({
      address: yup.string().required('End address is required'),
      coordinates: yup
        .object()
        .shape({
          coordinates: yup.array().min(2).required('End coordinates are required'),
        })
        .required(),
    })
    .required('End location is required'),
  departureTime: yup
    .date()
    .min(new Date(), 'Departure time must be in the future')
    .required('Departure time is required'),
  availableSeats: yup
    .number()
    .min(1, 'Must have at least 1 seat available')
    .required('Available seats is required'),
  fare: yup
    .number()
    .min(0, 'Fare must be a positive number')
    .required('Fare is required'),
  description: yup
    .string(),
});

// Create booking validation schema
export const createBookingSchema = yup.object().shape({
  seats: yup
    .number()
    .min(1, 'Must book at least 1 seat')
    .required('Number of seats is required'),
  pickupLocation: yup
    .object()
    .shape({
      address: yup.string().required('Pickup address is required'),
      coordinates: yup
        .object()
        .shape({
          coordinates: yup.array().min(2).required('Pickup coordinates are required'),
        })
        .required(),
    })
    .required('Pickup location is required'),
  dropLocation: yup
    .object()
    .shape({
      address: yup.string().required('Drop address is required'),
      coordinates: yup
        .object()
        .shape({
          coordinates: yup.array().min(2).required('Drop coordinates are required'),
        })
        .required(),
    })
    .required('Drop location is required'),
});