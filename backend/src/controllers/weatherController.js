const Farm = require('../models/Farm');
const { fetchLiveWeather } = require('../services/weatherService');
const { generateAdvisories } = require('../services/agriculturalWeatherEngine');

/**
 * @desc    Get live microclimate weather telemetry & agricultural advisories for a farm
 * @route   GET /api/weather
 * @route   GET /api/weather/:farmId
 * @access  Private
 */
const getWeather = async (req, res, next) => {
  try {
    const farmId = req.params.farmId || req.query.farmId;
    let farm = null;

    if (farmId) {
      farm = await Farm.findOne({ _id: farmId, user: req.user._id });
    }

    // If no specific farm requested or found, grab user's first active farm
    if (!farm) {
      farm = await Farm.findOne({ user: req.user._id });
    }

    // Extract coordinates with defaults fallback
    const lat = farm && typeof farm.lat === 'number' ? farm.lat : (req.query.lat ? parseFloat(req.query.lat) : 12.9716);
    const lng = farm && typeof farm.lng === 'number' ? farm.lng : (req.query.lng ? parseFloat(req.query.lng) : 77.5946);

    // Fetch live weather data from OpenWeatherMap or Open-Meteo
    const { current, forecast } = await fetchLiveWeather(lat, lng);

    // Generate deterministic agricultural advisories based on current weather & forecast
    const advisories = generateAdvisories(current, forecast);

    const farmMeta = {
      id: farm ? farm._id.toString() : 'default-station',
      name: farm ? farm.name : 'Farm Weather Station',
      location: farm ? (farm.location || 'Green Valley Station') : 'Local Farm Telemetry',
      latitude: lat,
      longitude: lng
    };

    res.status(200).json({
      success: true,
      farm: farmMeta,
      current,
      forecast,
      advisories,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Weather Controller Error]:', error.message);
    next(error);
  }
};

module.exports = {
  getWeather
};
