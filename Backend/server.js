// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

// Import routes and database
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import technicianRoutes from './routes/technician.js';
import applianceRoutes from './routes/appliance.js';
import bookingRoutes from './routes/booking.js';
import reviewsRoutes from './routes/reviews.js';
import paymentRoutes from './routes/payment.js';
import notificationRoutes from './routes/notification.js';
import connectDB from './config/database.js';

// Connect to database
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true,
}));
app.use(limiter);
app.use(cookieParser()); // Add cookie parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Make io globally accessible
global.io = io;

// Socket.io connection for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join', (userData) => {
    if (userData && userData.userId && userData.userType) {
      const roomName = `${userData.userType}_${userData.userId}`;
      socket.join(roomName);
      socket.join(userData.userId); // Also join generic room for compatibility
      
      // Join role-based rooms
      socket.join(userData.userType); // e.g., 'technician', 'user', 'admin'
      
      console.log(`${userData.userType} ${userData.userId} joined room: ${roomName}`);
      
      // Update online status for technicians
      if (userData.userType === 'technician') {
        socket.broadcast.emit('technician_online', { technicianId: userData.userId });
      }
    }
  });
  
  // Handle technician location updates
  socket.on('update_location', (locationData) => {
    if (locationData && locationData.technicianId) {
      socket.broadcast.emit('technician_location_updated', {
        technicianId: locationData.technicianId,
        coordinates: locationData.coordinates,
        timestamp: new Date()
      });
    }
  });
  
  // Handle technician status updates
  socket.on('update_technician_status', (statusData) => {
    if (statusData && statusData.technicianId) {
      socket.broadcast.emit('technician_status_updated', {
        technicianId: statusData.technicianId,
        status: statusData.status, // online/offline/busy
        timestamp: new Date()
      });
    }
  });
  
  // Handle booking status updates
  socket.on('booking_status_update', (bookingData) => {
    if (bookingData && bookingData.bookingId) {
      // Send to specific rooms based on booking participants
      if (bookingData.userId) {
        io.to(`user_${bookingData.userId}`).emit('booking_updated', bookingData);
      }
      if (bookingData.technicianId) {
        io.to(`technician_${bookingData.technicianId}`).emit('booking_updated', bookingData);
      }
      
      // Also broadcast to all technicians for new booking requests
      if (bookingData.status === 'pending') {
        io.to('technician').emit('new_booking_request', bookingData);
      }
    }
  });
  
  // Handle notification read status
  socket.on('mark_notification_read', (notificationData) => {
    if (notificationData && notificationData.notificationId) {
      socket.broadcast.emit('notification_read', {
        notificationId: notificationData.notificationId,
        userId: notificationData.userId,
        timestamp: new Date()
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Broadcast technician offline status
    // Note: In production, you'd want to track which socket belongs to which technician
    socket.broadcast.emit('user_disconnected', { socketId: socket.id });
  });
  
  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
