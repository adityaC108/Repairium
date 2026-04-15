import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number starting with 6-9'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('address.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),

  handleValidationErrors
];

// Admin registration validation
export const validateAdminRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number starting with 6-9'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'moderator'])
    .withMessage('Invalid role specified'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),

  handleValidationErrors
];

// Technician registration validation
export const validateTechnicianRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit phone number starting with 6-9'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),

  body('skills.*')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),

  body('experience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),

  body('serviceAreas')
    .isArray({ min: 1 })
    .withMessage('At least one service area is required'),

  body('serviceAreas.*.city')
    .trim()
    .notEmpty()
    .withMessage('Service area city is required'),

  body('serviceAreas.*.state')
    .trim()
    .notEmpty()
    .withMessage('Service area state is required'),

  body('serviceAreas.*.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Service area pincode must be 6 digits'),

  // Target the nested coordinates array specifically
  body('serviceAreas.*.coordinates.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Service area coordinates must be an array of [longitude, latitude]')
    .custom((value) => {
      const [lng, lat] = value;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid longitude or latitude values');
      }
      return true;
    }),

  // Also validate the type field while you're at it
  body('serviceAreas.*.coordinates.type')
    .equals('Point')
    .withMessage('Coordinate type must be "Point"'),

  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Booking validation
export const validateBooking = [
  body('applianceId')
    .notEmpty()
    .withMessage('Appliance ID is required')
    .isMongoId()
    .withMessage('Invalid appliance ID'),

  body('serviceType')
    .trim()
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['regular', 'emergency'])
    .withMessage('Invalid service type'),

  body('issueDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Issue description must be between 10 and 1000 characters'),

  body('serviceAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('serviceAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('serviceAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('serviceAddress.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .isPostalCode('IN')
    .withMessage('Invalid pincode format'),

  body('serviceAddress.coordinates.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),

  body('serviceAddress.coordinates.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be numbers'),

  body('preferredDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Preferred date cannot be in the past');
      }
      return true;
    }),

  body('preferredTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),

  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),

  body('paymentMethod')
    .isIn(['card', 'netbanking', 'upi', 'wallet', 'emi'])
    .withMessage('Invalid payment method'),

  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  // Names
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name too short'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name too short'),
  
  // Phone
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid 10-digit phone'),

  // Skills (Can be Array or String)
  body('skills').optional().custom((value) => {
    if (!Array.isArray(value) && typeof value !== 'string') {
      throw new Error('Skills must be an array or a comma-separated string');
    }
    return true;
  }),

  // Experience
  body('experience').optional().isInt({ min: 0, max: 50 }).withMessage('Experience must be 0-50 years'),

  // Service Areas (If updating the whole array)
  body('serviceAreas').optional().isArray().withMessage('Service areas must be an array'),
  body('serviceAreas.*.pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),

  handleValidationErrors
];

// Review validation
export const validateReview = [
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required')
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('technicianId')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isMongoId()
    .withMessage('Invalid technician ID'),

  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),

  body('review')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Review must be between 10 and 500 characters'),

  handleValidationErrors
];

export const validateBankDetails = [
  body('bankDetails.accountHolder')
    .trim()
    .notEmpty().withMessage('Account holder name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    
  body('bankDetails.accountNumber')
    .trim()
    .notEmpty().withMessage('Account number is required')
    .isNumeric().withMessage('Account number must contain only digits')
    .isLength({ min: 9, max: 18 }).withMessage('Invalid account number length'),

  body('bankDetails.ifscCode')
    .trim()
    .notEmpty().withMessage('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Invalid IFSC code format (e.g., SBIN0123456)'),

  body('bankDetails.bankName')
    .trim()
    .notEmpty().withMessage('Bank name is required'),

  handleValidationErrors
];

// Review response validation
export const validateReviewResponse = [
  body('response')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Response must be between 5 and 500 characters'),

  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),

  handleValidationErrors
];

export const validateOnlineStatus = [
  body('isOnline')
    .isBoolean()
    .withMessage('isOnline must be a boolean value'),
  handleValidationErrors
];

// Email verification validation
export const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),

  body('role')
    .isIn(['user', 'technician'])
    .withMessage('Invalid role specified'),

  handleValidationErrors
];

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),

  body('role')
    .isIn(['user', 'admin', 'technician'])
    .withMessage('Invalid role specified'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  handleValidationErrors
];

// Account deletion validation
export const validateAccountDeletion = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('confirmation')
    .equals('DELETE_MY_ACCOUNT')
    .withMessage('Invalid confirmation text'),

  handleValidationErrors
];

// Document upload validation
export const validateDocumentUpload = [
  body('documentType')
    .isIn(['identity_proof', 'address_proof', 'other'])
    .withMessage('Invalid document type'),

  handleValidationErrors
];

// Issue report validation
export const validateIssueReport = [
  body('type')
    .isIn(['booking', 'payment', 'technician', 'technical'])
    .withMessage('Invalid issue type'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID'),

  body('technicianId')
    .optional()
    .isMongoId()
    .withMessage('Invalid technician ID'),

  handleValidationErrors
];

// Booking status validation
export const validateBookingStatus = [
  body('status')
    .isIn(['confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid booking status'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  handleValidationErrors
];

// Availability validation
export const validateAvailability = [
  body('availability')
    .isArray()
    .withMessage('Availability must be an array'),

  body('availability.*.day')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),

  body('availability.*.startTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),

  body('availability.*.endTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),

  handleValidationErrors
];

// Location validation
export const validateLocation = [
  body('coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),

  handleValidationErrors
];

// User management validation
export const validateUserManagement = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),

  handleValidationErrors
];

// Technician management validation
export const validateTechnicianManagement = [
  body('verificationStatus')
    .isIn(['pending', 'verified', 'rejected'])
    .withMessage('Invalid verification status'),

  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),

  handleValidationErrors
];

// Appliance validation
export const validateAppliance = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Appliance name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Appliance name must be between 2 and 100 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['small', 'large'])
    .withMessage('Category must be either small or large'),

  body('subCategory')
    .trim()
    .notEmpty()
    .withMessage('Sub-category is required'),

  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Brand must be between 2 and 50 characters'),

  body('model')
    .trim()
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters'),

  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),

  body('serviceCharge')
    .isFloat({ min: 0 })
    .withMessage('Service charge must be a positive number'),

  body('estimatedServiceTime')
    .isInt({ min: 15 })
    .withMessage('Estimated service time must be at least 15 minutes'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('emergencyCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Emergency charge must be a positive number'),

  body('warrantyPeriod')
    .optional()
    .isInt({ min: 0, max: 60 })
    .withMessage('Warranty period must be between 0 and 60 months'),

  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),

  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),

  body('commonIssues')
    .optional()
    .isArray()
    .withMessage('Common issues must be an array'),

  body('spareParts')
    .optional()
    .isArray()
    .withMessage('Spare parts must be an array'),

  handleValidationErrors
];

// Appliance status validation
export const validateApplianceStatus = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),

  body('featuredOrder')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Featured order must be a positive integer'),

  handleValidationErrors
];

// Booking cancellation validation
export const validateBookingCancellation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters'),

  handleValidationErrors
];