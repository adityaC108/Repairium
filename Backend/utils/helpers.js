import crypto from 'crypto';

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate unique ID
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate pincode (Indian)
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

// Paginate results
export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Create pagination response
export const createPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate slug from string
export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Format date
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Retry function with exponential backoff
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... attempts left: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retry(fn, retries - 1, delay * 2);
  }
};

// Validate coordinates
export const isValidCoordinates = (lat, lon) => {
  return isFinite(lat) && isFinite(lon) && 
         Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
};

// Convert address to coordinates (mock implementation)
export const geocodeAddress = async (address) => {
  // In a real implementation, you would use a geocoding service like Google Maps API
  // For now, return dummy coordinates
  return {
    latitude: 28.6139,
    longitude: 77.2090
  };
};

// Generate OTP
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

// Mask sensitive information
export const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
};

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Function to configure Cloudinary (called when needed)
const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

/**
 * Uploads a file to Cloudinary
 * @param {string} localFilePath - Path to the local file
 * @param {string} folder - Folder in Cloudinary where the file should be uploaded
 * @param {number} height - Optional height for image resizing
 * @param {number} quality - Optional quality for image compression (1-100)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = async (localFilePath, folder = 'Repairium', height, quality) => {
    try {
        // Configure Cloudinary before using it
        configureCloudinary();
        
        if (!localFilePath) {
            throw new Error('Local file path is required');
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            throw new Error('File not found');
        }

        // Upload options
        const options = {
            folder: folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            overwrite: true,
        };

        // Add height and quality if provided
        if (height) options.height = height;
        if (quality) options.quality = quality;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, options);

        // Remove locally saved temporary file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Remove locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error('Error uploading to Cloudinary:', error);
        throw new Error(error?.message || 'Error uploading file to Cloudinary');
    }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The public ID of the file on Cloudinary
 * @param {string} resourceType - Type of the resource (image, video, raw, etc.)
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        if (!publicId) {
            throw new Error('Public ID is required');
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });

        if (result.result !== 'ok') {
            throw new Error('Failed to delete file from Cloudinary');
        }

        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Error deleting file from Cloudinary');
    } finally {
        // Remove locally saved temporary file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    }
};

// Export Cloudinary instance in case it's needed elsewhere
export { cloudinary };
