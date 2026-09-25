const mapWmoCode = (code) => {
  const wmo = Number(code);
  switch (wmo) {
    case 0:
      return { condition: 'Clear', description: 'Clear skies' };
    case 1:
    case 2:
    case 3:
      return { condition: 'Partly Cloudy', description: 'Partly cloudy skies' };
    case 45:
    case 48:
      return { condition: 'Fog', description: 'Foggy conditions' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return { condition: 'Light Rain', description: 'Light rain drizzles' };
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Rain', description: 'Heavy precipitation' };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return { condition: 'Snow', description: 'Snowfall' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', description: 'Thunderstorms and rain' };
    default:
      return { condition: 'Partly Cloudy', description: 'Variable cloudiness' };
  }
};

/**
 * OpenWeatherMap REST API Provider Client
 * Supports both OneCall 3.0/2.5 and Standard /weather + /forecast 5-day endpoints
 */
const fetchOpenWeatherMap = async (baseUrl, apiKey, lat, lng) => {
  if (!apiKey) {
    throw new Error('Weather API configuration is missing. Please add your OpenWeatherMap WEATHER_API_KEY to backend/.env.');
  }

  // 1. Try OneCall API endpoint first
  try {
    const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(oneCallUrl);
    if (res.ok) {
      const data = await res.json();
      const current = {
        temperature: Math.round(data.current.temp * 10) / 10,
        humidity: Math.round(data.current.humidity),
        precipitation: Math.round(((data.current.rain?.['1h'] || data.current.snow?.['1h'] || 0)) * 10) / 10,
        windSpeed: Math.round((data.current.wind_speed * 3.6) * 10) / 10,
        condition: data.current.weather[0]?.main || 'Clear',
        description: data.current.weather[0]?.description || 'Clear skies',
        pressure: Math.round(data.current.pressure || 1013),
        visibility: data.current.visibility ? Math.round(data.current.visibility / 1000) : undefined
      };
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const forecast = (data.daily || []).slice(0, 7).map((d, i) => {
        const dObj = new Date(d.dt * 1000);
        return {
          date: dObj.toISOString().split('T')[0],
          day: i === 0 ? 'Today' : daysOfWeek[dObj.getDay()],
          dateLabel: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          minTemperature: Math.round(d.temp.min),
          maxTemperature: Math.round(d.temp.max),
          precipitation: Math.round((d.rain || d.snow || 0) * 10) / 10,
          rainProbability: Math.round((d.pop || 0) * 100),
          humidity: Math.round(d.humidity || 60),
          windSpeed: Math.round((d.wind_speed * 3.6) * 10) / 10,
          condition: d.weather[0]?.main || 'Clear',
          description: d.weather[0]?.description || 'Clear'
        };
      });
      return { current, forecast };
    }
  } catch (err) {
    // OneCall unavailable or restricted; fall back to standard 2.5 endpoints below
  }

  // 2. Standard OpenWeatherMap 2.5 /weather and /forecast endpoints
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentWeatherUrl),
    fetch(forecastUrl)
  ]);

  if (!currentRes.ok) {
    const errorBody = await currentRes.json().catch(() => ({}));
    const errMsg = errorBody.message || currentRes.statusText;
    throw new Error(`OpenWeatherMap API failure (${currentRes.status}): ${errMsg}`);
  }

  const currentData = await currentRes.json();
  const current = {
    temperature: Math.round(currentData.main.temp * 10) / 10,
    humidity: Math.round(currentData.main.humidity),
    precipitation: Math.round(((currentData.rain?.['1h'] || currentData.rain?.['3h'] || 0)) * 10) / 10,
    windSpeed: Math.round((currentData.wind.speed * 3.6) * 10) / 10,
    condition: currentData.weather[0]?.main || 'Clear',
    description: currentData.weather[0]?.description || 'Clear skies',
    pressure: Math.round(currentData.main.pressure || 1013),
    visibility: currentData.visibility ? Math.round(currentData.visibility / 1000) : undefined
  };

  const forecast = [];
  if (forecastRes.ok) {
    const forecastData = await forecastRes.json();
    const groupedByDay = {};

    (forecastData.list || []).forEach((item) => {
      const dateStr = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!groupedByDay[dateStr]) {
        groupedByDay[dateStr] = [];
      }
      groupedByDay[dateStr].push(item);
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sortedDates = Object.keys(groupedByDay).sort();

    sortedDates.slice(0, 7).forEach((dateStr, i) => {
      const dayItems = groupedByDay[dateStr];
      const temps = dayItems.map((it) => it.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));
      const totalRain = dayItems.reduce((acc, it) => acc + (it.rain?.['3h'] || 0), 0);
      const maxPop = Math.max(...dayItems.map((it) => it.pop || 0));
      const maxWind = Math.max(...dayItems.map((it) => it.wind.speed * 3.6));
      const avgHumidity = Math.round(dayItems.reduce((acc, it) => acc + it.main.humidity, 0) / dayItems.length);

      const middayItem = dayItems[Math.floor(dayItems.length / 2)] || dayItems[0];
      const dObj = new Date(dateStr);

      forecast.push({
        date: dateStr,
        day: i === 0 ? 'Today' : daysOfWeek[dObj.getDay()],
        dateLabel: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        minTemperature: minTemp,
        maxTemperature: maxTemp,
        precipitation: Math.round(totalRain * 10) / 10,
        rainProbability: Math.round(maxPop * 100),
        humidity: avgHumidity,
        windSpeed: Math.round(maxWind * 10) / 10,
        condition: middayItem.weather[0]?.main || 'Clear',
        description: middayItem.weather[0]?.description || 'Clear'
      });
    });
  }

  return { current, forecast };
};

/**
 * Open-Meteo REST API Provider Client (Fallback when OpenWeatherMap key is unconfigured)
 */
const fetchOpenMeteo = async (lat, lng) => {
  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,surface_pressure,et0_fao_evapotranspiration&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_mean,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto`;

  const response = await fetch(openMeteoUrl);
  if (!response.ok) {
    throw new Error(`Open-Meteo weather API request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.current || !data.daily) {
    throw new Error('Malformed live weather API response');
  }

  const currentWmo = mapWmoCode(data.current.weather_code);
  const current = {
    temperature: Math.round(data.current.temperature_2m * 10) / 10,
    humidity: Math.round(data.current.relative_humidity_2m),
    precipitation: Math.round((data.current.precipitation || 0) * 10) / 10,
    windSpeed: Math.round((data.current.wind_speed_10m || 0) * 10) / 10,
    condition: currentWmo.condition,
    description: currentWmo.description,
    pressure: data.current.surface_pressure ? Math.round(data.current.surface_pressure) : undefined,
    evapotranspiration: data.current.et0_fao_evapotranspiration
      ? Math.round(data.current.et0_fao_evapotranspiration * 10) / 10
      : undefined
  };

  const forecast = [];
  const dailyDates = data.daily.time || [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < Math.min(7, dailyDates.length); i++) {
    const dStr = dailyDates[i];
    const dObj = new Date(dStr);
    const dayLabel = i === 0 ? 'Today' : daysOfWeek[dObj.getDay()];
    const dateLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const wmoInfo = mapWmoCode(data.daily.weather_code[i]);

    forecast.push({
      date: dStr,
      day: dayLabel,
      dateLabel,
      minTemperature: Math.round(data.daily.temperature_2m_min[i]),
      maxTemperature: Math.round(data.daily.temperature_2m_max[i]),
      precipitation: Math.round((data.daily.precipitation_sum[i] || 0) * 10) / 10,
      rainProbability: Math.round(data.daily.precipitation_probability_mean[i] || 0),
      humidity: data.daily.relative_humidity_2m_mean
        ? Math.round(data.daily.relative_humidity_2m_mean[i] || 60)
        : current.humidity,
      windSpeed: Math.round((data.daily.wind_speed_10m_max[i] || 0) * 10) / 10,
      condition: wmoInfo.condition,
      description: wmoInfo.description
    });
  }

  return { current, forecast };
};

/**
 * Fetches live weather telemetry from configured Weather API provider (OpenWeatherMap / Open-Meteo)
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} Normalized current weather and forecast data
 */
const fetchLiveWeather = async (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid latitude or longitude coordinates');
  }

  const apiKey = (process.env.WEATHER_API_KEY || '').trim();
  const apiUrl = (process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5').trim();

  // If OpenWeatherMap is configured or if API key is provided
  if (apiUrl.includes('openweathermap.org') || apiKey) {
    if (!apiKey) {
      // Fallback to Open-Meteo if key is not filled in .env yet so app does not break before user enters key
      console.warn('WEATHER_API_KEY is empty. Falling back to live satellite Open-Meteo telemetry...');
      return await fetchOpenMeteo(lat, lng);
    }
    return await fetchOpenWeatherMap(apiUrl, apiKey, lat, lng);
  }

  // Open-Meteo fallback
  return await fetchOpenMeteo(lat, lng);
};

module.exports = {
  fetchLiveWeather
};
