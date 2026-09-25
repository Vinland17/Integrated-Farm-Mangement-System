import React, { useEffect, useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  Calendar,
  Sun,
  CloudDrizzle,
  CloudLightning,
  Cloud,
  MapPin,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { weatherService } from '../services/weatherService';
import { farmService } from '../services/farmService';
import { Farm, WeatherRecordResponse, WeatherAdvisory } from '../types';
import { useToast } from '../hooks/useToast';

export const Weather: React.FC = () => {
  const { showToast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherRecordResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const farmsList = await farmService.getFarms();
      setFarms(farmsList || []);

      if (farmsList && farmsList.length > 0) {
        const defaultId = farmsList[0].id || farmsList[0]._id || '';
        setSelectedFarmId(defaultId);
        await loadWeatherForFarm(defaultId);
      } else {
        // Fallback: request weather telemetry for default farm/station
        await loadWeatherForFarm('');
      }
    } catch (err) {
      console.error('Error loading user farms for weather module:', err);
      // Fallback: attempt fetching weather directly
      await loadWeatherForFarm('');
    }
  };

  const loadWeatherForFarm = async (farmId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await weatherService.getWeather(farmId);
      setWeatherData(data);
    } catch (err: any) {
      console.error(`Error fetching live weather for farm ${farmId}:`, err);
      const apiMsg = err?.response?.data?.message || 'Live weather data is currently unavailable.';
      setErrorMsg(apiMsg);
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmSelect = async (farmId: string) => {
    setSelectedFarmId(farmId);
    await loadWeatherForFarm(farmId);
  };

  const handleRefresh = async () => {
    showToast('Refreshing Live Telemetry', 'Fetching real-time weather from backend Weather API...', 'info');
    await loadWeatherForFarm(selectedFarmId);
  };

  const getWeatherIcon = (conditionStr: string) => {
    const c = (conditionStr || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-8 h-8 text-sky-400" />;
    if (c.includes('lightning') || c.includes('thunder')) return <CloudLightning className="w-8 h-8 text-amber-500" />;
    if (c.includes('fog')) return <Cloud className="w-8 h-8 text-slate-400" />;
    if (c.includes('clear') || c.includes('sun')) return <Sun className="w-8 h-8 text-amber-400" />;
    return <CloudSun className="w-8 h-8 text-amber-400" />;
  };

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || '').toUpperCase();
    if (sev === 'HIGH') {
      return 'bg-rose-500 text-white border-rose-600';
    }
    if (sev === 'MEDIUM') {
      return 'bg-amber-500 text-white border-amber-600';
    }
    return 'bg-emerald-600 text-white border-emerald-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Agri Weather & Environmental Advisory"
        subtitle="Live microclimate weather telemetry and deterministic agricultural decision support."
        icon={<CloudSun className="w-6 h-6" />}
        action={
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Telemetry
          </button>
        }
      />

      {/* Farm Location Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-agri-50 text-agri-700 rounded-xl border border-agri-200">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Select Farm Location
            </label>
            <span className="text-sm font-bold text-slate-800">
              {farms.length === 0 ? 'Default Weather Station:' : 'Active Farm Weather Station:'}
            </span>
          </div>
        </div>

        {farms.length > 0 && (
          <select
            value={selectedFarmId}
            onChange={(e) => handleFarmSelect(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-agri-500 cursor-pointer min-w-[260px]"
          >
            {farms.map((f) => (
              <option key={f.id || f._id} value={f.id || f._id}>
                {f.name} ({f.location || `Lat: ${f.lat}, Lng: ${f.lng}`})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error / Warning Alert Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Weather Telemetry Unavailable</h4>
            <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Weather Dashboard UI */}
      {weatherData && (
        <>
          {/* Main Telemetry Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-agri-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-agri-300 border border-white/10 mb-3">
                  <CloudSun className="w-4 h-4 text-amber-400" /> Active Station: {weatherData.farm?.name || 'Farm Station'}
                </span>
                <h2 className="text-3xl lg:text-4xl font-extrabold">{weatherData.farm?.location || 'Farm Location'}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Coordinates: Lat {typeof weatherData.farm?.latitude === 'number' ? weatherData.farm.latitude.toFixed(4) : '12.9716'}, Lng {typeof weatherData.farm?.longitude === 'number' ? weatherData.farm.longitude.toFixed(4) : '77.5946'} • Last Updated {weatherData.fetchedAt ? new Date(weatherData.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-5xl lg:text-6xl font-black text-white">{weatherData.current?.temperature ?? '--'}°C</span>
                  <span className="block text-sm font-bold text-agri-400 uppercase tracking-wider mt-1">
                    {weatherData.current?.condition || 'Partly Cloudy'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Relative Humidity</span>
                  <span className="text-xl font-extrabold text-white">{weatherData.current?.humidity ?? '--'}%</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Wind Velocity</span>
                  <span className="text-xl font-extrabold text-white">{weatherData.current?.windSpeed ?? '--'} km/h</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Precipitation</span>
                  <span className="text-xl font-extrabold text-white">{weatherData.current?.precipitation ?? 0} mm</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-400">Evapotranspiration</span>
                  <span className="text-xl font-extrabold text-white">{weatherData.current?.evapotranspiration ?? 3.5} mm/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Weather Advisory Cards */}
          {weatherData.advisories && weatherData.advisories.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-agri-700 text-white rounded-xl shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Agricultural Weather Decision Support</h3>
                  <p className="text-xs text-slate-500">Deterministic agronomic rules generated from live weather parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherData.advisories.map((advisory: WeatherAdvisory, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                          {advisory.type} ADVISORY
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${getSeverityBadge(advisory.severity)}`}>
                          {advisory.severity} SEVERITY
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{advisory.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{advisory.message}</p>
                    </div>

                    {advisory.reason && (
                      <div className="flex items-start gap-2 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200/80">
                        <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        <span><strong>Agronomic Reason:</strong> {advisory.reason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Meteorological Outlook */}
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-agri-700" />
                <h3 className="text-lg font-extrabold text-slate-900">7-Day Meteorological Outlook</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weatherData.forecast.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                      idx === 0
                        ? 'bg-agri-900 text-white border-agri-950 shadow-md font-bold'
                        : 'bg-white text-slate-800 border-slate-200/80 hover:shadow-sm font-semibold'
                    }`}
                  >
                    <div>
                      <span className={`block text-xs font-bold ${idx === 0 ? 'text-agri-300' : 'text-slate-500'}`}>
                        {day.day || (idx === 0 ? 'Today' : day.date)}
                      </span>
                      <span className={`block text-[10px] ${idx === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                        {day.dateLabel || day.date}
                      </span>
                    </div>

                    <div className="my-3">{getWeatherIcon(day.condition)}</div>

                    <div>
                      <span className="block text-base font-extrabold">
                        {day.maxTemperature !== undefined ? day.maxTemperature : (day.tempMax ?? '--')}°C
                      </span>
                      <span className={`block text-xs ${idx === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                        Low: {day.minTemperature !== undefined ? day.minTemperature : (day.tempMin ?? '--')}°C
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 w-full text-[10px]">
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        idx === 0 ? 'bg-white/10 text-white' : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        Rain: {day.rainProbability !== undefined ? day.rainProbability : (day.rainProb ?? 0)}%
                      </span>
                      <span className={`text-[9px] ${idx === 0 ? 'text-slate-300' : 'text-slate-400'}`}>
                        {day.precipitation ?? 0} mm • {day.windSpeed ?? 0} km/h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
