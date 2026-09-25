import React, { useEffect, useState } from 'react';
import { FlaskConical, Plus, Activity, Droplets, Thermometer, Sparkles, Edit3, Trash2, Layers, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { FormModal } from '../components/common/FormModal';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { soilService } from '../services/soilService';
import { farmService } from '../services/farmService';
import { Field, SoilRecord } from '../types';
import { useToast } from '../hooks/useToast';

export const Soil: React.FC = () => {
  const { showToast } = useToast();
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SoilRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [pH, setPH] = useState('');
  const [moisture, setMoisture] = useState('');
  const [organicMatter, setOrganicMatter] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recordsData, fieldsData] = await Promise.all([
        soilService.getSoilRecords(),
        farmService.getFields(),
      ]);

      setSoilRecords(recordsData);
      setFields(fieldsData);

      if (fieldsData.length > 0) {
        setSelectedFieldId(fieldsData[0].id || fieldsData[0]._id || '');
      }
    } catch (err) {
      console.error('Error loading soil telemetry data:', err);
      showToast('Error', 'Failed to load soil laboratory records from backend database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setDate(new Date().toISOString().split('T')[0]);
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setPH('');
    setMoisture('');
    setOrganicMatter('');
    setNotes('');

    if (fields.length > 0) {
      setSelectedFieldId(fields[0].id || fields[0]._id || '');
    } else {
      setSelectedFieldId('');
    }

    setIsAddOpen(true);
  };

  const handleOpenEditModal = (record: SoilRecord) => {
    setEditingRecord(record);
    
    let matchedFieldId = typeof record.field === 'string' ? record.field : (record.field?._id || record.fieldId || '');
    if (!matchedFieldId && fields.length > 0) {
      matchedFieldId = fields[0].id || fields[0]._id || '';
    }
    setSelectedFieldId(matchedFieldId);

    setDate(record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setNitrogen(record.nitrogen !== undefined ? record.nitrogen.toString() : '');
    setPhosphorus(record.phosphorus !== undefined ? record.phosphorus.toString() : '');
    setPotassium(record.potassium !== undefined ? record.potassium.toString() : '');
    setPH(record.pH !== undefined ? record.pH.toString() : '');
    setMoisture(record.moisture !== undefined ? record.moisture.toString() : '');
    setOrganicMatter(record.organicMatter !== undefined ? record.organicMatter.toString() : '');
    setNotes(record.notes || '');

    setIsAddOpen(true);
  };

  const handleSubmitSoilRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFieldId) {
      showToast('Validation Error', 'Please select a Field sector.', 'error');
      return;
    }

    const nVal = parseFloat(nitrogen);
    const pVal = parseFloat(phosphorus);
    const kVal = parseFloat(potassium);
    const phVal = parseFloat(pH);
    const mVal = parseFloat(moisture);
    const omVal = parseFloat(organicMatter);

    if (isNaN(nVal) || nVal < 0) {
      showToast('Validation Error', 'Please enter a valid Nitrogen level (min 0).', 'error');
      return;
    }
    if (isNaN(pVal) || pVal < 0) {
      showToast('Validation Error', 'Please enter a valid Phosphorus level (min 0).', 'error');
      return;
    }
    if (isNaN(kVal) || kVal < 0) {
      showToast('Validation Error', 'Please enter a valid Potassium level (min 0).', 'error');
      return;
    }
    if (isNaN(phVal) || phVal < 0 || phVal > 14) {
      showToast('Validation Error', 'Please enter a valid Soil pH level (0 - 14).', 'error');
      return;
    }
    if (isNaN(mVal) || mVal < 0 || mVal > 100) {
      showToast('Validation Error', 'Please enter a valid Moisture percentage (0 - 100%).', 'error');
      return;
    }
    if (isNaN(omVal) || omVal < 0) {
      showToast('Validation Error', 'Please enter a valid Organic Matter percentage (min 0%).', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      field: selectedFieldId,
      fieldId: selectedFieldId,
      date,
      nitrogen: nVal,
      phosphorus: pVal,
      potassium: kVal,
      pH: phVal,
      moisture: mVal,
      organicMatter: omVal,
      notes
    };

    try {
      if (editingRecord) {
        const updated = await soilService.updateSoilRecord(editingRecord.id || editingRecord._id!, payload);
        showToast('Soil Telemetry Updated', `Updated soil sample for "${updated.fieldName || 'Field'}". Health Score: ${updated.healthScore}/100.`, 'success');
      } else {
        const created = await soilService.addSoilRecord(payload);
        showToast('Soil Telemetry Saved', `Registered soil test sample. Calculated Health Score: ${created.healthScore}/100.`, 'success');
      }

      setIsAddOpen(false);
      setEditingRecord(null);
      const updatedRecords = await soilService.getSoilRecords();
      setSoilRecords(updatedRecords);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to save soil laboratory record.';
      showToast('Error', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRecordId) return;

    try {
      await soilService.deleteSoilRecord(deletingRecordId);
      showToast('Record Deleted', 'Soil test record removed from MongoDB database.', 'success');
      setDeletingRecordId(null);
      const updatedRecords = await soilService.getSoilRecords();
      setSoilRecords(updatedRecords);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to delete soil test record.';
      showToast('Error', errMsg, 'error');
    }
  };

  // Compute Real Database Dashboard Summary Metrics
  const totalSamples = soilRecords.length;
  const avgHealthScore = totalSamples > 0 
    ? Math.round(soilRecords.reduce((acc, r) => acc + (r.healthScore || 0), 0) / totalSamples)
    : 0;
  const avgN = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.nitrogen || 0), 0) / totalSamples).toFixed(1) : '0';
  const avgP = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.phosphorus || 0), 0) / totalSamples).toFixed(1) : '0';
  const avgK = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.potassium || 0), 0) / totalSamples).toFixed(1) : '0';
  const avgPH = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.pH || 0), 0) / totalSamples).toFixed(1) : '0';
  const avgMoisture = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.moisture || 0), 0) / totalSamples).toFixed(1) : '0';
  const avgOM = totalSamples > 0 ? (soilRecords.reduce((acc, r) => acc + (r.organicMatter || 0), 0) / totalSamples).toFixed(1) : '0';

  const npkChartData = soilRecords.map((r) => {
    const fName = r.fieldName || (typeof r.field === 'object' ? r.field.name : 'Field');
    return {
      name: fName.length > 15 ? `${fName.substring(0, 15)}...` : fName,
      Nitrogen: r.nitrogen,
      Phosphorus: r.phosphorus,
      Potassium: r.potassium,
    };
  });

  const filteredRecords = soilRecords.filter((s) => {
    const fName = s.fieldName || (typeof s.field === 'object' ? s.field.name : '');
    return (
      fName.toLowerCase().includes(search.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase())) ||
      (s.date && s.date.includes(search))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Soil Telemetry & NPK Chemistry"
        subtitle="Real-time soil fertility indices, macronutrient balance, pH levels, and laboratory testing ledger."
        icon={<FlaskConical className="w-6 h-6" />}
        action={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Soil Record
          </button>
        }
      />

      {/* Soil Health Score & Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Composite Soil Health Score Banner */}
        <div className="bg-gradient-to-br from-agri-900 via-agri-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-agri-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-agri-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-agri-200">Average Composite Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">{avgHealthScore}</span>
              <span className="text-lg font-bold text-agri-300">/ 100</span>
            </div>
            <p className="text-xs text-agri-100 mt-2">
              {totalSamples > 0 ? (
                <>Overall soil fertility across <strong className="text-white">{totalSamples} test sample(s)</strong>.</>
              ) : (
                'No database soil test records logged yet.'
              )}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-agri-700/60 text-[11px] text-agri-300">
            Total Laboratory Samples: {totalSamples}
          </div>
        </div>

        {/* NPK & Metric Averages Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Avg Nitrogen (N)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgN} <span className="text-xs text-slate-400 font-semibold">mg/kg</span></span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Database</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, (Number(avgN) / 60) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Avg Phosphorus (P)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgP} <span className="text-xs text-slate-400 font-semibold">mg/kg</span></span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Database</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (Number(avgP) / 50) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Avg Potassium (K)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgK} <span className="text-xs text-slate-400 font-semibold">mg/kg</span></span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Database</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, (Number(avgK) / 70) * 100)}%` }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Average Soil pH</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgPH}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Target: 6.0-7.5</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Agronomic pH balance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Average Moisture</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgMoisture}%</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">Volumetric</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Field capacity moisture</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Avg Organic Matter</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{avgOM}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Humus Content</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Organic matter composition</p>
          </div>
        </div>
      </div>

      {/* NPK Bar Chart Visualization */}
      {soilRecords.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Field Sector NPK Distribution Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Nitrogen, Phosphorus, and Potassium levels from MongoDB Atlas (mg/kg)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npkChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="Nitrogen" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Phosphorus" fill="#eab308" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Potassium" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Search & History Table */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search field soil test history or notes..." />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Field Sector</th>
                <th className="py-3.5 px-4">Sample Date</th>
                <th className="py-3.5 px-4">N (Nitrogen)</th>
                <th className="py-3.5 px-4">P (Phosphorus)</th>
                <th className="py-3.5 px-4">K (Potassium)</th>
                <th className="py-3.5 px-4">pH Level</th>
                <th className="py-3.5 px-4">Moisture</th>
                <th className="py-3.5 px-4">Organic Matter</th>
                <th className="py-3.5 px-4">Health Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-medium">
                    Loading soil laboratory records from backend database...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600">No soil laboratory records available</p>
                    <p className="text-xs text-slate-400 mt-1">Add your first soil laboratory sample to track fertility indices and NPK chemistry.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const fieldNameStr = r.fieldName || (typeof r.field === 'object' ? r.field.name : 'Field Sector');
                  return (
                    <tr key={r.id || r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>{fieldNameStr}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">{r.date ? r.date.split('T')[0] : 'N/A'}</td>
                      <td className="py-4 px-4 font-bold text-emerald-700">{r.nitrogen} mg/kg</td>
                      <td className="py-4 px-4 font-bold text-amber-700">{r.phosphorus} mg/kg</td>
                      <td className="py-4 px-4 font-bold text-sky-700">{r.potassium} mg/kg</td>
                      <td className="py-4 px-4 font-semibold text-slate-800">{r.pH}</td>
                      <td className="py-4 px-4 text-slate-600">{r.moisture}%</td>
                      <td className="py-4 px-4 text-slate-600">{r.organicMatter}%</td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-agri-700 bg-agri-50 px-2.5 py-1 rounded-full text-xs border border-agri-200">
                          {r.healthScore}/100
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 text-slate-400 hover:text-agri-700 rounded-lg hover:bg-agri-50 transition-colors cursor-pointer"
                            title="Edit Soil Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecordId(r.id || r._id!)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Soil Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Soil Record Modal */}
      <FormModal
        isOpen={isAddOpen}
        title={editingRecord ? 'Edit Soil Laboratory Record' : 'Add Soil Laboratory Record'}
        onClose={() => setIsAddOpen(false)}
      >
        <form onSubmit={handleSubmitSoilRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Field Sector *</label>
            {fields.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No fields registered. Please create a Field sector in the Fields tab first.</span>
              </div>
            ) : (
              <select
                required
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-agri-500"
              >
                {fields.map((f) => (
                  <option key={f.id || f._id} value={f.id || f._id}>
                    {f.name} ({f.soilType} - {f.area} {f.areaUnit || 'Acres'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nitrogen (N) mg/kg *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                placeholder="e.g. 42"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phosphorus (P) mg/kg *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                placeholder="e.g. 38"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Potassium (K) mg/kg *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                placeholder="e.g. 55"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">pH Level (0-14) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={pH}
                onChange={(e) => setPH(e.target.value)}
                placeholder="e.g. 6.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Moisture (0-100%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                required
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                placeholder="e.g. 28"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Organic Matter (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={organicMatter}
                onChange={(e) => setOrganicMatter(e.target.value)}
                placeholder="e.g. 3.4"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Laboratory Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Optimal nutrient balance for tomato flowering phase..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
            />
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
              disabled={isSubmitting || fields.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingRecord ? 'Update Soil Record' : 'Save Soil Record'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingRecordId)}
        title="Delete Soil Laboratory Record"
        message="Are you sure you want to delete this soil laboratory sample record? This action cannot be undone."
        confirmText="Delete Record"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingRecordId(null)}
      />
    </div>
  );
};
