/**
 * Agricultural Decision Support Engine
 *
 * Evaluates live weather parameters deterministically against agronomic threshold rules.
 * Generates decision-support advisories containing title, message, severity, and explicit reason.
 *
 * @param {Object} current - Live normalized current weather
 * @param {Array<Object>} forecast - Normalized 7-day weather forecast array
 * @returns {Array<Object>} Deterministic agricultural decision advisories
 */
const generateAdvisories = (current = {}, forecast = []) => {
  const advisories = [];
  const todayForecast = forecast[0] || {};
  const maxRainProbNext3Days = Math.max(...forecast.slice(0, 3).map((f) => f.rainProbability || 0), 0);
  const totalRainNext3Days = forecast.slice(0, 3).reduce((acc, f) => acc + (f.precipitation || 0), 0);

  // 1. IRRIGATION ADVISORY
  if (totalRainNext3Days >= 15 || maxRainProbNext3Days >= 65) {
    advisories.push({
      type: 'IRRIGATION',
      severity: 'HIGH',
      title: 'Delay Scheduled Irrigation',
      message: 'Consider postponing irrigation to avoid unnecessary water use, root waterlogging, and pumping energy expenditure.',
      reason: `Significant precipitation (${totalRainNext3Days.toFixed(1)}mm / ${maxRainProbNext3Days}% probability) predicted in the 3-day forecast.`
    });
  } else if (current.temperature >= 32 && current.humidity < 40 && maxRainProbNext3Days < 25) {
    advisories.push({
      type: 'IRRIGATION',
      severity: 'MEDIUM',
      title: 'Increase Irrigation Monitoring',
      message: 'Monitor crop root hydration closely and increase drip irrigation frequency to avoid moisture deficit stress.',
      reason: `High current ambient temperature (${current.temperature}°C) coupled with low humidity (${current.humidity}%) and minimal expected rainfall.`
    });
  } else {
    advisories.push({
      type: 'IRRIGATION',
      severity: 'LOW',
      title: 'Maintain Routine Irrigation',
      message: 'Microclimate evapotranspiration levels are within normal bounds. Maintain standard irrigation schedule.',
      reason: 'No extreme precipitation or acute moisture deficit detected in live weather feeds.'
    });
  }

  // 2. HEAVY RAIN & DRAINAGE ADVISORY
  if (todayForecast.precipitation >= 20 || todayForecast.rainProbability >= 75) {
    advisories.push({
      type: 'RAINFALL',
      severity: 'HIGH',
      title: 'Heavy Rainfall Risk & Drainage Monitoring',
      message: 'Inspect field sector drainage channels and avoid unnecessary field operations to prevent soil compaction.',
      reason: `Heavy rainfall expected today (${todayForecast.precipitation}mm expected precipitation, ${todayForecast.rainProbability}% probability).`
    });
  }

  // 3. FERTILIZER APPLICATION ADVISORY
  if (todayForecast.precipitation >= 10 || todayForecast.rainProbability >= 60) {
    advisories.push({
      type: 'FERTILIZER',
      severity: 'HIGH',
      title: 'Postpone Soil Top-Dressing',
      message: 'Avoid fertilizer application immediately before heavy rainfall to prevent expensive nutrient runoff and nitrate leaching.',
      reason: `Incoming rainfall (${todayForecast.precipitation}mm / ${todayForecast.rainProbability}% chance) will wash away surface fertilizer.`
    });
  } else {
    advisories.push({
      type: 'FERTILIZER',
      severity: 'LOW',
      title: 'Favorable Fertigation Window',
      message: 'Safe window for applying scheduled granular top-dressing, compost, or fertigation.',
      reason: 'Low immediate risk of nutrient-leaching rainfall over the next 24 hours.'
    });
  }

  // 4. PESTICIDE SPRAYING & WIND ADVISORY
  const maxWind = Math.max(current.windSpeed || 0, todayForecast.windSpeed || 0);
  if (maxWind >= 20) {
    advisories.push({
      type: 'SPRAYING',
      severity: 'HIGH',
      title: 'Postpone Chemical Spraying',
      message: 'High wind conditions detected. Avoid or postpone pesticide/fungicide spraying operations.',
      reason: `Peak wind velocity (${maxWind} km/h) exceeds the safe spraying threshold (20 km/h), causing chemical drift.`
    });
  } else {
    advisories.push({
      type: 'SPRAYING',
      severity: 'LOW',
      title: 'Safe Foliar Spraying Window',
      message: 'Favorable low-wind microclimate window for precision crop protection or foliar nutrient application.',
      reason: `Current wind velocity (${maxWind} km/h) is safely below chemical drift limits.`
    });
  }

  // 5. HEAT STRESS WARNING
  const maxTemp = Math.max(current.temperature || 0, todayForecast.maxTemperature || 0);
  if (maxTemp >= 34) {
    advisories.push({
      type: 'HEAT_STRESS',
      severity: 'HIGH',
      title: 'Crop Heat Stress Advisory',
      message: 'High temperature detected. Monitor crops for heat stress and ensure adequate root zone moisture hydration.',
      reason: `Peak ambient temperature (${maxTemp}°C) exceeds the 34°C agronomic heat stress threshold.`
    });
  }

  // 6. GENERAL WEATHER ADVISORY
  const hasHighAlerts = advisories.some((a) => a.severity === 'HIGH');
  if (!hasHighAlerts) {
    advisories.push({
      type: 'GENERAL',
      severity: 'LOW',
      title: 'General Agricultural Advisory',
      message: 'Favorable agricultural weather condition logged. Excellent window for routine field cultivation, pruning, and harvesting.',
      reason: 'Live meteorological telemetry confirms stable microclimate parameters.'
    });
  }

  return advisories;
};

module.exports = {
  generateAdvisories
};
