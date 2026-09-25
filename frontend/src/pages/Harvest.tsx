import React, { useEffect, useState } from 'react';
import { Wheat, TrendingUp, CheckCircle2, ArrowDownRight, ArrowUpRight, Plus, Trash2, Scale } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FormModal } from '../components/common/FormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { harvestService } from '../services/harvestService';
import { Harvest as HarvestType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const Harvest: React.FC = () => {
  const { showToast } = useToast();
  const [harvests, setHarvests] = useState<HarvestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [cropName, setCropName] = useState('Durum Wheat');
  const [fieldName, setFieldName] = useState('Field D - Wheat Belt');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [predictedYieldTons, setPredictedYieldTons] = useState('36.0');
  const [actualYieldTons, setActualYieldTons] = useState('35.0');
  const [qualityGrade, setQualityGrade] = useState<'Grade A' | 'Grade B' | 'Grade C' | 'Standard' | 'Premium'>('Grade A');
  const [storageLocation, setStorageLocation] = useState('Silo Block 3');
  const [revenue, setRevenue] = useState('24500');

  useEffect(() => {
    loadHarvests();
  }, []);

  const loadHarvests = async () => {
    setLoading(true);
    try {
      const data = await harvestService.getHarvests();
      setHarvests(data);
    } catch (err: any) {
      showToast('Failed to load harvest logs', err?.response?.data?.message || 'Database error loading harvest records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || !fieldName.trim()) return;

    setIsSubmitting(true);
    const predNum = parseFloat(predictedYieldTons) || 0;
    const actNum = parseFloat(actualYieldTons) || 0;

    try {
      const created = await harvestService.createHarvest({
        cropName: cropName.trim(),
        fieldName: fieldName.trim(),
        harvestDate,
        predictedYieldTons: predNum,
        actualYieldTons: actNum,
        qualityGrade,
        storageLocation: storageLocation.trim() || 'Central Warehouse',
        revenue: parseFloat(revenue) || 0,
      });

      showToast('Harvest Logged', `Harvest record for "${created.cropName}" saved to database.`, 'success');
      setIsAddOpen(false);
      setCropName('Durum Wheat');
      loadHarvests();
    } catch (err: any) {
      showToast('Error Recording Harvest', err?.response?.data?.message || 'Failed to save harvest log.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHarvest = async () => {
    if (!deleteId) return;
    try {
      await harvestService.deleteHarvest(deleteId);
      showToast('Harvest Removed', 'Harvest record deleted from database.', 'info');
      setDeleteId(null);
      loadHarvests();
    } catch (err: any) {
      showToast('Delete Failed', err?.response?.data?.message || 'Could not delete harvest record.', 'error');
    }
  };

  const totalActualTons = harvests.reduce((acc, h) => acc + (h.actualYieldTons || 0), 0);
  const totalPredictedTons = harvests.reduce((acc, h) => acc + (h.predictedYieldTons || 0), 0);
  const totalRevenue = harvests.reduce((acc, h) => acc + (h.revenue || 0), 0);

  const overallVariance = totalPredictedTons > 0 
    ? (((totalActualTons - totalPredictedTons) / totalPredictedTons) * 100).toFixed(1)
    : '0.0';

  const yieldComparisonData = harvests.map((h) => ({
    name: h.cropName ? h.cropName.split(' ')[0] : 'Crop',
    Predicted: h.predictedYieldTons || 0,
    Actual: h.actualYieldTons || 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Harvest & Yield Performance"
        subtitle="Crop harvest output, grain quality grading, storage logs, and predicted vs actual yield variance."
        icon={<Wheat className="w-6 h-6" />}
        action={
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Record Harvest Output
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Actual Yield</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{totalActualTons.toFixed(1)} Tons</h3>
          <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 inline" /> Total scale output recorded
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ML Model Target</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{totalPredictedTons.toFixed(1)} Tons</h3>
          <p className="text-xs text-slate-500 font-semibold mt-2">Yield Variance: {overallVariance}%</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Harvest Revenue</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-1">{formatCurrency(totalRevenue)}</h3>
          <p className="text-xs text-emerald-700 font-semibold mt-2">Contracted harvest sales</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} height="h-64" />
      ) : harvests.length === 0 ? (
        <EmptyState
          icon={<Wheat className="w-10 h-10 text-slate-400" />}
          title="No Harvest Records Found"
          description="Log your harvest output, grain quality grades, and scale weights to track yield accuracy."
          action={
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Record First Harvest
            </button>
          }
        />
      ) : (
        <>
          {/* Flagship Feature: PREDICTED VS ACTUAL YIELD VISUALIZATION */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-agri-50/30 rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Predicted vs Actual Yield Accuracy</h3>
                <p className="text-xs text-slate-500">Comparison of machine learning predictions vs scale weight output (Metric Tons)</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-agri-100 text-agri-800 rounded-full border border-agri-200">
                Live Data Connected
              </span>
            </div>

            {/* Highlighted Variance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {harvests.map((h) => {
                const harvestId = (h._id || h.id) as string;
                const diff = h.differencePercent !== undefined ? h.differencePercent : 0;
                const isPos = diff >= 0;
                return (
                  <div key={harvestId} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-slate-900">{h.cropName}</span>
                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                        isPos ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {isPos ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {diff}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                      <span>Predicted: <strong>{h.predictedYieldTons} Tons</strong></span>
                      <span>Actual: <strong>{h.actualYieldTons} Tons</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="Predicted" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Harvest Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Crop Produce</th>
                    <th className="py-3.5 px-4">Field Sector</th>
                    <th className="py-3.5 px-4">Harvest Date</th>
                    <th className="py-3.5 px-4">Yield Quantity</th>
                    <th className="py-3.5 px-4">Quality Grade</th>
                    <th className="py-3.5 px-4">Storage Location</th>
                    <th className="py-3.5 px-4 text-right">Revenue</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {harvests.map((h) => {
                    const harvestId = (h._id || h.id) as string;
                    return (
                      <tr key={harvestId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-900">{h.cropName}</td>
                        <td className="py-4 px-4 font-medium text-slate-700">{h.fieldName}</td>
                        <td className="py-4 px-4 text-slate-600">{formatDate(h.harvestDate)}</td>
                        <td className="py-4 px-4 font-extrabold text-slate-900">{h.actualYieldTons} Tons</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={h.qualityGrade} />
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{h.storageLocation}</td>
                        <td className="py-4 px-4 text-right font-extrabold text-emerald-700">+{formatCurrency(h.revenue)}</td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setDeleteId(harvestId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Harvest Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Record Harvest Modal */}
      <FormModal isOpen={isAddOpen} title="Record Crop Harvest & Quality Grading" onClose={() => setIsAddOpen(false)}>
        <form onSubmit={handleCreateHarvest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crop Produce Name</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Durum Wheat"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Field Sector</label>
              <input
                type="text"
                required
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. Field D - Wheat Belt"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harvest Date</label>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Predicted (Tons)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={predictedYieldTons}
                onChange={(e) => setPredictedYieldTons(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Actual (Tons)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={actualYieldTons}
                onChange={(e) => setActualYieldTons(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              >
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
                <option value="Grade C">Grade C</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Storage Facility</label>
              <input
                type="text"
                required
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Silo Block 3"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Revenue ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Harvest Record'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Harvest Record"
        message="Are you sure you want to remove this harvest log and yield record from MongoDB Atlas?"
        onConfirm={handleDeleteHarvest}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
