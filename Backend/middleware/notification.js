import Notification from '../models/Notification.js';
import nodemailer from 'nodemailer';

// Middleware to send notifications after certain actions
export const sendNotification = async (data) => {
  try {
    const notification = await Notification.createNotification(data);
    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
};

// Send booking notifications
export const sendBookingNotification = async (booking, type, additionalData = {}) => {
  const notifications = [];
  
  try {
    // User notification
    const userNotificationData = {
      title: getBookingNotificationTitle(type, 'user'),
      message: getBookingNotificationMessage(type, 'user', booking),
      type: 'booking',
      recipient: booking.user,
      recipientModel: 'User',
      relatedEntity: {
        entityType: 'Booking',
        entityId: booking._id
      },
      channels: ['in_app', 'email'],
      actionUrl: `/bookings/${booking._id}`,
      actionText: 'View Booking',
      metadata: { bookingId: booking.bookingId, ...additionalData }
    };
    
    notifications.push(await sendNotification(userNotificationData));
    
    // Technician notification
    const technicianNotificationData = {
      title: getBookingNotificationTitle(type, 'technician'),
      message: getBookingNotificationMessage(type, 'technician', booking),
      type: 'booking',
      recipient: booking.technician,
      recipientModel: 'Technician',
      relatedEntity: {
        entityType: 'Booking',
        entityId: booking._id
      },
      channels: ['in_app', 'email', 'sms'],
      actionUrl: `/bookings/${booking._id}`,
      actionText: 'View Booking',
      metadata: { bookingId: booking.bookingId, ...additionalData }
    };
    
    notifications.push(await sendNotification(technicianNotificationData));
    
    return notifications;
  } catch (error) {
    console.error('Failed to send booking notifications:', error);
    throw error;
  }
};

// Send payment notifications
export const sendPaymentNotification = async (payment, type) => {
  const notifications = [];
  
  try {
    // User notification
    const userNotificationData = {
      title: getPaymentNotificationTitle(type, 'user'),
      message: getPaymentNotificationMessage(type, 'user', payment),
      type: 'payment',
      recipient: payment.user,
      recipientModel: 'User',
      relatedEntity: {
        entityType: 'Payment',
        entityId: payment._id
      },
      channels: ['in_app', 'email'],
      actionUrl: `/payments/${payment._id}`,
      actionText: 'View Payment',
      metadata: { paymentId: payment.paymentId }
    };
    
    notifications.push(await sendNotification(userNotificationData));
    
    // Technician notification
    if (payment.status === 'paid') {
      const technicianNotificationData = {
        title: getPaymentNotificationTitle(type, 'technician'),
        message: getPaymentNotificationMessage(type, 'technician', payment),
        type: 'payment',
        recipient: payment.technician,
        recipientModel: 'Technician',
        relatedEntity: {
          entityType: 'Payment',
          entityId: payment._id
        },
        channels: ['in_app', 'email'],
        actionUrl: `/earnings`,
        actionText: 'View Earnings',
        metadata: { paymentId: payment.paymentId, amount: payment.amount.technicianShare }
      };
      
      notifications.push(await sendNotification(technicianNotificationData));
    }
    
    return notifications;
  } catch (error) {
    console.error('Failed to send payment notifications:', error);
    throw error;
  }
};

// Send system notifications
export const sendSystemNotification = async (data) => {
  try {
    const notificationData = {
      title: data.title,
      message: data.message,
      type: 'system',
      priority: data.priority || 'medium',
      recipient: data.recipient,
      recipientModel: data.recipientModel,
      channels: data.channels || ['in_app'],
      metadata: data.metadata || {}
    };
    
    return await sendNotification(notificationData);
  } catch (error) {
    console.error('Failed to send system notification:', error);
    throw error;
  }
};

// Helper functions for notification titles and messages
function getBookingNotificationTitle(type, recipientType) {
  const titles = {
    user: {
      created: 'Booking Created',
      confirmed: 'Booking Confirmed',
      assigned: 'Technician Assigned',
      in_progress: 'Service Started',
      completed: 'Service Completed',
      cancelled: 'Booking Cancelled',
      rescheduled: 'Booking Rescheduled'
    },
    technician: {
      created: 'New Booking Request',
      confirmed: 'Booking Confirmed',
      assigned: 'New Booking Assigned',
      in_progress: 'Service Started',
      completed: 'Service Completed',
      cancelled: 'Booking Cancelled',
      rescheduled: 'Booking Rescheduled'
    }
  };
  
  return titles[recipientType]?.[type] || 'Booking Update';
}

function getBookingNotificationMessage(type, recipientType, booking) {
  const messages = {
    user: {
      created: `Your booking ${booking.bookingId} has been created successfully.`,
      confirmed: `Your booking ${booking.bookingId} has been confirmed.`,
      assigned: `Technician has been assigned to your booking ${booking.bookingId}.`,
      in_progress: `Service for your booking ${booking.bookingId} has started.`,
      completed: `Service for your booking ${booking.bookingId} has been completed successfully.`,
      cancelled: `Your booking ${booking.bookingId} has been cancelled.`,
      rescheduled: `Your booking ${booking.bookingId} has been rescheduled.`
    },
    technician: {
      created: `New booking request ${booking.bookingId} received.`,
      confirmed: `Booking ${booking.bookingId} has been confirmed.`,
      assigned: `You have been assigned to booking ${booking.bookingId}.`,
      in_progress: `Service for booking ${booking.bookingId} has started.`,
      completed: `Service for booking ${booking.bookingId} has been completed.`,
      cancelled: `Booking ${booking.bookingId} has been cancelled.`,
      rescheduled: `Booking ${booking.bookingId} has been rescheduled.`
    }
  };
  
  return messages[recipientType]?.[type] || `Update for booking ${booking.bookingId}.`;
}

function getPaymentNotificationTitle(type, recipientType) {
  const titles = {
    user: {
      created: 'Payment Initiated',
      paid: 'Payment Successful',
      failed: 'Payment Failed',
      refunded: 'Payment Refunded'
    },
    technician: {
      paid: 'Payment Received',
      failed: 'Payment Failed',
      refunded: 'Payment Refunded'
    }
  };
  
  return titles[recipientType]?.[type] || 'Payment Update';
}

function getPaymentNotificationMessage(type, recipientType, payment) {
  const messages = {
    user: {
      created: `Payment of ₹${payment.amount.total} has been initiated for your booking.`,
      paid: `Payment of ₹${payment.amount.total} has been processed successfully.`,
      failed: `Payment of ₹${payment.amount.total} has failed. Please try again.`,
      refunded: `Refund of ₹${payment.amount.total} has been processed.`
    },
    technician: {
      paid: `You have received ₹${payment.amount.technicianShare} for completed service.`,
      failed: `Payment processing failed for booking.`,
      refunded: `Payment has been refunded to the customer.`
    }
  };
  
  return messages[recipientType]?.[type] || `Payment update for ${payment.paymentId}.`;
}

// Middleware to automatically send notifications
export const notificationMiddleware = (notificationType, getNotificationData) => {
  return async (req, res, next) => {
    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json to intercept the response
    res.json = async function(data) {
      // Only send notifications on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const notificationData = getNotificationData(req, data);
          if (notificationData) {
            await sendNotification(notificationData);
          }
        } catch (error) {
          console.error('Failed to send notification:', error);
          // Don't fail the request if notification fails
        }
      }
      
      // Call original json function
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Send Email using Nodemailer
// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendEmail = async (email, subject, message, isHtml = false) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Repairum'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      [isHtml ? 'html' : 'text']: message
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${email}: ${subject}`);
    console.log(`Message ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId,
      to: email,
      subject,
      response: result.response
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send HTML Email Template
export const sendHtmlEmail = async (email, subject, htmlContent) => {
  return sendEmail(email, subject, htmlContent, true);
};

// Send Email with Template
export const sendTemplatedEmail = async (email, template, data = {}) => {
  try {
    const templates = {
      verification: {
        subject: 'Verify Your Email Address',
        html: generateVerificationTemplate(data)
      },
      passwordReset: {
        subject: 'Reset Your Password',
        html: generatePasswordResetTemplate(data)
      },
      welcome: {
        subject: 'Welcome to Repairum',
        html: generateWelcomeTemplate(data)
      },
      bookingConfirmation: {
        subject: 'Booking Confirmed',
        html: generateBookingConfirmationTemplate(data)
      },
      bookingCreated: {
        subject: 'Booking Created Successfully',
        html: generateBookingCreatedTemplate(data)
      },
      technicianAssigned: {
        subject: 'Technician Assigned to Your Booking',
        html: generateTechnicianAssignedTemplate(data)
      },
      newServiceRequest: {
        subject: 'New Service Request in Your Area',
        html: generateNewServiceRequestTemplate(data)
      },
      bookingCancelled: {
        subject: 'Booking Cancelled',
        html: generateBookingCancelledTemplate(data)
      },
      bookingStatusUpdate: {
        subject: 'Booking Status Updated',
        html: generateBookingStatusUpdateTemplate(data)
      },
      serviceRequestResponse: {
        subject: 'Service Request Response',
        html: generateServiceRequestResponseTemplate(data)
      },
      passwordChanged: {
        subject: 'Password Changed Successfully',
        html: generatePasswordChangedTemplate(data)
      }
    };

    const emailTemplate = templates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    return await sendHtmlEmail(email, emailTemplate.subject, emailTemplate.html);
  } catch (error) {
    console.error('Failed to send templated email:', error);
    throw error;
  }
};

// Email Template Generators
const generateVerificationTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hello ${data.firstName || 'User'},</p>
          <p>Thank you for registering with Repairum. To complete your registration, please verify your email address.</p>
          <p>Your verification code is: <strong>${data.verificationToken}</strong></p>
          <p>Or click the button below:</p>
          <a href="${data.verificationUrl || '#'}" class="button">Verify Email</a>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with Repairum, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordResetTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello ${data.firstName || 'User'},</p>
          <p>We received a request to reset your password for your Repairum account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetUrl}" class="button">Reset Password</a>
          <p>This password reset link will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateWelcomeTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Repairum</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Repairum!</h1>
        </div>
        <div class="content">
          <p>Hello ${data.firstName},</p>
          <p>Thank you for joining Repairum! Your account has been successfully created.</p>
          <p>You can now:</p>
          <ul>
            <li>Book appliance repair services</li>
            <li>Track your service requests</li>
            <li>Manage your profile</li>
            <li>View service history</li>
          </ul>
          <a href="${data.loginUrl || '#'}" class="button">Get Started</a>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateBookingConfirmationTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed</h1>
        </div>
        <div class="content">
          <p>Hello ${data.firstName},</p>
          <p>Your booking has been confirmed! Here are the details:</p>
          <div class="booking-details">
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Technician:</strong> ${data.technician}</p>
          </div>
          <a href="${data.bookingUrl || '#'}" class="button">View Booking</a>
          <p>Thank you for choosing Repairum!</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePasswordChangedTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
          <p>Hello ${data.firstName || 'User'},</p>
          <p>Your password for your Repairum account has been successfully changed.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p>For security reasons, please:</p>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Don't share your password with anyone</li>
            <li>Enable two-factor authentication if available</li>
          </ul>
          <p>Thank you for keeping your account secure.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send SMS (mock implementation - integrate with actual SMS service)
export const sendSMS = async (phone, message) => {
  try {
    // In production, integrate with services like Twilio, MessageBird, etc.
    console.log(`Sending SMS to ${phone}: ${message}`);
    
    // Mock implementation - replace with actual SMS service
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      to: phone
    };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
};

// Send Push Notification (mock implementation - integrate with actual push service)
export const sendPushNotification = async (userId, title, message, data = {}) => {
  try {
    // In production, integrate with services like Firebase Cloud Messaging, OneSignal, etc.
    console.log(`Sending push notification to user ${userId}: ${title}`);
    console.log(`Message: ${message}`);
    
    // Store notification in database for in-app display
    const notificationData = {
      title,
      message,
      type: 'push',
      recipient: userId,
      recipientModel: 'User', // This should be dynamic based on user role
      channels: ['in_app', 'push'],
      metadata: data
    };
    
    await sendNotification(notificationData);
    
    return {
      success: true,
      notificationId: `push_${Date.now()}`,
      userId
    };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
};

// Additional Email Template Generators
const generateBookingCreatedTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Created</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Created Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>Your booking has been created successfully! We're finding the best technicians in your area.</p>
          <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Appliance:</strong> ${data.applianceName}</p>
            <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
            <p><strong>Total Amount:</strong> ₹${data.finalAmount}</p>
          </div>
          <p>You will receive notifications once a technician accepts your booking.</p>
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateTechnicianAssignedTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Technician Assigned</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .technician-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Technician Assigned to Your Booking</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>Great news! A technician has been assigned to your booking.</p>
          <div class="technician-details">
            <h3>Technician Details:</h3>
            <p><strong>Name:</strong> ${data.technicianName}</p>
            <p><strong>Email:</strong> ${data.technicianEmail}</p>
            <p><strong>Phone:</strong> ${data.technicianPhone}</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Scheduled Date:</strong> ${data.preferredDate}</p>
            <p><strong>Scheduled Time:</strong> ${data.preferredTime}</p>
          </div>
          <p>The technician will contact you shortly to confirm the details.</p>
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateNewServiceRequestTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Service Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .cta-button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Service Request in Your Area</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>A new service request is available in your service area. Be the first to accept!</p>
          <div class="booking-details">
            <h3>Service Request Details:</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Appliance:</strong> ${data.applianceName}</p>
            <p><strong>Service Type:</strong> ${data.serviceType}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Urgency:</strong> ${data.urgency}</p>
            <p><strong>Amount:</strong> ₹${data.finalAmount}</p>
            <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p><strong>Preferred Time:</strong> ${data.preferredTime}</p>
          </div>
          <a href="#" class="cta-button">Accept This Booking</a>
          <p>First technician to accept gets the booking!</p>
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateBookingCancelledTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>Your booking has been cancelled.</p>
          <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Cancelled By:</strong> ${data.cancelledBy}</p>
          </div>
          <p>If you need to reschedule, please create a new booking.</p>
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateBookingStatusUpdateTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status-update { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Status Updated</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>Your booking status has been updated.</p>
          <div class="status-update">
            <h3>Status Update:</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>New Status:</strong> ${data.status}</p>
            <p><strong>Technician:</strong> ${data.technicianName}</p>
          </div>
          <p>You can track your booking status in your dashboard.</p>
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateServiceRequestResponseTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Request Response</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${data.response === 'accept' ? '#4CAF50' : '#f44336'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .response-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Service Request ${data.response === 'accept' ? 'Accepted' : 'Rejected'}</h1>
        </div>
        <div class="content">
          <p>Hi ${data.firstName},</p>
          <p>Your service request has been ${data.response === 'accept' ? 'accepted' : 'rejected'}.</p>
          <div class="response-details">
            <h3>Request Details:</h3>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Technician:</strong> ${data.technicianName}</p>
            <p><strong>Response:</strong> ${data.response === 'accept' ? 'Accepted' : 'Rejected'}</p>
          </div>
          ${data.response === 'accept' ? '<p>The technician will contact you shortly to schedule the service.</p>' : '<p>You can create a new booking request or wait for other technicians to respond.</p>'}
        </div>
        <div class="footer">
          <p>© 2026 Repairum. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
