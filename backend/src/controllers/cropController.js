const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const Field = require('../models/Field');

/**
 * Helper to normalize crop object for frontend response
 */
const formatCropResponse = (crop) => {
  const cropObj = crop.toObject ? crop.toObject() : crop;
  
  const farmId = cropObj.farm ? (cropObj.farm._id || cropObj.farm) : '';
  const farmName = cropObj.farm && cropObj.farm.name ? cropObj.farm.name : (cropObj.farmName || '');
  
  const fieldId = cropObj.field ? (cropObj.field._id || cropObj.field) : '';
  const fieldName = cropObj.field && cropObj.field.name ? cropObj.field.name : (cropObj.fieldName || '');

  return {
    ...cropObj,
    id: cropObj._id ? cropObj._id.toString() : cropObj.id,
    farmId,
    farmName,
    fieldId,
    fieldName,
    plantingDate: cropObj.sowingDate || cropObj.plantingDate || '',
    sowingDate: cropObj.sowingDate || cropObj.plantingDate || '',
    expectedHarvest: cropObj.expectedHarvest || '',
    growthStage: cropObj.stage || cropObj.growthStage || 'Vegetative',
    stage: cropObj.stage || cropObj.growthStage || 'Vegetative',
    healthStatus: cropObj.healthStatus || cropObj.status || 'Healthy',
    status: cropObj.healthStatus || cropObj.status || 'Healthy'
  };
};

/**
 * @desc    Get all crops for authenticated user
 * @route   GET /api/crops
 * @access  Private
 */
const getCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find({ user: req.user._id })
      .populate('farm', 'name location')
      .populate('field', 'name farmName soilType')
      .sort({ createdAt: -1 });

    const formattedCrops = crops.map(formatCropResponse);
    res.status(200).json(formattedCrops);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single crop by ID
 * @route   GET /api/crops/:id
 * @access  Private
 */
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findOne({ _id: req.params.id, user: req.user._id })
      .populate('farm', 'name location')
      .populate('field', 'name farmName soilType');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop cycle record not found' });
    }

    res.status(200).json(formatCropResponse(crop));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new crop cycle record
 * @route   POST /api/crops
 * @access  Private
 */
const createCrop = async (req, res, next) => {
  try {
    const {
      name,
      variety,
      farm,
      farmId,
      field,
      fieldId,
      sowingDate,
      plantingDate,
      expectedHarvest,
      expectedHarvestDate,
      stage,
      growthStage,
      healthStatus,
      status,
      estimatedYieldTons
    } = req.body;

    const targetFarmId = farm || farmId;
    const targetFieldId = field || fieldId;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Crop name is required' });
    }

    if (!targetFarmId) {
      return res.status(400).json({ success: false, message: 'Farm selection (farmId) is required' });
    }

    if (!targetFieldId) {
      return res.status(400).json({ success: false, message: 'Field selection (fieldId) is required' });
    }

    // 1. Validate Farm ownership
    const farmDoc = await Farm.findOne({ _id: targetFarmId, user: req.user._id });
    if (!farmDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Farm selection. Farm does not belong to the authenticated user.'
      });
    }

    // 2. Validate Field ownership
    const fieldDoc = await Field.findOne({ _id: targetFieldId, user: req.user._id });
    if (!fieldDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Field selection. Field does not belong to the authenticated user.'
      });
    }

    // 3. Validate that Field belongs to Selected Farm
    // Auto-link field to farm if field is owned by user but missing farm reference
    if (!fieldDoc.farm || fieldDoc.farmName !== farmDoc.name) {
      fieldDoc.farm = farmDoc._id;
      fieldDoc.farmName = farmDoc.name;
      await fieldDoc.save();
    }

    // Create Crop
    const newCrop = await Crop.create({
      user: req.user._id,
      farm: farmDoc._id,
      field: fieldDoc._id,
      name,
      variety: variety || '',
      sowingDate: sowingDate || plantingDate || '',
      expectedHarvest: expectedHarvest || expectedHarvestDate || '',
      stage: stage || growthStage || 'Vegetative',
      healthStatus: healthStatus || status || 'Healthy',
      estimatedYieldTons: parseFloat(estimatedYieldTons) || 0
    });

    const populatedCrop = await Crop.findById(newCrop._id)
      .populate('farm', 'name location')
      .populate('field', 'name farmName soilType');

    res.status(201).json(formatCropResponse(populatedCrop));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update crop cycle record
 * @route   PUT /api/crops/:id
 * @access  Private
 */
const updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findOne({ _id: req.params.id, user: req.user._id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop cycle record not found' });
    }

    const {
      name,
      variety,
      farm,
      farmId,
      field,
      fieldId,
      sowingDate,
      plantingDate,
      expectedHarvest,
      expectedHarvestDate,
      stage,
      growthStage,
      healthStatus,
      status,
      estimatedYieldTons
    } = req.body;

    const targetFarmId = farm || farmId || crop.farm;
    const targetFieldId = field || fieldId || crop.field;

    // Validate Farm ownership if changed
    const farmDoc = await Farm.findOne({ _id: targetFarmId, user: req.user._id });
    if (!farmDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Farm selection. Farm does not belong to the authenticated user.'
      });
    }

    // Validate Field ownership if changed
    const fieldDoc = await Field.findOne({ _id: targetFieldId, user: req.user._id });
    if (!fieldDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Field selection. Field does not belong to the authenticated user.'
      });
    }

    // Validate Field belongs to Farm & auto-link if missing
    if (!fieldDoc.farm || fieldDoc.farmName !== farmDoc.name) {
      fieldDoc.farm = farmDoc._id;
      fieldDoc.farmName = farmDoc.name;
      await fieldDoc.save();
    }

    const updatePayload = {
      farm: farmDoc._id,
      field: fieldDoc._id
    };

    if (name !== undefined) updatePayload.name = name;
    if (variety !== undefined) updatePayload.variety = variety;
    if (sowingDate !== undefined || plantingDate !== undefined) {
      updatePayload.sowingDate = sowingDate || plantingDate;
    }
    if (expectedHarvest !== undefined || expectedHarvestDate !== undefined) {
      updatePayload.expectedHarvest = expectedHarvest || expectedHarvestDate;
    }
    if (stage !== undefined || growthStage !== undefined) {
      updatePayload.stage = stage || growthStage;
    }
    if (healthStatus !== undefined || status !== undefined) {
      updatePayload.healthStatus = healthStatus || status;
    }
    if (estimatedYieldTons !== undefined) {
      updatePayload.estimatedYieldTons = parseFloat(estimatedYieldTons) || 0;
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    })
      .populate('farm', 'name location')
      .populate('field', 'name farmName soilType');

    res.status(200).json(formatCropResponse(crop));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete crop cycle record
 * @route   DELETE /api/crops/:id
 * @access  Private
 */
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop cycle record not found' });
    }

    res.status(200).json({ success: true, message: 'Crop cycle record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop
};
