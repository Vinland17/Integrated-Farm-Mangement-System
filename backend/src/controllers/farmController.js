const Farm = require('../models/Farm');
const Field = require('../models/Field');

/**
 * @desc    Get all farm estates for authenticated user
 * @route   GET /api/farms
 * @access  Private
 */
const getFarms = async (req, res, next) => {
  try {
    const farms = await Farm.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Dynamically update fieldCount & activeCrops if user has fields
    const fields = await Field.find({ user: req.user._id });
    
    const enrichedFarms = farms.map((farm) => {
      const farmFields = fields.filter((f) => f.farmName === farm.name);
      const activeCropsCount = farmFields.filter((f) => f.currentCrop && f.currentCrop !== 'None').length;
      
      const farmObj = farm.toObject();
      return {
        ...farmObj,
        fieldCount: farmFields.length > 0 ? farmFields.length : farm.fieldCount,
        activeCrops: farmFields.length > 0 ? activeCropsCount : farm.activeCrops
      };
    });

    res.status(200).json(enrichedFarms);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single farm estate by ID
 * @route   GET /api/farms/:id
 * @access  Private
 */
const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, user: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm estate not found' });
    }
    res.status(200).json(farm);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new farm estate
 * @route   POST /api/farms
 * @access  Private
 */
const createFarm = async (req, res, next) => {
  try {
    const { name, location, totalArea, description, lat, lng, status } = req.body;

    const newFarm = await Farm.create({
      user: req.user._id,
      name: name || 'New Farm Estate',
      location: location || '',
      totalArea: parseFloat(totalArea) || 0,
      description: description || '',
      lat: parseFloat(lat) || 12.9716,
      lng: parseFloat(lng) || 77.5946,
      status: status || 'Active'
    });

    res.status(201).json(newFarm);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update farm estate
 * @route   PUT /api/farms/:id
 * @access  Private
 */
const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findOne({ _id: req.params.id, user: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm estate not found' });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(farm);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete farm estate
 * @route   DELETE /api/farms/:id
 * @access  Private
 */
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm estate not found' });
    }
    res.status(200).json({ success: true, message: 'Farm estate deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm
};
