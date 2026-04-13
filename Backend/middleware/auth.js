import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Technician from '../models/Technician.js';

// Generate JWT Token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT Token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generic authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = verifyToken(token);
    
    console.log('Decoded token:', decoded); // Debug log
    
    let user = null;
    
    // Find user based on role
    switch (decoded.role) {
      case 'user':
        console.log('Looking for user with ID:', decoded.userId); // Debug log
        user = await User.findById(decoded.userId);
        break;
      case 'admin':
        console.log('Looking for admin with ID:', decoded.userId); // Debug log
        user = await Admin.findById(decoded.userId);
        break;
      case 'technician':
        console.log('Looking for technician with ID:', decoded.userId); // Debug log
        user = await Technician.findById(decoded.userId);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token role.'
        });
    }
    
    console.log('Found user:', user ? 'Yes' : 'No'); // Debug log
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    req.user = user;
    req.userRole = decoded.role;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      // Try to refresh the token automatically
      try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
          const decoded = verifyToken(refreshToken);
          let user = null;
          
          switch (decoded.role) {
            case 'user':
              user = await User.findById(decoded.userId);
              break;
            case 'admin':
              user = await Admin.findById(decoded.userId);
              break;
            case 'technician':
              user = await Technician.findById(decoded.userId);
              break;
          }
          
          if (user && user.isActive) {
            const { accessToken, refreshToken: newRefreshToken } = generateToken(user._id, decoded.role);
            setRefreshTokenCookie(res, newRefreshToken);
            
            return res.status(401).json({
              success: false,
              message: 'Token expired. New token generated.',
              data: {
                accessToken,
                refreshToken: newRefreshToken
              }
            });
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Role-based authentication middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No role found.'
      });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

// User-specific authentication
export const authenticateUser = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User role required.'
      });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }
    
    req.user = user;
    req.userRole = 'user';
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('User authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Admin-specific authentication
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const admin = await Admin.findById(decoded.userId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin not found.'
      });
    }
    
    req.user = admin;
    req.userRole = 'admin';
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Technician-specific authentication
export const authenticateTechnician = async (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (decoded.role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Technician role required.'
      });
    }
    
const technician = await Technician.findById(decoded.userId).select('+bankDetails');
    
    if (!technician || !technician.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or technician not found.'
      });
    }
    
    req.user = technician;
    req.userRole = 'technician';
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Technician authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Permission-based middleware for admins
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    // Super admin has all permissions
    if (req.user.isSuperAdmin) {
      return next();
    }
    
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission '${permission}' required.`
      });
    }
    
    next();
  };
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account not verified. Please verify your email first.'
    });
  }
  
  next();
};

// Check if technician is verified
export const requireTechnicianVerification = (req, res, next) => {
  if (req.userRole === 'technician' && req.user.verificationStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Technician account not verified. Please wait for approval.'
    });
  }
  
  next();
};
