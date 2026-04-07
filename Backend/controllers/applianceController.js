import Appliance from '../models/Appliance.js';
import { paginate, createPaginationResponse } from '../utils/helpers.js';

// Get All Appliances
export const getAllAppliances = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, brand, sortBy = 'name', sortOrder = 'asc', isActive } = req.query;

    // Build query
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const appliances = await Appliance.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appliance.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Appliances retrieved successfully',
      data: createPaginationResponse(appliances, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Get all appliances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliances',
      error: error.message
    });
  }
};

// Get Appliance by ID
export const getApplianceById = async (req, res) => {
  try {
    const { applianceId } = req.params;

    const appliance = await Appliance.findById(applianceId);

    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appliance retrieved successfully',
      data: {
        appliance
      }
    });
  } catch (error) {
    console.error('Get appliance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliance',
      error: error.message
    });
  }
};

// Create Appliance
export const createAppliance = async (req, res) => {
  try {
    const applianceData = req.body;
    
    // Set addedBy from authenticated admin
    applianceData.addedBy = req.user._id;

    const newAppliance = new Appliance(applianceData);
    await newAppliance.save();

    res.status(201).json({
      success: true,
      message: 'Appliance created successfully',
      data: {
        appliance: newAppliance
      }
    });
  } catch (error) {
    console.error('Create appliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appliance',
      error: error.message
    });
  }
};

// Update Appliance
export const updateAppliance = async (req, res) => {
  try {
    const { applianceId } = req.params;
    const updates = req.body;
    
    // Set updatedBy from authenticated admin
    updates.updatedBy = req.user._id;

    const updatedAppliance = await Appliance.findByIdAndUpdate(
      applianceId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedAppliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appliance updated successfully',
      data: {
        appliance: updatedAppliance
      }
    });
  } catch (error) {
    console.error('Update appliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appliance',
      error: error.message
    });
  }
};

// Delete Appliance
export const deleteAppliance = async (req, res) => {
  try {
    const { applianceId } = req.params;

    const deletedAppliance = await Appliance.findByIdAndDelete(applianceId);

    if (!deletedAppliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appliance deleted successfully'
    });
  } catch (error) {
    console.error('Delete appliance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appliance',
      error: error.message
    });
  }
};

// Get Appliance Categories
export const getApplianceCategories = async (req, res) => {
  try {
    const categories = await Appliance.distinct('category');

    res.status(200).json({
      success: true,
      message: 'Appliance categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get appliance categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliance categories',
      error: error.message
    });
  }
};

// Get Appliance Brands
export const getApplianceBrands = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    
    const brands = await Appliance.distinct('brand', query);

    res.status(200).json({
      success: true,
      message: 'Appliance brands retrieved successfully',
      data: {
        brands
      }
    });
  } catch (error) {
    console.error('Get appliance brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliance brands',
      error: error.message
    });
  }
};

// Get Appliance Models by Brand
export const getApplianceModels = async (req, res) => {
  try {
    const { brand, category } = req.query;
    const query = {};
    
    if (brand) query.brand = brand;
    if (category) query.category = category;
    
    const models = await Appliance.distinct('model', query);

    res.status(200).json({
      success: true,
      message: 'Appliance models retrieved successfully',
      data: {
        models
      }
    });
  } catch (error) {
    console.error('Get appliance models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliance models',
      error: error.message
    });
  }
};

// Get Featured Appliances
export const getFeaturedAppliances = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const featuredAppliances = await Appliance.find({ 
      isActive: true,
      isFeatured: true 
    })
      .sort({ featuredOrder: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Featured appliances retrieved successfully',
      data: {
        appliances: featuredAppliances
      }
    });
  } catch (error) {
    console.error('Get featured appliances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured appliances',
      error: error.message
    });
  }
};

// Get Popular Appliances
export const getPopularAppliances = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularAppliances = await Appliance.find({ 
      isActive: true 
    })
      .sort({ bookingCount: -1, rating: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Popular appliances retrieved successfully',
      data: {
        appliances: popularAppliances
      }
    });
  } catch (error) {
    console.error('Get popular appliances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popular appliances',
      error: error.message
    });
  }
};

// Search Appliances with Filters
export const searchAppliances = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      brand,
      model,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (model) query.model = model;
    
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const appliances = await Appliance.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appliance.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Appliances search results retrieved successfully',
      data: createPaginationResponse(appliances, parseInt(page), limitNum, total)
    });
  } catch (error) {
    console.error('Search appliances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search appliances',
      error: error.message
    });
  }
};

// Update Appliance Status (Active/Inactive)
export const updateApplianceStatus = async (req, res) => {
  try {
    const { applianceId } = req.params;
    const { isActive } = req.body;

    const updatedAppliance = await Appliance.findByIdAndUpdate(
      applianceId,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedAppliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Appliance ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        appliance: updatedAppliance
      }
    });
  } catch (error) {
    console.error('Update appliance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appliance status',
      error: error.message
    });
  }
};

// Update Appliance Featured Status
export const updateApplianceFeatured = async (req, res) => {
  try {
    const { applianceId } = req.params;
    const { isFeatured, featuredOrder } = req.body;

    const updateData = { isFeatured };
    if (featuredOrder !== undefined) {
      updateData.featuredOrder = featuredOrder;
    }

    const updatedAppliance = await Appliance.findByIdAndUpdate(
      applianceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAppliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Appliance ${isFeatured ? 'added to' : 'removed from'} featured list successfully`,
      data: {
        appliance: updatedAppliance
      }
    });
  } catch (error) {
    console.error('Update appliance featured status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appliance featured status',
      error: error.message
    });
  }
};

// Get Appliance Statistics
export const getApplianceStatistics = async (req, res) => {
  try {
    const statistics = await Appliance.aggregate([
      {
        $group: {
          _id: null,
          totalAppliances: { $sum: 1 },
          activeAppliances: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          featuredAppliances: {
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
          },
          averagePrice: { $avg: '$basePrice' },
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]);

    const categoryStats = await Appliance.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$basePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const brandStats = await Appliance.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          averagePrice: { $avg: '$basePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = {
      overall: statistics[0] || {
        totalAppliances: 0,
        activeAppliances: 0,
        featuredAppliances: 0,
        averagePrice: 0,
        categories: [],
        brands: []
      },
      byCategory: categoryStats,
      byBrand: brandStats
    };

    res.status(200).json({
      success: true,
      message: 'Appliance statistics retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get appliance statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appliance statistics',
      error: error.message
    });
  }
};

export default {
  getAllAppliances,
  getApplianceById,
  createAppliance,
  updateAppliance,
  deleteAppliance,
  getApplianceCategories,
  getApplianceBrands,
  getApplianceModels,
  getFeaturedAppliances,
  getPopularAppliances,
  searchAppliances,
  updateApplianceStatus,
  updateApplianceFeatured,
  getApplianceStatistics
};