import mongoose from 'mongoose';

const applianceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Appliance name is required'],
    trim: true,
    maxlength: [100, 'Appliance name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['small', 'large'],
    lowercase: true
  },
  subCategory: {
    type: String,
    required: [true, 'Sub-category is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  serviceCharge: {
    type: Number,
    required: [true, 'Service charge is required'],
    min: [0, 'Service charge cannot be negative']
  },
  emergencyCharge: {
    type: Number,
    default: 0,
    min: [0, 'Emergency charge cannot be negative']
  },
  warrantyPeriod: {
    type: Number,
    default: 0, // in months
    min: [0, 'Warranty period cannot be negative']
  },
  estimatedServiceTime: {
    type: Number,
    required: [true, 'Estimated service time is required'],
    min: [15, 'Service time must be at least 15 minutes'] // in minutes
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Please provide valid image URLs'
    }
  }],
  commonIssues: [{
    issue: { type: String, required: true },
    solution: { type: String, required: true },
    estimatedCost: { type: Number, required: true, min: 0 },
    estimatedTime: { type: Number, required: true, min: 15 } // in minutes
  }],
  requiredSkills: [{
    type: String,
    required: true
  }],
  spareParts: [{
    name: { type: String, required: true },
    partNumber: { type: String },
    price: { type: Number, required: true, min: 0 },
    availability: { type: Boolean, default: true },
    warranty: { type: Number, default: 0 } // in months
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total price
applianceSchema.virtual('totalPrice').get(function() {
  return this.basePrice + this.serviceCharge;
});

// Virtual for emergency total price
applianceSchema.virtual('emergencyTotalPrice').get(function() {
  return this.basePrice + this.serviceCharge + this.emergencyCharge;
});

// Compound index for search
applianceSchema.index({ category: 1, subCategory: 1, brand: 1, model: 1 });
applianceSchema.index({ name: 'text', brand: 'text', model: 'text' });
applianceSchema.index({ isActive: 1 });

// Pre-save middleware to validate pricing
applianceSchema.pre('save', function(next) {
  if (this.emergencyCharge && this.emergencyCharge < 0) {
    this.emergencyCharge = 0;
  }
  
  if (this.basePrice < 0) {
    this.basePrice = 0;
  }
  
  if (this.serviceCharge < 0) {
    this.serviceCharge = 0;
  }
  
  next();
});

export default mongoose.model('Appliance', applianceSchema);
