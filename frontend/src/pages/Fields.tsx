import React, { useEffect, useState } from 'react';
import { Map, Plus, MapPin, FlaskConical, Sprout, Ruler, Trash2, Edit3, Droplets, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { GoogleFieldMap } from '../components/gis/GoogleFieldMap';
import { FormModal } from '../components/common/FormModal';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { farmService } from '../services/farmService';
import { Field } from '../types';
import { useToast } from '../hooks/useToast';

export const Fields: React.FC = () => {
  const { showToast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('Green Valley Main Estate');
  const [area, setArea] = useState('5');
  const [areaUnit, setAreaUnit] = useState('Acres');
  const [soilType, setSoilType] = useState('Red Soil');
  const [currentCrop, setCurrentCrop] = useState('Tomato');
  const [irrigationType, setIrrigationType] = useState('Drip');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const data = await farmService.getFields();
    setFields(data);
  };

  // Callback when user selects location on Google Map (click, drag, search)
  const handleMapLocationSelect = (selection: { lat: number; lng: number; address: string }) => {
    setLat(selection.lat.toString());
    setLng(selection.lng.toString());
    if (selection.address) {
      setAddress(selection.address);
    }
  };

  const handleOpenAddForm = () => {
    setEditingField(null);
    setName('');
    setArea('5');
    setAreaUnit('Acres');
    setSoilType('Red Soil');
    setCurrentCrop('Tomato');
    setIrrigationType('Drip');
    setSowingDate(new Date().toISOString().split('T')[0]);
    setExpectedHarvestDate('');
    setNotes('');
    setIsAddOpen(true);
  };

  const handleOpenEditForm = (field: Field) => {
    setEditingField(field);
    setName(field.name);
    setFarmName(field.farmName || 'Green Valley Main Estate');
    setArea(field.area.toString());
    setAreaUnit(field.areaUnit || 'Acres');
    setSoilType(field.soilType);
    setCurrentCrop(field.currentCrop);
    setIrrigationType(field.irrigationType || 'Drip');
    setSowingDate(field.sowingDate || new Date().toISOString().split('T')[0]);
    setExpectedHarvestDate(field.expectedHarvestDate || '');
    setNotes(field.notes || '');
    setLat(field.lat.toString());
    setLng(field.lng.toString());
    setAddress(field.address || '');
    setIsAddOpen(true);
  };

  const handleSubmitField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area || !soilType || !currentCrop || !lat || !lng) {
      showToast('Validation Error', 'Please fill in all required fields (Name, Area, Soil, Crop, Lat, Lng).', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<Field> = {
      name,
      farmName,
      area: parseFloat(area) || 5.0,
      areaUnit,
      soilType,
      currentCrop,
      irrigationType,
      sowingDate,
      expectedHarvestDate,
      notes,
      lat: parseFloat(lat) || 12.9716,
      lng: parseFloat(lng) || 77.5946,
      address,
      status: 'Active'
    };

    try {
      if (editingField) {
        await farmService.updateField(editingField.id || editingField._id!, payload);
        showToast('Field Sector Updated', `Field "${name}" has been updated in database.`, 'success');
      } else {
        await farmService.createField(payload);
        showToast('Field Sector Registered', `Field "${name}" saved to MongoDB database.`, 'success');
      }

      setIsAddOpen(false);
      setEditingField(null);
      loadFields();
    } catch {
      showToast('Error', 'Failed to save field sector to database.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteField = async () => {
    if (!deletingFieldId) return;

    try {
      await farmService.deleteField(deletingFieldId);
      showToast('Field Deleted', 'Field sector removed from database.', 'info');
      setDeletingFieldId(null);
      loadFields();
    } catch {
      showToast('Error', 'Failed to delete field sector.', 'error');
    }
  };

  const filteredFields = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.currentCrop.toLowerCase().includes(search.toLowerCase()) ||
      f.soilType.toLowerCase().includes(search.toLowerCase()) ||
      (f.address && f.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Field Sector GIS Mapping"
        subtitle="Individual plot telemetry, soil type classifications, and current crop allocations."
        icon={<Map className="w-6 h-6" />}
        action={
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Field Sector
          </button>
        }
      />

      {/* Google Maps Interactive GIS Layer */}
      <GoogleFieldMap
        fields={filteredFields}
        activeLocation={{ lat: parseFloat(lat) || 12.9716, lng: parseFloat(lng) || 77.5946 }}
        onLocationSelect={handleMapLocationSelect}
        onEditField={handleOpenEditForm}
        onDeleteField={(id) => setDeletingFieldId(id)}
        height="h-[600px]"
      />

      {/* Controls & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search saved fields by name, crop, soil, or address..."
        />
        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Showing <strong className="text-slate-900">{filteredFields.length}</strong> field sector(s)
        </div>
      </div>

      {/* Grid of Saved Field Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFields.map((field) => (
          <div
            key={field.id || field._id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700">{field.farmName || 'Green Valley Estate'}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{field.name}</h3>
                </div>
                <StatusBadge status={field.status || 'Active'} />
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" /> Sector Area:
                  </span>
                  <strong className="text-slate-800">{field.area} {field.areaUnit || 'Acres'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5" /> Soil Texture:
                  </span>
                  <strong className="text-slate-800">{field.soilType}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5" /> Active Crop:
                  </span>
                  <strong className="text-agri-700 font-bold">{field.currentCrop}</strong>
                </div>
                {field.irrigationType && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> Irrigation:
                    </span>
                    <strong className="text-slate-800">{field.irrigationType}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500 truncate">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{field.address || `Lat: ${field.lat.toFixed(4)}, Lng: ${field.lng.toFixed(4)}`}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  Soil Health: {field.soilHealthScore || 80}/100
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditForm(field)}
                    className="p-1.5 text-slate-500 hover:text-agri-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Field Sector"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingFieldId(field.id || field._id!)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Field Sector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Field Modal */}
      <FormModal
        isOpen={isAddOpen}
        title={editingField ? 'Edit Field Sector' : 'Register Field Sector'}
        onClose={() => setIsAddOpen(false)}
      >
        <form onSubmit={handleSubmitField} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Field / Sector Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Field - Tomato Plot"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area *</label>
              <input
                type="number"
                step="0.1"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area Unit</label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              >
                <option value="Acres">Acres</option>
                <option value="Hectares">Hectares</option>
                <option value="Sq Meters">Sq Meters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Soil Type *</label>
              <input
                type="text"
                required
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                placeholder="e.g. Red Soil, Loamy Clay"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Crop *</label>
              <input
                type="text"
                required
                value={currentCrop}
                onChange={(e) => setCurrentCrop(e.target.value)}
                placeholder="e.g. Rice, Tomato, Maize"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Irrigation Type</label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler System</option>
                <option value="Flood">Flood / Canal</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sowing Date</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Address / Landmark</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Bangalore, Karnataka, India"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Latitude *</label>
              <input
                type="text"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Longitude *</label>
              <input
                type="text"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add sector notes, fertilizer history, or observations..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Database...' : editingField ? 'Update Field Sector' : 'Save Field Sector'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingFieldId}
        title="Delete Field Sector"
        message="Are you sure you want to remove this field sector? This action will permanently remove it from MongoDB Atlas."
        confirmText="Delete Sector"
        onConfirm={handleDeleteField}
        onClose={() => setDeletingFieldId(null)}
      />
    </div>
  );
};
