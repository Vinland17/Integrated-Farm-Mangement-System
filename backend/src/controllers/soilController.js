const SoilRecord = require('../models/SoilRecord');
const Field = require('../models/Field');
const calculateSoilHealthScore = require('../utils/soilHealthCalculator');

/**
 * Format soil record for clean JSON response
 */
const formatSoilResponse = (record) => {
  const obj = record.toObject ? record.toObject() : record;
  const fieldObj = obj.field && typeof obj.field === 'object' ? obj.field : null;

  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    fieldId: fieldObj ? fieldObj._id.toString() : (obj.field ? obj.field.toString() : ''),
    fieldName: fieldObj ? fieldObj.name : 'Field Sector',
    farmName: fieldObj ? (fieldObj.farmName || '') : '',
    date: obj.date ? new Date(obj.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  };
};

/**
 * @desc    Get all soil laboratory records for authenticated user
 * @route   GET /api/soil
 * @access  Private
 */
const getSoilRecords = async (req, res, next) => {
  try {
    const { fieldId } = req.query;
    const filter = { user: req.user._id };

    if (fieldId) {
      // Verify field belongs to user
      const fieldDoc = await Field.findOne({ _id: fieldId, user: req.user._id });
      if (!fieldDoc) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Field does not belong to authenticated user.'
        });
      }
      filter.field = fieldId;
    }

    const records = await SoilRecord.find(filter)
      .populate('field', 'name farmName soilType area areaUnit')
      .sort({ date: -1, createdAt: -1 });

    const formattedRecords = records.map(formatSoilResponse);
    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single soil laboratory record by ID
 * @route   GET /api/soil/:id
 * @access  Private
 */
const getSoilRecordById = async (req, res, next) => {
  try {
    const record = await SoilRecord.findOne({ _id: req.params.id, user: req.user._id })
      .populate('field', 'name farmName soilType area areaUnit');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Soil record not found' });
    }

    res.status(200).json(formatSoilResponse(record));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new soil laboratory record
 * @route   POST /api/soil
 * @access  Private
 */
const createSoilRecord = async (req, res, next) => {
  try {
    const {
      field,
      fieldId,
      date,
      nitrogen,
      phosphorus,
      potassium,
      pH,
      moisture,
      organicMatter,
      notes
    } = req.body;

    const targetFieldId = field || fieldId;

    if (!targetFieldId) {
      return res.status(400).json({ success: false, message: 'Field selection is required' });
    }

    // 1. Validate Field ownership through authenticated user
    const fieldDoc = await Field.findOne({ _id: targetFieldId, user: req.user._id });
    if (!fieldDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Field selection. Field does not belong to authenticated user.'
      });
    }

    // 2. Validate required numeric measurements
    if (nitrogen === undefined || nitrogen === null || Number(nitrogen) < 0) {
      return res.status(400).json({ success: false, message: 'Valid Nitrogen (N) level is required (min 0)' });
    }
    if (phosphorus === undefined || phosphorus === null || Number(phosphorus) < 0) {
      return res.status(400).json({ success: false, message: 'Valid Phosphorus (P) level is required (min 0)' });
    }
    if (potassium === undefined || potassium === null || Number(potassium) < 0) {
      return res.status(400).json({ success: false, message: 'Valid Potassium (K) level is required (min 0)' });
    }
    if (pH === undefined || pH === null || Number(pH) < 0 || Number(pH) > 14) {
      return res.status(400).json({ success: false, message: 'Valid Soil pH level is required (range 0 - 14)' });
    }
    if (moisture === undefined || moisture === null || Number(moisture) < 0 || Number(moisture) > 100) {
      return res.status(400).json({ success: false, message: 'Valid Soil Moisture percentage is required (range 0 - 100)' });
    }
    if (organicMatter === undefined || organicMatter === null || Number(organicMatter) < 0) {
      return res.status(400).json({ success: false, message: 'Valid Organic Matter percentage is required (min 0)' });
    }

    // 3. Deterministically calculate composite soil health score
    const healthScore = calculateSoilHealthScore({
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      pH: Number(pH),
      organicMatter: Number(organicMatter)
    });

    // 4. Save record
    const newRecord = await SoilRecord.create({
      user: req.user._id,
      field: fieldDoc._id,
      date: date ? new Date(date) : new Date(),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      pH: Number(pH),
      moisture: Number(moisture),
      organicMatter: Number(organicMatter),
      healthScore,
      notes: notes || ''
    });

    const populatedRecord = await SoilRecord.findById(newRecord._id)
      .populate('field', 'name farmName soilType area areaUnit');

    res.status(201).json(formatSoilResponse(populatedRecord));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update soil laboratory record
 * @route   PUT /api/soil/:id
 * @access  Private
 */
const updateSoilRecord = async (req, res, next) => {
  try {
    let record = await SoilRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Soil record not found' });
    }

    const {
      field,
      fieldId,
      date,
      nitrogen,
      phosphorus,
      potassium,
      pH,
      moisture,
      organicMatter,
      notes
    } = req.body;

    const targetFieldId = field || fieldId || record.field;

    // Validate Field ownership if changing field
    const fieldDoc = await Field.findOne({ _id: targetFieldId, user: req.user._id });
    if (!fieldDoc) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Field selection. Field does not belong to authenticated user.'
      });
    }

    const updatedN = nitrogen !== undefined ? Number(nitrogen) : record.nitrogen;
    const updatedP = phosphorus !== undefined ? Number(phosphorus) : record.phosphorus;
    const updatedK = potassium !== undefined ? Number(potassium) : record.potassium;
    const updatedPH = pH !== undefined ? Number(pH) : record.pH;
    const updatedMoisture = moisture !== undefined ? Number(moisture) : record.moisture;
    const updatedOM = organicMatter !== undefined ? Number(organicMatter) : record.organicMatter;

    // Validate numeric bounds
    if (updatedN < 0 || updatedP < 0 || updatedK < 0) {
      return res.status(400).json({ success: false, message: 'NPK measurements cannot be negative' });
    }
    if (updatedPH < 0 || updatedPH > 14) {
      return res.status(400).json({ success: false, message: 'pH level must be between 0 and 14' });
    }
    if (updatedMoisture < 0 || updatedMoisture > 100) {
      return res.status(400).json({ success: false, message: 'Moisture percentage must be between 0 and 100' });
    }
    if (updatedOM < 0) {
      return res.status(400).json({ success: false, message: 'Organic Matter cannot be negative' });
    }

    // Recalculate health score
    const healthScore = calculateSoilHealthScore({
      nitrogen: updatedN,
      phosphorus: updatedP,
      potassium: updatedK,
      pH: updatedPH,
      organicMatter: updatedOM
    });

    const updatePayload = {
      field: fieldDoc._id,
      nitrogen: updatedN,
      phosphorus: updatedP,
      potassium: updatedK,
      pH: updatedPH,
      moisture: updatedMoisture,
      organicMatter: updatedOM,
      healthScore
    };

    if (date) updatePayload.date = new Date(date);
    if (notes !== undefined) updatePayload.notes = notes;

    record = await SoilRecord.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    }).populate('field', 'name farmName soilType area areaUnit');

    res.status(200).json(formatSoilResponse(record));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete soil laboratory record
 * @route   DELETE /api/soil/:id
 * @access  Private
 */
const deleteSoilRecord = async (req, res, next) => {
  try {
    const record = await SoilRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Soil record not found' });
    }

    res.status(200).json({ success: true, message: 'Soil record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSoilRecords,
  getSoilRecordById,
  createSoilRecord,
  updateSoilRecord,
  deleteSoilRecord
};
