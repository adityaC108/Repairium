import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Technician from '../models/Technician.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { sendEmail, sendSMS, sendPushNotification, sendTemplatedEmail } from '../middleware/notification.js';
import { uploadToCloudinary } from '../utils/helpers.js';
import crypto from 'crypto';

// Generate Access and Refresh Tokens
export const generateTokens = (userId, role) => {
  const accessToken = generateToken(userId, role);
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  return { accessToken, refreshToken };
};

// Set Refresh Token Cookie
export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// Set Access Token Cookie
export const setAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/'
  });
};

// Universal Login for all roles
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user across all models
    let user = null;
    let role = null;

    // Try User model first
    user = await User.findOne({ email }).select('+password');
    if (user) role = 'user';
    // user = false

    // Try Admin model
    if (!user) {
      user = await Admin.findOne({ email }).select('+password');
      if (user) role = 'admin';
    }

    // Try Technician model
    if (!user) {
      user = await Technician.findOne({ email }).select('+password');
      if (user) role = 'technician';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, role);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    // Set access token cookie
    setAccessTokenCookie(res, accessToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send notification for successful login
    await sendPushNotification(user._id, 'Login Successful', `Welcome back, ${user.firstName}!`);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        role,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      coordinates: {
        type: 'Point',
        coordinates: address.coordinates || [0, 0] // [lng, lat]
      }
    };

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      address: userAddress
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, 'user');

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send verification email
    await sendTemplatedEmail(email, 'verification', {
      firstName,
      verificationToken,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&role=user`
    });

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registration successful. Please check your email for verification.',
      data: {
        user,
        role: 'user',
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Admin Registration
export const registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'admin',
      permissions: permissions || ['manage_users', 'manage_technicians', 'manage_appliances']
    });

    await admin.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin._id, 'admin');

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    // Send notification
    await sendTemplatedEmail(email, 'welcome', {
      firstName,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    // Remove password from response
    admin.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Admin registration successful',
      data: {
        user: admin,
        role: 'admin',
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Technician Registration
export const registerTechnician = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, phone, password, 
      skills, experience, address 
    } = req.body;

    const existingTechnician = await Technician.findOne({ email });
    if (existingTechnician) {
      return res.status(400).json({ success: false, message: 'REGISTRY_CONFLICT: Email already exists.' });
    }

    // Mapping service area from provided address and coordinates
    // Assuming the registration form sends the primary address as the first service area
    const serviceAreaNode = {
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      coordinates: {
        type: 'Point',
        coordinates: address.coordinates || [0, 0] // [lng, lat]
      },
      serviceRadius: 10 // Defaulting to 10km as per schema
    };

    const technician = new Technician({
      firstName,
      lastName,
      email,
      phone,
      password,
      skills,
      experience,
      serviceAreas: [serviceAreaNode],
      currentLocation: {
        type: 'Point',
        coordinates: address.coordinates || [0, 0]
      }
    });

    const verificationToken = technician.generateVerificationToken();
    await technician.save();

    const { accessToken, refreshToken } = generateTokens(technician._id, 'technician');
    setRefreshTokenCookie(res, refreshToken);

    await sendTemplatedEmail(email, 'verification', {
      firstName,
      verificationToken,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&role=technician`
    });

    technician.password = undefined;
    res.status(201).json({
      success: true,
      message: 'Technician registration successful. Please check your email for verification.',
      data: {
        user: technician,
        role: 'technician',
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Technician registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    // clear coockies
      const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    };

    // Clear both tokens
    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('accessToken', cookieOptions);



    // Send logout notification
    if (req.user) {
      await sendPushNotification(req.user._id, 'Logged Out', 'You have been successfully logged out.');
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token (simplified - in production, store refresh tokens in database)
    const decoded = verifyToken(refreshToken);

    // Find user based on role
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
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token role'
        });
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user not found'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, decoded.role);

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const { user, userRole } = req;

    // Convert Mongoose document to plain object and remove sensitive information
    const userObject = user.toObject ? user.toObject() : { ...user };
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    delete userObject.__v;

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: userObject,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { user, userRole } = req;

    // Get user with password
    let userWithPassword;
    switch (userRole) {
      case 'user':
        userWithPassword = await User.findById(user._id).select('+password');
        break;
      case 'admin':
        userWithPassword = await Admin.findById(user._id).select('+password');
        break;
      case 'technician':
        userWithPassword = await Technician.findById(user._id).select('+password');
        break;
    }

    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // Send notification
    await sendTemplatedEmail(user.email, 'passwordChanged', {
      firstName: user.firstName
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Reset Password Request
export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user across all models
    let user = null;
    let role = null;

    user = await User.findOne({ email });
    if (user) role = 'user';

    if (!user) {
      user = await Admin.findOne({ email });
      if (user) role = 'admin';
    }

    if (!user) {
      user = await Technician.findOne({ email });
      if (user) role = 'technician';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&role=${role}`;
    await sendTemplatedEmail(email, 'passwordReset', {
      firstName: user.firstName,
      resetUrl
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset link',
      error: error.message
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, role, newPassword } = req.body;


    // Find user by reset token
    let user;
    switch (role) {
      case 'user':
        user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');
        break;
      case 'admin':
        user = await Admin.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');
        break;
      case 'technician':
        user = await Technician.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');
        break;
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail(user.email, 'Password Reset Successful', 'Your password has been reset successfully.');

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
};

// Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    const { user, userRole } = req;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to cloudinary (or any file storage service)
    const avatarUrl = await uploadToCloudinary(req.file.path);

    // Update user's avatar
    let updatedUser;
    switch (userRole) {
      case 'user':
        updatedUser = await User.findByIdAndUpdate(
          user._id,
          { avatar: avatarUrl },
          { new: true }
        );
        break;
      case 'admin':
        updatedUser = await Admin.findByIdAndUpdate(
          user._id,
          { avatar: avatarUrl },
          { new: true }
        );
        break;
      case 'technician':
        updatedUser = await Technician.findByIdAndUpdate(
          user._id,
          { avatar: avatarUrl },
          { new: true }
        );
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl,
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    // Handle both query parameters (GET) and request body (POST)
    const { token, role } = req.query;

    let user;
    switch (role) {
      case 'user':
        user = await User.findOne({ verificationToken: token });
        break;
      case 'technician':
        user = await Technician.findOne({ verificationToken: token });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role for verification'
        });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Send confirmation email
    await sendTemplatedEmail(user.email, 'welcome', {
      firstName: user.firstName,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { user, userRole } = req;
    const updates = req.body;

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    delete updates.verificationToken;
    delete updates.resetPasswordToken;
    delete updates.resetPasswordExpires;

    let updatedUser;
    switch (userRole) {
      case 'user':
        updatedUser = await User.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
        break;
      case 'admin':
        updatedUser = await Admin.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
        break;
      case 'technician':
        updatedUser = await Technician.findByIdAndUpdate(user._id, updates, { new: true, runValidators: true });
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

export default {
  login,
  registerUser,
  registerAdmin,
  registerTechnician,
  logout,
  generateTokens,
  setRefreshTokenCookie,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  resetPasswordRequest,
  resetPassword,
  uploadAvatar,
  verifyEmail,
  updateProfile
};