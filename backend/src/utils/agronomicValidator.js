/**
 * Agronomic & Meteorological Anomaly Validator
 * Detects physically impossible bounds and ecological/meteorological contradictions.
 */

const validateAgronomicInputs = (data, type = 'crop') => {
  const {
    nitrogen,
    phosphorus,
    potassium,
    pH,
    temperature,
    humidity,
    rainfall,
    areaHectares,
    currentN,
    currentP,
    currentK,
  } = data;

  // 1. PHYSICAL BOUNDARY CHECKS
  if (pH !== undefined && (pH < 3.5 || pH > 10.0)) {
    return {
      isValid: false,
      field: 'pH',
      message: `Soil pH value (${pH}) is out of natural arable range (3.5 - 10.0). Below 3.5 is battery-acidic and above 10.0 is intensely alkaline/sodic.`,
    };
  }

  if (humidity !== undefined && (humidity < 5 || humidity > 100)) {
    return {
      isValid: false,
      field: 'humidity',
      message: `Atmospheric relative humidity (${humidity}%) is physically impossible. Relative humidity must be between 5% and 100%.`,
    };
  }

  if (temperature !== undefined && (temperature < -15 || temperature > 55)) {
    return {
      isValid: false,
      field: 'temperature',
      message: `Ambient temperature (${temperature}°C) is outside viable open-field agricultural limits (-15°C to 55°C).`,
    };
  }

  if (rainfall !== undefined && (rainfall < 0 || rainfall > 3000)) {
    return {
      isValid: false,
      field: 'rainfall',
      message: `Seasonal rainfall (${rainfall} mm) must be non-negative and within reasonable bounds (0 to 3000 mm).`,
    };
  }

  // Check NPK bounds (Crop / Yield)
  if (nitrogen !== undefined && (nitrogen < 0 || nitrogen > 500)) {
    return {
      isValid: false,
      field: 'nitrogen',
      message: `Soil Nitrogen level (${nitrogen} mg/kg) must be between 0 and 500 mg/kg.`,
    };
  }
  if (phosphorus !== undefined && (phosphorus < 0 || phosphorus > 400)) {
    return {
      isValid: false,
      field: 'phosphorus',
      message: `Soil Phosphorus level (${phosphorus} mg/kg) must be between 0 and 400 mg/kg.`,
    };
  }
  if (potassium !== undefined && (potassium < 0 || potassium > 600)) {
    return {
      isValid: false,
      field: 'potassium',
      message: `Soil Potassium level (${potassium} mg/kg) must be between 0 and 600 mg/kg.`,
    };
  }

  // Check NPK bounds for Fertilizer tab
  if (currentN !== undefined && (currentN < 0 || currentN > 500)) {
    return {
      isValid: false,
      field: 'currentN',
      message: `Current Soil Nitrogen (${currentN} mg/kg) must be between 0 and 500 mg/kg.`,
    };
  }
  if (currentP !== undefined && (currentP < 0 || currentP > 400)) {
    return {
      isValid: false,
      field: 'currentP',
      message: `Current Soil Phosphorus (${currentP} mg/kg) must be between 0 and 400 mg/kg.`,
    };
  }
  if (currentK !== undefined && (currentK < 0 || currentK > 600)) {
    return {
      isValid: false,
      field: 'currentK',
      message: `Current Soil Potassium (${currentK} mg/kg) must be between 0 and 600 mg/kg.`,
    };
  }

  // Area check for Yield tab
  if (areaHectares !== undefined && areaHectares <= 0) {
    return {
      isValid: false,
      field: 'areaHectares',
      message: `Field sector area (${areaHectares} ha) must be greater than zero.`,
    };
  }

  // 2. METEOROLOGICAL & AGRONOMIC CONTRADICTION CHECKS
  // Heavy rainfall cannot coexist with desert-level relative humidity
  if (rainfall !== undefined && humidity !== undefined) {
    if (rainfall >= 150 && humidity <= 30) {
      return {
        isValid: false,
        field: 'rainfall_humidity',
        message: `Meteorological contradiction: Heavy rainfall of ${rainfall}mm cannot naturally coexist with desert-dry relative humidity (${humidity}%). When rainfall exceeds 150mm, atmospheric humidity is typically above 65%. Please verify sensor readings.`,
      };
    }
  }

  // Extreme heat combined with extreme humidity (dangerous wet-bulb event)
  if (temperature !== undefined && humidity !== undefined) {
    if (temperature >= 48 && humidity >= 85) {
      return {
        isValid: false,
        field: 'temp_humidity',
        message: `Extreme microclimate anomaly: Temperature of ${temperature}°C with ${humidity}% humidity creates an extreme wet-bulb threshold that destroys plant biomass and inhibits evapotranspiration.`,
      };
    }
  }

  // Extreme soil acidity with high available phosphorus
  if (pH !== undefined && phosphorus !== undefined) {
    if (pH < 4.2 && phosphorus > 80) {
      return {
        isValid: false,
        field: 'pH_phosphorus',
        message: `Soil chemistry contradiction: At strongly acidic pH of ${pH}, phosphorus is chemically bound to aluminum and iron, meaning available phosphorus cannot reach ${phosphorus} mg/kg.`,
      };
    }
  }

  return { isValid: true };
};

module.exports = {
  validateAgronomicInputs,
};
