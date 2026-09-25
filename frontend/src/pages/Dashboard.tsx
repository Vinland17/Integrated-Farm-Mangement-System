import React, { useEffect, useState } from 'react';
import {
  Tractor,
  Map,
  Sprout,
  Ruler,
  CloudSun,
  Droplets,
  Wind,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  FlaskConical,
  Scan,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { DecisionSupportCard } from '../components/common/DecisionSupportCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { farmService } from '../services/farmService';
import { cropService } from '../services/cropService';
import { weatherService } from '../services/weatherService';
import { recommendationService } from '../services/recommendationService';
import { Farm, Field, Crop, WeatherRecordResponse, DecisionSupportItem } from '../types';

export const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [weather, setWeather] = useState<WeatherRecordResponse | null>(null);
  const [decisions, setDecisions] = useState<DecisionSupportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [farmRes, fieldRes, cropRes, weatherRes, decisionRes] = await Promise.all([
          farmService.getFarms(),
          farmService.getFields(),
          cropService.getCrops(),
          weatherService.getWeather().catch(() => null),
          recommendationService.getDecisionSupport(),
        ]);
        setFarms(farmRes);
        setFields(fieldRes);
        setCrops(cropRes);
        setWeather(weatherRes);
        setDecisions(decisionRes);
      } catch (err) {
        console.error('Failed to load dashboard feeds', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalArea = fields.reduce((acc, f) => acc + f.area, 0);

  // Mock Recharts Datasets
  const yieldTrendData = [
    { month: 'Apr', predicted: 28, actual: 26 },
    { month: 'May', predicted: 35, actual: 34 },
    { month: 'Jun', predicted: 42, actual: 40 },
    { month: 'Jul', predicted: 50, actual: 52 },
    { month: 'Aug', predicted: 58, actual: 56 },
  ];

  const financialData = [
    { month: 'Apr', revenue: 18000, expense: 9200 },
    { month: 'May', revenue: 22000, expense: 11000 },
    { month: 'Jun', revenue: 29000, expense: 12500 },
    { month: 'Jul', revenue: 34000, expense: 14000 },
    { month: 'Aug', revenue: 46500, expense: 18400 },
  ];

  const soilNPKTrend = [
    { sample: 'Plot 1', nitrogen: 42, phosphorus: 38, potassium: 55 },
    { sample: 'Plot 2', nitrogen: 35, phosphorus: 28, potassium: 40 },
    { sample: 'Plot 3', nitrogen: 58, phosphorus: 45, potassium: 62 },
    { sample: 'Plot 4', nitrogen: 48, phosphorus: 32, potassium: 50 },
  ];

  const cropDistribution = [
    { name: 'Tomato', value: 40, color: '#16a34a' },
    { name: 'Potato', value: 30, color: '#eab308' },
    { name: 'Wheat', value: 20, color: '#3b82f6' },
    { name: 'Sweet Corn', value: 10, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome Header */}
      <PageHeader
        title="Welcome back, Farm Manager 👋"
        subtitle="Here is your integrated agricultural status, weather telemetry, and AI decision advisories."
        icon={<Sprout className="w-6 h-6" />}
        action={
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            AI Decision Support Engine: Active
          </div>
        }
      />

      {/* 1. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Farms"
          value={farms.length}
          icon={<Tractor className="w-6 h-6" />}
          change={12.5}
          accentColor="green"
        />
        <StatCard
          title="Total Fields"
          value={fields.length}
          icon={<Map className="w-6 h-6" />}
          subtitle="Managed sectors"
          accentColor="emerald"
        />
        <StatCard
          title="Active Crops"
          value={crops.length}
          icon={<Sprout className="w-6 h-6" />}
          badgeText="Peak Flowering"
          accentColor="blue"
        />
        <StatCard
          title="Total Cultivated Area"
          value={`${totalArea.toFixed(1)} ha`}
          icon={<Ruler className="w-6 h-6" />}
          subtitle="100% precision mapped"
          accentColor="amber"
        />
      </div>

      {/* 2. Weather Overview & Farm Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Telemetry Overview */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-agri-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-agri-300 border border-white/10 mb-2">
                <CloudSun className="w-4 h-4 text-amber-400" /> Live Station Telemetry
              </span>
              <h3 className="text-2xl font-bold">{weather?.farm?.name || weather?.farm?.location || 'Central Farm Station'}</h3>
              <p className="text-xs text-slate-400">
                {weather?.fetchedAt ? `Updated ${new Date(weather.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live Satellite Feeds'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl lg:text-5xl font-black text-white">{weather?.current ? weather.current.temperature : 27.5}°C</span>
              <span className="block text-xs text-agri-400 font-bold uppercase tracking-wider">{weather?.current ? weather.current.condition : 'Partly Cloudy'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Humidity</span>
                <span className="text-base font-extrabold text-white">{weather?.current ? weather.current.humidity : 68}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Wind Speed</span>
                <span className="text-base font-extrabold text-white">{weather?.current ? weather.current.windSpeed : 14.2} km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Precipitation</span>
                <span className="text-base font-extrabold text-white">{weather?.current ? weather.current.precipitation : 0} mm</span>
              </div>
            </div>
          </div>

          {weather?.advisories && weather.advisories.length > 0 && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span><strong>Advisory Notice:</strong> {weather.advisories[0].title} — {weather.advisories[0].message}</span>
            </div>
          )}
        </div>

        {/* Farm Health Telemetry Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Farm Operational Health</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Score: 86 / 100
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Soil Health Index</span>
                  <span className="text-agri-700">84% Optimal</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-agri-600 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Crop Growth Canopy</span>
                  <span className="text-emerald-700">90% Vigorous</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Irrigation Efficiency</span>
                  <span className="text-sky-700">78% Hydro-balanced</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                  <span>Disease Risk Level</span>
                  <span className="text-amber-700">Low to Moderate</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> System Status: Nominal
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI Insights Cards Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-agri-700" />
          <h3 className="text-lg font-extrabold text-slate-900">Machine Learning Predictive Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Crop Recommendation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-agri-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-agri-50 text-agri-700 rounded-xl"><Sprout className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-agri-100 text-agri-800 rounded-full">94% Confidence</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Crop Suitability</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">"Tomato is currently highly suitable for Field A."</p>
          </div>

          {/* Card 2: Yield Prediction */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><TrendingUp className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">Forecast Model</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Yield Forecast</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">"Expected yield: 3.8 tons/hectare for Roma VF."</p>
          </div>

          {/* Card 3: Fertilizer Recommendation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-amber-50 text-amber-700 rounded-xl"><FlaskConical className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">Nutrient Advisory</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Soil NPK Gap</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">"Nitrogen level in Field B is below recommended range."</p>
          </div>

          {/* Card 4: Disease Detection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 bg-sky-50 text-sky-700 rounded-xl"><Scan className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full">Vision Scan</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Canopy Health</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">"No critical high-severity disease outbreak flagged."</p>
          </div>
        </div>
      </div>

      {/* 4. Decision Support Engine Panel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Today's Agricultural Recommendations</h3>
            <p className="text-xs text-slate-500">Cross-referenced rule engine evaluation based on soil, weather, & inventory.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {decisions.slice(0, 2).map((item) => (
            <DecisionSupportCard
              key={item.id}
              title={item.title}
              category={item.category}
              priority={item.priority}
              factors={item.factors}
              recommendedAction={item.recommendedAction}
              reasoning={item.reasoning}
            />
          ))}
        </div>
      </div>

      {/* 5. Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Yield Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Yield Trend (Predicted vs Actual)</h4>
              <p className="text-xs text-slate-500">Monthly metric tons harvested</p>
            </div>
            <span className="text-xs font-semibold text-agri-700 bg-agri-50 px-2.5 py-1 rounded-full">
              Accuracy: 97.4%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldTrendData}>
                <defs>
                  <linearGradient id="yieldActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#yieldActual)" />
                <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial Performance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Expense vs Income Stream</h4>
              <p className="text-xs text-slate-500">Gross revenue vs input costs ($ USD)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#15803d" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
