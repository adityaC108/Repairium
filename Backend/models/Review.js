import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  response: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  responseBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'responseByModel'
  },
  responseByModel: {
    type: String,
    enum: ['User', 'Technician', 'Admin']
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'hidden', 'flagged'],
    default: 'published'
  },
  moderationReason: {
    type: String,
    trim: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  moderatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ technician: 1, createdAt: -1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ status: 1 });

// Ensure one review per booking per user
reviewSchema.index({ booking: 1, user: 1 }, { unique: true });

// Pre-save middleware to validate booking exists and user is the booking owner
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Check if booking exists
      const Booking = mongoose.model('Booking');
      const booking = await Booking.findById(this.booking);
      
      if (!booking) {
        return next(new Error('Booking not found'));
      }
      
      // Check if user is the booking owner
      if (booking.user.toString() !== this.user.toString()) {
        return next(new Error('You can only review your own bookings'));
      }
      
      // Check if booking is completed
      if (booking.status !== 'completed') {
        return next(new Error('You can only review completed bookings'));
      }
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get average rating for technician
reviewSchema.statics.getTechnicianAverageRating = async function(technicianId) {
  const result = await this.aggregate([
    { $match: { technician: new mongoose.Types.ObjectId(technicianId), status: 'published' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$score' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

// Static method to get review statistics
reviewSchema.statics.getReviewStatistics = async function(filters = {}) {
  const matchStage = { ...filters, status: 'published' };
  
  const [
    overallStats,
    ratingDistribution,
    recentReviews
  ] = await Promise.all([
    // Overall statistics
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$score' }
        }
      }
    ]),
    
    // Rating distribution
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$score',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    
    // Recent reviews
    this.find(matchStage)
      .populate('user', 'firstName lastName')
      .populate('technician', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);
  
  return {
    overall: overallStats[0] || { totalReviews: 0, averageRating: 0 },
    ratingDistribution: ratingDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentReviews
  };
};

// Instance method to update technician rating after review changes
reviewSchema.methods.updateTechnicianRating = async function() {
  const Technician = mongoose.model('Technician');
  const stats = await this.constructor.getTechnicianAverageRating(this.technician);
  
  await Technician.findByIdAndUpdate(this.technician, {
    averageRating: stats.averageRating,
    totalReviews: stats.totalReviews
  });
};

// Post-save middleware to update technician rating
reviewSchema.post('save', async function() {
  if (this.status === 'published') {
    await this.updateTechnicianRating();
  }
});

// Post-remove middleware to update technician rating
reviewSchema.post('remove', async function() {
  await this.updateTechnicianRating();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
