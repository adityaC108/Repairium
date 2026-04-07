import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import { sendPaymentNotification } from '../middleware/notification.js';

// Initialize Razorpay instance
const initializeRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Create payment order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    let booking = null;
    let technician = null;

    // Validate booking if bookingId is provided
    if (notes?.bookingId) {
      booking = await Booking.findById(notes.bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
    }

    // Validate technician if technicianId is provided
    if (notes?.technicianId) {
      technician = await Technician.findById(notes.technicianId);
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }

      // Check if technician is assigned to this booking
      if (booking && booking.technician?.toString() !== notes.technicianId) {
        return res.status(400).json({
          success: false,
          message: 'Technician is not assigned to this booking'
        });
      }
    }

    // Initialize Razorpay instance
    const razorpay = initializeRazorpay();

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      booking: booking?._id || notes?.bookingId || null,
      user: req.user?._id || req.userId,
      technician: technician?._id || notes?.technicianId || null,
      amount: {
        total: amount,
        adminShare: Math.round(amount * 0.30 * 100) / 100,
        technicianShare: Math.round(amount * 0.70 * 100) / 100,
        currency
      },
      razorpay: {
        orderId: order.id,
        notes: notes || {}
      },
      method: notes?.paymentMethod || 'card',
      status: 'created'
    });


    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Fetch payment details from Razorpay
    const razorpay = initializeRazorpay();
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update payment record
    payment.razorpay.paymentId = razorpay_payment_id;
    payment.razorpay.signature = razorpay_signature;
    payment.status = razorpayPayment.status === 'captured' ? 'paid' : 'failed';
    payment.method = razorpayPayment.method;
    payment.paidAt = new Date();

    if (razorpayPayment.status === 'captured') {
      // Update payment amounts from razorpay
      payment.amount.total = razorpayPayment.amount / 100; // Convert back to rupees
      payment.amount.paidAmount = razorpayPayment.amount / 100;

      // Initialize split payments
      payment.splitPayments = [
        {
          recipient: 'admin',
          amount: payment.amount.adminShare,
          status: 'pending'
        },
        {
          recipient: 'technician',
          amount: payment.amount.technicianShare,
          status: 'pending'
        }
      ];

      // Process split payments immediately
      await processSplitPayments(payment);

      // Update booking payment status
      if (payment.booking) {
        await Booking.findByIdAndUpdate(payment.booking, {
          'payment.status': 'paid',
          'payment.amount': payment.amount.total,
          'payment.paidAmount': payment.amount.total,
          'payment.paymentId': razorpay_payment_id,
          'payment.paymentMethod': razorpayPayment.method,
          'payment.paymentDate': new Date()
        });
      }

      // Send payment notifications
      await sendPaymentNotification(payment, 'paid');
    } else {
      payment.status = 'failed';
      payment.failureReason = razorpayPayment.error?.description || 'Payment failed';
      payment.failureCode = razorpayPayment.error?.code || 'PAYMENT_FAILED';
    }

    await payment.save();

    res.status(200).json({
      success: true,
      message: payment.status === 'paid' ? 'Payment verified successfully' : 'Payment verification failed',
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount.total,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Process split payments
async function processSplitPayments(payment) {
  try {
    // In a real implementation, you would integrate with Razorpay Split Payments
    // or your bank's API to transfer funds to admin and technician accounts
    
    // For now, we'll simulate the split payment processing
    for (const splitPayment of payment.splitPayments) {
      // Simulate API call to transfer funds
      splitPayment.status = 'processed';
      splitPayment.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      splitPayment.processedAt = new Date();
    }

    // Update technician earnings if payment is successful
    if (payment.technician) {
      const Technician = require('../models/Technician.js').default;
      await Technician.findByIdAndUpdate(payment.technician, {
        $inc: {
          'earnings.total': payment.amount.technicianShare,
          'earnings.pending': payment.amount.technicianShare
        }
      });
    }
  } catch (error) {
    console.error('Split payment processing error:', error);
    // Mark split payments as failed
    payment.splitPayments.forEach(split => {
      if (split.status === 'pending') {
        split.status = 'failed';
        split.failureReason = error.message;
      }
    });
  }
}

// Get payment details
export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('booking', 'bookingId status')
      .populate('user', 'firstName lastName email')
      .populate('technician', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user has access to this payment
    if (payment.user._id.toString() !== (req.user?._id || req.userId) && 
        payment.technician?._id?.toString() !== (req.user?._id || req.userId) && 
        req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user payment history
export const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.userId };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingId status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get technician earnings
export const getTechnicianEarnings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { technician: req.userId };
    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingId status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    // Calculate total earnings
    const totalEarnings = await Payment.aggregate([
      { $match: { technician: req.user._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount.technicianShare' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalEarnings: totalEarnings[0]?.total || 0,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get technician earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Only paid payments can be refunded'
      });
    }

    // Create refund through Razorpay
    const razorpay = initializeRazorpay();
    const refundOptions = {
      payment_id: payment.razorpay.paymentId,
      amount: amount ? amount * 100 : undefined // Convert to paise if specified
    };

    const refund = await razorpay.payments.refund(refundOptions);

    // Update payment record
    payment.refunds.push({
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to rupees
      reason: reason || 'Customer requested refund',
      status: refund.status,
      processedAt: new Date()
    });

    payment.status = refund.status === 'processed' ? 'refunded' : 'partially_refunded';
    payment.refundedAt = new Date();

    await payment.save();

    // Send refund notification
    await sendPaymentNotification(payment, 'refunded');

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Webhook handler for Razorpay
export const handleWebhook = async (req, res) => {
  try {
    const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Verify webhook signature
    const expected_signature = crypto
      .createHmac('sha256', webhook_secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expected_signature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Store webhook event
    if (payload.payment?.entity?.id) {
      const payment = await Payment.findOne({ 
        'razorpay.paymentId': payload.payment.entity.id 
      });

      if (payment) {
        payment.webhookEvents.push({
          eventType: event,
          eventData: payload,
          processedAt: new Date()
        });

        // Update payment status based on webhook
        switch (event) {
          case 'payment.captured':
            payment.status = 'paid';
            break;
          case 'payment.failed':
            payment.status = 'failed';
            payment.failureReason = payload.payment.entity.error?.description;
            break;
          case 'payment.refunded':
            payment.status = 'refunded';
            break;
        }

        await payment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};
