const Field = require('../models/Field');

/**
 * @desc    Get all field sectors for authenticated user
 * @route   GET /api/fields
 * @access  Private
 */
const getFields = async (req, res, next) => {
  try {
    const fields = await Field.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(fields);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single field sector by ID
 * @route   GET /api/fields/:id
 * @access  Private
 */
const getFieldById = async (req, res, next) => {
  try {
    const field = await Field.findOne({ _id: req.params.id, user: req.user._id });
    if (!field) {
      return res.status(404).json({ success: false, message: 'Field sector not found' });
    }
    res.status(200).json(field);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new field sector
 * @route   POST /api/fields
 * @access  Private
 */
const createField = async (req, res, next) => {
  try {
    const {
      name,
      fieldName,
      farmName,
      area,
      areaUnit,
      soilType,
      currentCrop,
      crop,
      irrigationType,
      sowingDate,
      expectedHarvestDate,
      notes,
      lat,
      latitude,
      lng,
      longitude,
      address,
      status
    } = req.body;

    const newField = await Field.create({
      user: req.user._id,
      name: name || fieldName || 'New Field Sector',
      farmName: farmName || 'Green Valley Main Estate',
      area: parseFloat(area) || 5.0,
      areaUnit: areaUnit || 'Acres',
      soilType: soilType || 'Red Soil',
      currentCrop: currentCrop || crop || 'Tomato',
      irrigationType: irrigationType || 'Drip',
      sowingDate: sowingDate || '',
      expectedHarvestDate: expectedHarvestDate || '',
      notes: notes || '',
      lat: parseFloat(lat ?? latitude) || 12.9716,
      lng: parseFloat(lng ?? longitude) || 77.5946,
      address: address || '',
      status: status || 'Active'
    });

    res.status(201).json(newField);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update field sector
 * @route   PUT /api/fields/:id
 * @access  Private
 */
const updateField = async (req, res, next) => {
  try {
    let field = await Field.findOne({ _id: req.params.id, user: req.user._id });
    if (!field) {
      return res.status(404).json({ success: false, message: 'Field sector not found' });
    }

    const updateData = { ...req.body };
    if (updateData.name || updateData.fieldName) {
      updateData.name = updateData.name || updateData.fieldName;
    }
    if (updateData.crop) {
      updateData.currentCrop = updateData.crop;
    }
    if (updateData.latitude) {
      updateData.lat = parseFloat(updateData.latitude);
    }
    if (updateData.longitude) {
      updateData.lng = parseFloat(updateData.longitude);
    }

    field = await Field.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json(field);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete field sector
 * @route   DELETE /api/fields/:id
 * @access  Private
 */
const deleteField = async (req, res, next) => {
  try {
    const field = await Field.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!field) {
      return res.status(404).json({ success: false, message: 'Field sector not found' });
    }
    res.status(200).json({ success: true, message: 'Field sector deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField
};
