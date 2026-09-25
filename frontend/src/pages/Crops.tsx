import React, { useEffect, useState } from 'react';
import { Sprout, Plus, Calendar, Edit3, Trash2, Layers, MapPin } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FormModal } from '../components/common/FormModal';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { cropService } from '../services/cropService';
import { farmService } from '../services/farmService';
import { Crop, Farm, Field, GrowthStage } from '../types';
import { useToast } from '../hooks/useToast';

export const Crops: React.FC = () => {
  const { showToast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [allFields, setAllFields] = useState<Field[]>([]);
  
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [deletingCropId, setDeletingCropId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvest, setExpectedHarvest] = useState('');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('Vegetative');
  const [healthStatus, setHealthStatus] = useState<string>('Healthy');
  const [estimatedYieldTons, setEstimatedYieldTons] = useState<string>('10');

  const lifecycleStages: GrowthStage[] = [
    'Planting',
    'Germination',
    'Vegetative',
    'Flowering',
    'Fruiting',
    'Harvest',
  ];

  const healthStatuses = ['Healthy', 'Needs Attention', 'At Risk', 'Diseased', 'Critical Risk'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cropsData, farmsData, fieldsData] = await Promise.all([
        cropService.getCrops(),
        farmService.getFarms(),
        farmService.getFields(),
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
      setAllFields(fieldsData);

      if (farmsData.length > 0) {
        const firstFarmId = farmsData[0].id || farmsData[0]._id || '';
        setSelectedFarmId(firstFarmId);
      }
    } catch (err) {
      console.error('Error loading crop modules data:', err);
      showToast('Error', 'Failed to load crop cycle data from backend server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically filter fields belonging to the selected Farm
  const selectedFarmObj = farms.find(
    (f) => f.id === selectedFarmId || f._id === selectedFarmId
  );
  
  let availableFields = allFields.filter((field) => {
    if (!selectedFarmObj) return true;
    if (field.farmId && (field.farmId === selectedFarmId || field.farmId === selectedFarmObj._id)) {
      return true;
    }
    if (field.farmName && selectedFarmObj.name && field.farmName.trim().toLowerCase() === selectedFarmObj.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  });

  // Fallback: If no fields strictly match the selected farm name/ID, show all fields for the user
  if (availableFields.length === 0 && allFields.length > 0) {
    availableFields = allFields;
  }

  const handleOpenAddModal = () => {
    setEditingCrop(null);
    setName('');
    setVariety('');
    setSowingDate(new Date().toISOString().split('T')[0]);
    setExpectedHarvest('');
    setGrowthStage('Vegetative');
    setHealthStatus('Healthy');
    setEstimatedYieldTons('10');

    if (farms.length > 0) {
      const defaultFarmId = farms[0].id || farms[0]._id || '';
      setSelectedFarmId(defaultFarmId);
      
      const farmObj = farms[0];
      let matchingFields = allFields.filter(
        (f) =>
          f.farmId === defaultFarmId ||
          (f.farmName && farmObj.name && f.farmName.trim().toLowerCase() === farmObj.name.trim().toLowerCase())
      );
      if (matchingFields.length === 0 && allFields.length > 0) {
        matchingFields = allFields;
      }

      if (matchingFields.length > 0) {
        setSelectedFieldId(matchingFields[0].id || matchingFields[0]._id || '');
      } else {
        setSelectedFieldId('');
      }
    } else {
      setSelectedFarmId('');
      setSelectedFieldId('');
    }

    setIsAddOpen(true);
  };

  const handleOpenEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setName(crop.name);
    setVariety(crop.variety || '');
    
    // Find Farm
    let matchedFarmId = typeof crop.farm === 'string' ? crop.farm : (crop.farm?._id || crop.farmId || '');
    if (!matchedFarmId && crop.farmName) {
      const foundFarm = farms.find((f) => f.name.trim().toLowerCase() === crop.farmName?.trim().toLowerCase());
      if (foundFarm) matchedFarmId = foundFarm.id || foundFarm._id || '';
    }
    if (!matchedFarmId && farms.length > 0) {
      matchedFarmId = farms[0].id || farms[0]._id || '';
    }
    setSelectedFarmId(matchedFarmId);

    // Find Field
    let matchedFieldId = typeof crop.field === 'string' ? crop.field : (crop.field?._id || crop.fieldId || '');
    if (!matchedFieldId && crop.fieldName) {
      const foundField = allFields.find((f) => f.name.trim().toLowerCase() === crop.fieldName?.trim().toLowerCase());
      if (foundField) matchedFieldId = foundField.id || foundField._id || '';
    }
    setSelectedFieldId(matchedFieldId);

    setSowingDate(crop.sowingDate || crop.plantingDate || new Date().toISOString().split('T')[0]);
    setExpectedHarvest(crop.expectedHarvest || crop.expectedHarvestDate || '');
    setGrowthStage((crop.stage || crop.growthStage || 'Vegetative') as GrowthStage);
    setHealthStatus(crop.healthStatus || crop.status || 'Healthy');
    setEstimatedYieldTons((crop.estimatedYieldTons || 10).toString());

    setIsAddOpen(true);
  };

  const handleFarmChange = (farmId: string) => {
    setSelectedFarmId(farmId);
    const farmObj = farms.find((f) => f.id === farmId || f._id === farmId);
    let matchingFields = allFields.filter((field) => {
      if (field.farmId && (field.farmId === farmId || (farmObj && field.farmId === farmObj._id))) {
        return true;
      }
      if (field.farmName && farmObj?.name && field.farmName.trim().toLowerCase() === farmObj.name.trim().toLowerCase()) {
        return true;
      }
      return false;
    });

    if (matchingFields.length === 0 && allFields.length > 0) {
      matchingFields = allFields;
    }

    if (matchingFields.length > 0) {
      setSelectedFieldId(matchingFields[0].id || matchingFields[0]._id || '');
    } else {
      setSelectedFieldId('');
    }
  };

  const handleSubmitCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Validation Error', 'Please enter a Crop Name.', 'error');
      return;
    }
    if (!selectedFarmId) {
      showToast('Validation Error', 'Please select a Farm.', 'error');
      return;
    }
    if (!selectedFieldId) {
      showToast('Validation Error', 'Please select a Field Sector belonging to the selected Farm.', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      variety,
      farm: selectedFarmId,
      farmId: selectedFarmId,
      field: selectedFieldId,
      fieldId: selectedFieldId,
      sowingDate,
      plantingDate: sowingDate,
      expectedHarvest,
      stage: growthStage,
      growthStage,
      healthStatus,
      status: healthStatus,
      estimatedYieldTons: parseFloat(estimatedYieldTons) || 0,
    };

    try {
      if (editingCrop) {
        await cropService.updateCrop(editingCrop.id || editingCrop._id!, payload);
        showToast('Crop Record Updated', `Crop "${name}" update saved to database.`, 'success');
      } else {
        await cropService.createCrop(payload);
        showToast('Crop Cycle Registered', `Crop "${name}" successfully registered in database.`, 'success');
      }

      setIsAddOpen(false);
      setEditingCrop(null);
      const updatedCrops = await cropService.getCrops();
      setCrops(updatedCrops);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to save crop cycle record.';
      showToast('Error', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCropId) return;

    try {
      await cropService.deleteCrop(deletingCropId);
      showToast('Crop Deleted', 'Crop cycle record removed from database.', 'success');
      setDeletingCropId(null);
      const updatedCrops = await cropService.getCrops();
      setCrops(updatedCrops);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to delete crop record.';
      showToast('Error', errMsg, 'error');
    }
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.variety && c.variety.toLowerCase().includes(search.toLowerCase())) ||
      (c.fieldName && c.fieldName.toLowerCase().includes(search.toLowerCase())) ||
      (c.farmName && c.farmName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Crop Inventory & Lifecycle Tracker"
        subtitle="Active harvest cycles, plant variety metrics, and growth stage timelines."
        icon={<Sprout className="w-6 h-6" />}
        action={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Register Crop Cycle
          </button>
        }
      />

      {/* Visual Crop Lifecycle Pipeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
          Standard Crop Phenological Growth Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {lifecycleStages.map((stage, idx) => (
            <div
              key={stage}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                idx === 2
                  ? 'bg-agri-700 text-white border-agri-800 shadow-sm font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 font-medium'
              }`}
            >
              <span className="text-[10px] font-bold uppercase opacity-75">Stage {idx + 1}</span>
              <span className="text-xs font-extrabold mt-1">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search crop, variety, farm, or field..." />
      </div>

      {/* Crops Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Crop & Variety</th>
                <th className="py-3.5 px-4">Farm Estate</th>
                <th className="py-3.5 px-4">Assigned Field</th>
                <th className="py-3.5 px-4">Sowing Date</th>
                <th className="py-3.5 px-4">Growth Stage</th>
                <th className="py-3.5 px-4">Expected Harvest</th>
                <th className="py-3.5 px-4">Health Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                    Loading crop cycles from database...
                  </td>
                </tr>
              ) : filteredCrops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Sprout className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600">No crop cycle records found</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Register Crop Cycle" above to add your first crop.</p>
                  </td>
                </tr>
              ) : (
                filteredCrops.map((crop) => (
                  <tr key={crop.id || crop._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-agri-50 text-agri-700 rounded-lg">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{crop.name}</span>
                          <span className="block text-xs text-slate-400 font-normal">{crop.variety || 'Standard Variety'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {crop.farmName || (typeof crop.farm === 'object' ? crop.farm.name : 'Main Estate')}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {crop.fieldName || (typeof crop.field === 'object' ? crop.field.name : 'Field Sector')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {crop.sowingDate || crop.plantingDate || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                        {crop.stage || crop.growthStage || 'Vegetative'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {crop.expectedHarvest || crop.expectedHarvestDate || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={crop.healthStatus || crop.status || 'Healthy'} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(crop)}
                          className="p-1.5 text-slate-400 hover:text-agri-700 rounded-lg hover:bg-agri-50 transition-colors"
                          title="Edit Crop Cycle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCropId(crop.id || crop._id!)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Crop Cycle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Crop Modal */}
      <FormModal
        isOpen={isAddOpen}
        title={editingCrop ? 'Edit Crop Cycle Record' : 'Register New Crop Cycle'}
        onClose={() => setIsAddOpen(false)}
      >
        <form onSubmit={handleSubmitCrop} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Crop Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tomato"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variety</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Roma VF Hybrid"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500"
              />
            </div>
          </div>

          {/* Relational Cascaded Farm & Field Selection */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">1. Select Farm *</label>
              <select
                required
                value={selectedFarmId}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 outline-none"
              >
                {farms.length === 0 ? (
                  <option value="">No Farms Available</option>
                ) : (
                  farms.map((f) => (
                    <option key={f.id || f._id} value={f.id || f._id}>
                      {f.name} ({f.location || 'Main'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">2. Select Field Sector *</label>
              <select
                required
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 outline-none"
              >
                {availableFields.length === 0 ? (
                  <option value="">No Fields in this Farm</option>
                ) : (
                  availableFields.map((fd) => (
                    <option key={fd.id || fd._id} value={fd.id || fd._id}>
                      {fd.name} ({fd.soilType} - {fd.area} {fd.areaUnit || 'Acres'})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sowing / Planting Date</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expected Harvest Date</label>
              <input
                type="date"
                value={expectedHarvest}
                onChange={(e) => setExpectedHarvest(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Growth Stage</label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as GrowthStage)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              >
                {lifecycleStages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Health Status</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              >
                {healthStatuses.map((hs) => (
                  <option key={hs} value={hs}>{hs}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Est. Yield (Tons)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={estimatedYieldTons}
                onChange={(e) => setEstimatedYieldTons(e.target.value)}
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
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingCrop ? 'Update Crop Record' : 'Save Crop Record'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingCropId)}
        title="Delete Crop Cycle Record"
        message="Are you sure you want to delete this crop cycle record? This action cannot be undone."
        confirmText="Delete Crop"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCropId(null)}
      />
    </div>
  );
};
