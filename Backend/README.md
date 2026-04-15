# Repairum Backend

A comprehensive MERN stack backend for a quick service booking platform with role-based authentication, payment processing, and real-time notifications.

## Features

### **Enhanced Authentication System**
- **Multi-role authentication**: User, Admin, and Technician roles
- **Cookie-based authentication** with automatic token refresh
- **JWT-based authentication** with role-based middleware
- **Account verification** via email (GET/POST support)
- **Password reset** functionality
- **Login attempt tracking** for admin accounts
- **Cookie-parser integration** for seamless frontend integration

### **Smart Booking System**
- **Auto-fetch appliance details** when user selects appliance
- **User-friendly workflow**: Category Device Issue Address Book
- **First-come-first-served technician assignment**
- **Geolocation-based technician notifications**
- **Real-time booking status tracking**
- **Automatic pricing calculations** from appliance data

### **Robust Payment Integration**
- **Razorpay integration** for secure payments
- **Automatic split payments**: 30% to admin, 70% to technician
- **Multiple payment methods**: Card, NetBanking, UPI, Wallet, EMI
- **Refund processing** with webhook support
- **Payment history** and earnings tracking
- **Cookie-based authentication** for payment routes

### **Advanced Notification System**
- **Real-time notifications** via Socket.io
- **Multi-channel delivery**: In-app, Email, SMS, Push
- **Event-based notifications** for bookings, payments, and system events
- **Technician assignment notifications**
- **User notification when technician accepts booking

### **Compliance Management**
- **Appliance catalog** with categories (small/large)
- **Admin-controlled appliance management** with image upload
- **Technician skill matching**
- **Geolocation-based service area management**
- **Service pricing** with emergency charges
- **Validation for all required fields**

## Project Structure

```
Backend/
|--------------------------------------------------------------------------
| Controllers
|--------------------------------------------------------------------------
| - authController.js     # Authentication with cookie support
| - applianceController.js # Appliance management with auto-fetch
| - bookingController.js   # Smart booking workflow
| - paymentController.js   # Payment processing with validation
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
| - auth.js              # Cookie-based authentication middleware
| - validation.js        # Updated validation rules
| - notification.js      # Notification handling
|--------------------------------------------------------------------------
| Models
|--------------------------------------------------------------------------
| - User.js              # User schema
| - Admin.js             # Admin schema with isActive field
| - Technician.js        # Technician schema
| - Appliance.js         # Appliance schema with pricing
| - Booking.js           # Booking schema with workflow
| - Payment.js           # Payment schema with split payments
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
| - auth.js              # Authentication routes with GET/POST support
| - appliance.js         # Appliance routes with file upload
| - booking.js           # Booking workflow routes
| - payment.js           # Payment routes with cookie auth
|--------------------------------------------------------------------------
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Repairum/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/repairum

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### **Authentication Routes**

#### User Authentication
- `POST /api/auth/user/register` - Register new user
- `POST /api/auth/user/login` - User login (sets cookies)
- `GET /api/auth/me` - Get current user profile

#### Admin Authentication
- `POST /api/auth/admin/register` - Register new admin
- `POST /api/auth/admin/login` - Admin login (sets cookies)

#### Technician Authentication
- `POST /api/auth/technician/register` - Register new technician
- `POST /api/auth/technician/login` - Technician login (sets cookies)

#### Common Routes
- `POST /api/auth/logout` - Logout (clears cookies)
- `GET /api/auth/verify-email?token=xxx&role=user` - Email verification (GET)
- `POST /api/auth/verify-email` - Email verification (POST)

### **Booking Routes**

#### User Booking Management
- `POST /api/bookings/user/bookings` - Create booking (auto-fetch appliance details)
- `GET /api/bookings/user/bookings/:bookingId` - Get booking details
- `DELETE /api/bookings/user/bookings/:bookingId` - Cancel booking

#### Technician Booking Management
- `GET /api/bookings/technician/available-bookings` - Get available bookings in service area
- `POST /api/bookings/technician/bookings/:bookingId/accept` - Accept booking (first-come-first-served)
- `GET /api/bookings/technician/bookings/:bookingId` - Get booking details

#### Admin Booking Management
- `DELETE /api/bookings/admin/bookings/:bookingId` - Cancel booking (admin)

### **Appliance Management (Admin Only)**
- `GET /api/appliances/` - Get all appliances
- `POST /api/appliances/` - Create new appliance (with image upload)
- `POST /api/appliances/without-image` - Create appliance (JSON only)
- `GET /api/appliances/:applianceId` - Get appliance by ID
- `PUT /api/appliances/:applianceId` - Update appliance (with image upload)
- `PUT /api/appliances/:applianceId/without-image` - Update appliance (JSON only)
- `DELETE /api/appliances/:applianceId` - Delete appliance
- `GET /api/appliances/categories` - Get categories
- `GET /api/appliances/brands` - Get brands
- `GET /api/appliances/models` - Get models
- `GET /api/appliances/featured` - Get featured appliances
- `GET /api/appliances/search` - Search appliances

### **Payment Routes**
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/payments/user/history` - Get user payment history
- `GET /api/payments/technician/earnings` - Get technician earnings
- `POST /api/payments/:paymentId/refund` - Refund payment (Admin only)
- `POST /api/payments/webhook` - Razorpay webhook handler

## Enhanced Booking Flow

### **User Workflow**
1. **Select Category**: Large or Small appliances
2. **Select Device**: From appliance catalog
3. **Select Issue**: Optional from common issues list
4. **Add Address**: Service location with coordinates
5. **Book Technician**: One-click booking creation
6. **Auto-Fetch Details**: Pricing and appliance info automatically loaded
7. **Wait for Assignment**: System notifies nearby technicians
8. **Get Technician Details**: When technician accepts booking

### **Technician Workflow**
1. **View Available Bookings**: In service area (50km radius)
2. **Accept Booking**: First-come-first-served assignment
3. **Get User Details**: Contact information and service details
4. **Complete Service**: Update booking status
5. **Receive Payment**: Automatic split payment processing

### **System Features**
- **Automatic Pricing**: Based on appliance base price + service charge
- **Emergency Charges**: Applied when serviceType is 'emergency'
- **Geolocation Matching**: Find technicians in service area
- **Real-time Notifications**: Socket.io integration
- **Race Condition Prevention**: Atomic booking assignment

## Authentication Enhancements

### **Cookie-Based Auth**
- **Automatic Token Refresh**: Seamless user experience
- **Header Fallback**: Still supports Authorization header
- **Cross-Origin Support**: Works with frontend applications
- **Secure Cookie Settings**: HttpOnly, Secure, SameSite

### **Middleware Updates**
- **`authenticate`**: Generic auth with cookie support
- **`authenticateUser`**: User-specific auth with cookie support
- **`authenticateAdmin`**: Admin auth with cookie support
- **`authenticateTechnician`**: Technician auth with cookie support

## Payment System

### **Enhanced Validation**
- **Booking Validation**: Check booking and technician assignment
- **Amount Validation**: Positive numbers only
- **Method Validation**: Supported payment methods only

### **Split Payment Processing**
- **Automatic Distribution**: 30% admin, 70% technician
- **Refund Support**: Admin can process refunds
- **Earnings Tracking**: Technician earnings dashboard
- **Payment History**: Complete transaction records

## Security Features

### **Enhanced Authentication**
- **JWT tokens** with automatic refresh
- **Role-based access control** (RBAC)
- **Cookie-parser integration** for seamless auth
- **Account lockout** after failed attempts
- **Email verification** for account activation

### **Input Validation**
- **Express-validator** for all endpoints
- **Sanitization** of user inputs
- **File upload restrictions** (images only)
- **Rate limiting** to prevent abuse

### **API Security**
- **CORS** configuration
- **Helmet.js** for security headers
- **Environment variable** protection
- **Cookie security** settings

## Recent Updates

### **Authentication System**
- **Added cookie-based authentication** across all routes
- **Fixed `addedBy` field** in appliance creation
- **Updated validation rules** for booking system
- **Enhanced error handling** and logging

### **Booking System**
- **Implemented smart booking workflow** with auto-fetch
- **Added technician acceptance** functionality
- **Geolocation-based technician matching**
- **Real-time notifications** for booking updates

### **Payment System**
- **Enhanced validation** for payment creation
- **Cookie authentication** support for payment routes
- **Booking validation** in payment controller
- **Improved error handling** and responses

## Database Models

### **Updated Booking Model**
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

### Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

### Optional Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `EMAIL_HOST` - SMTP server
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password

## Error Handling

The API uses consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [ // Validation errors only
    {
      "field": "fieldName",
      "message": "Error message",
      "value": "submitted value"
    }
  ],
  "error": "Detailed error (development only)"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and queries, please contact the development team.
