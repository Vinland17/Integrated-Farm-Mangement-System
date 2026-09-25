const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    },
    name: {
      type: String,
      required: [true, 'Field sector name is required'],
      trim: true
    },
    farmName: {
      type: String,
      default: 'Green Valley Main Estate',
      trim: true
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0.1, 'Area must be greater than 0']
    },
    areaUnit: {
      type: String,
      default: 'Acres'
    },
    soilType: {
      type: String,
      required: [true, 'Soil type is required'],
      trim: true
    },
    currentCrop: {
      type: String,
      required: [true, 'Crop is required'],
      trim: true
    },
    irrigationType: {
      type: String,
      default: 'Drip'
    },
    sowingDate: {
      type: String
    },
    expectedHarvestDate: {
      type: String
    },
    notes: {
      type: String,
      default: ''
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      default: ''
    },
    soilHealthScore: {
      type: Number,
      default: 80
    },
    npk: {
      nitrogen: { type: Number, default: 40 },
      phosphorus: { type: Number, default: 35 },
      potassium: { type: Number, default: 45 }
    },
    pH: {
      type: Number,
      default: 6.5
    },
    moisture: {
      type: Number,
      default: 25
    },
    status: {
      type: String,
      enum: ['Active', 'Fallow', 'Preparation', 'Harvesting'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for id mapping
fieldSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

fieldSchema.set('toJSON', { virtuals: true });
fieldSchema.set('toObject', { virtuals: true });

const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
