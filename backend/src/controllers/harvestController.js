const Harvest = require('../models/Harvest');

const formatResponse = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
  };
};

/**
 * @desc    Get all harvest records for authenticated user
 * @route   GET /api/harvests
 * @access  Private
 */
const getHarvests = async (req, res, next) => {
  try {
    const harvests = await Harvest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(harvests.map(formatResponse));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single harvest record by ID
 * @route   GET /api/harvests/:id
 * @access  Private
 */
const getHarvestById = async (req, res, next) => {
  try {
    const harvest = await Harvest.findOne({ _id: req.params.id, user: req.user._id });
    if (!harvest) {
      return res.status(404).json({ message: 'Harvest record not found' });
    }
    res.status(200).json(formatResponse(harvest));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new harvest record
 * @route   POST /api/harvests
 * @access  Private
 */
const createHarvest = async (req, res, next) => {
  try {
    const { cropName, fieldName, harvestDate, predictedYieldTons, actualYieldTons, qualityGrade, storageLocation, revenue } = req.body;

    if (!cropName || !fieldName || predictedYieldTons === undefined || actualYieldTons === undefined) {
      return res.status(400).json({ message: 'Crop name, field name, predicted yield, and actual yield are required' });
    }

    const predNum = Number(predictedYieldTons) || 0;
    const actNum = Number(actualYieldTons) || 0;

    const newHarvest = new Harvest({
      user: req.user._id,
      cropName,
      fieldName,
      harvestDate: harvestDate || new Date().toISOString().split('T')[0],
      predictedYieldTons: predNum,
      actualYieldTons: actNum,
      qualityGrade: qualityGrade || 'Grade A',
      storageLocation: storageLocation || 'Central Warehouse',
      revenue: revenue !== undefined ? Number(revenue) : 0,
    });

    const saved = await newHarvest.save();
    res.status(201).json(formatResponse(saved));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a harvest record
 * @route   PUT /api/harvests/:id
 * @access  Private
 */
const updateHarvest = async (req, res, next) => {
  try {
    const harvest = await Harvest.findOne({ _id: req.params.id, user: req.user._id });

    if (!harvest) {
      return res.status(404).json({ message: 'Harvest record not found' });
    }

    const { cropName, fieldName, harvestDate, predictedYieldTons, actualYieldTons, qualityGrade, storageLocation, revenue } = req.body;

    if (cropName !== undefined) harvest.cropName = cropName;
    if (fieldName !== undefined) harvest.fieldName = fieldName;
    if (harvestDate !== undefined) harvest.harvestDate = harvestDate;
    if (predictedYieldTons !== undefined) harvest.predictedYieldTons = Number(predictedYieldTons);
    if (actualYieldTons !== undefined) harvest.actualYieldTons = Number(actualYieldTons);
    if (qualityGrade !== undefined) harvest.qualityGrade = qualityGrade;
    if (storageLocation !== undefined) harvest.storageLocation = storageLocation;
    if (revenue !== undefined) harvest.revenue = Number(revenue);

    const updated = await harvest.save();
    res.status(200).json(formatResponse(updated));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a harvest record
 * @route   DELETE /api/harvests/:id
 * @access  Private
 */
const deleteHarvest = async (req, res, next) => {
  try {
    const deleted = await Harvest.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!deleted) {
      return res.status(404).json({ message: 'Harvest record not found or unauthorized' });
    }

    res.status(200).json({ message: 'Harvest record removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHarvests,
  getHarvestById,
  createHarvest,
  updateHarvest,
  deleteHarvest,
};
