// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  TECHNICIAN: 'technician'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Payment Status
export const PAYMENT_STATUS = {
  CREATED: 'created',
  ATTEMPTED: 'attempted',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  NETBANKING: 'netbanking',
  UPI: 'upi',
  WALLET: 'wallet',
  EMI: 'emi'
};

// Service Types
export const SERVICE_TYPES = {
  REGULAR: 'regular',
  EMERGENCY: 'emergency'
};

// Appliance Categories
export const APPLIANCE_CATEGORIES = {
  SMALL: 'small',
  LARGE: 'large'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  SYSTEM: 'system'
};

// Notification Priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Notification Channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push'
};

// Admin Permissions
export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_TECHNICIANS: 'manage_technicians',
  MANAGE_APPLIANCES: 'manage_appliances',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  SYSTEM_SETTINGS: 'system_settings'
};

// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Technician Verification Status
export const TECHNICIAN_VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_INACTIVE: 'Account is deactivated',
  ACCOUNT_LOCKED: 'Account is temporarily locked',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PHONE_ALREADY_EXISTS: 'Phone number already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error',
  PAYMENT_FAILED: 'Payment failed',
  BOOKING_NOT_FOUND: 'Booking not found',
  APPLIANCE_NOT_FOUND: 'Appliance not found',
  TECHNICIAN_NOT_AVAILABLE: 'Technician not available'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  PAYMENT_SUCCESS: 'Payment successful',
  PAYMENT_REFUNDED: 'Payment refunded successfully',
  APPLIANCE_CREATED: 'Appliance created successfully',
  APPLIANCE_UPDATED: 'Appliance updated successfully',
  NOTIFICATION_SENT: 'Notification sent successfully'
};

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_INDIAN: /^[6-9]\d{9}$/,
  PINCODE_INDIAN: /^\d{6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME: /^[a-zA-Z\s]+$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  MONGODB_ID: /^[0-9a-fA-F]{24}$/
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d'
};

// Rate Limiting
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5 // For login attempts
};

// Service Time
export const SERVICE_TIME = {
  MIN_SERVICE_TIME: 15, // minutes
  MAX_SERVICE_TIME: 480, // 8 hours
  DEFAULT_SERVICE_TIME: 60 // 1 hour
};

// Payment Split
export const PAYMENT_SPLIT = {
  ADMIN_SHARE: 0.30, // 30%
  TECHNICIAN_SHARE: 0.70 // 70%
};

// Working Hours
export const WORKING_HOURS = {
  START: '09:00',
  END: '18:00',
  BREAK_START: '13:00',
  BREAK_END: '14:00'
};

// Emergency Charges
export const EMERGENCY_CHARGES = {
  MULTIPLIER: 1.5, // 1.5x the normal charge
  MIN_CHARGE: 100 // Minimum emergency charge
};

// Distance
export const DISTANCE = {
  DEFAULT_SERVICE_RADIUS: 10, // km
  MAX_SERVICE_RADIUS: 50, // km
  SEARCH_RADIUS: 25 // km
};
