import React from 'react';
import { BarChart3, Download, TrendingUp, FlaskConical, DollarSign, Boxes } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { useToast } from '../hooks/useToast';

export const Reports: React.FC = () => {
  const { showToast } = useToast();

  const handleExportReport = () => {
    showToast('Exporting Report', 'PDF & CSV summary generated for PRJ_533.', 'success');
  };

  const yieldData = [
    { month: 'Apr', predicted: 28, actual: 26 },
    { month: 'May', predicted: 35, actual: 34 },
    { month: 'Jun', predicted: 42, actual: 40 },
    { month: 'Jul', predicted: 50, actual: 52 },
    { month: 'Aug', predicted: 58, actual: 56 },
  ];

  const npkData = [
    { plot: 'Plot 1', nitrogen: 42, phosphorus: 38, potassium: 55 },
    { plot: 'Plot 2', nitrogen: 35, phosphorus: 28, potassium: 40 },
    { plot: 'Plot 3', nitrogen: 58, phosphorus: 45, potassium: 62 },
    { plot: 'Plot 4', nitrogen: 48, phosphorus: 32, potassium: 50 },
  ];

  const financialData = [
    { month: 'May', revenue: 22000, expense: 11000, profit: 11000 },
    { month: 'Jun', revenue: 29000, expense: 12500, profit: 16500 },
    { month: 'Jul', revenue: 34000, expense: 14000, profit: 20000 },
    { month: 'Aug', revenue: 46500, expense: 18400, profit: 28100 },
  ];

  const resourceUsageData = [
    { category: 'Fertilizers', used: 65, remaining: 35 },
    { category: 'Seeds', used: 80, remaining: 20 },
    { category: 'Pesticides', used: 45, remaining: 55 },
    { category: 'Fuel', used: 90, remaining: 10 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Agricultural Analytics Reports"
        subtitle="Comprehensive cross-module performance metrics, soil trends, and financial reporting."
        icon={<BarChart3 className="w-6 h-6" />}
        action={
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Export Analytics PDF/CSV
          </button>
        }
      />

      {/* SECTION 1: AGRICULTURAL PERFORMANCE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-agri-700" />
          <h3 className="text-lg font-extrabold text-slate-900">1. Agricultural Yield Performance</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Seasonal Harvest Yield Curve (Predicted vs Actual)</h4>
          <p className="text-xs text-slate-500 mb-4">Comparison of model target vs harvested metric tons</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#16a34a" strokeWidth={3} fill="#dcfce7" />
                <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: SOIL ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-agri-700" />
          <h3 className="text-lg font-extrabold text-slate-900">2. Soil Chemistry & NPK Trends</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Macronutrient Content per Field Sector</h4>
          <p className="text-xs text-slate-500 mb-4">Nitrogen, Phosphorus, Potassium levels in mg/kg</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="plot" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="nitrogen" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="phosphorus" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="potassium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: FINANCIAL ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-agri-700" />
          <h3 className="text-lg font-extrabold text-slate-900">3. Financial Cash Flow & Profit Trend</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Net Operating Profit Growth</h4>
          <p className="text-xs text-slate-500 mb-4">Cumulative monthly profit stream ($ USD)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#15803d" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: RESOURCE ANALYTICS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-agri-700" />
          <h3 className="text-lg font-extrabold text-slate-900">4. Resource & Input Consumption</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-800 mb-1">Inventory Depletion vs Capacity Buffer</h4>
          <p className="text-xs text-slate-500 mb-4">Percentage of stock utilized during active season</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="used" fill="#16a34a" stackId="a" />
                <Bar dataKey="remaining" fill="#cbd5e1" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
