import React, { useEffect, useState } from 'react';
import {
  Tractor,
  Plus,
  Trash2,
  MapPin,
  Ruler,
  Layers,
  Edit3,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FormModal } from '../components/common/FormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchBar } from '../components/common/SearchBar';
import { GoogleFieldMap } from '../components/gis/GoogleFieldMap';
import { farmService } from '../services/farmService';
import { Farm } from '../types';
import { useToast } from '../hooks/useToast';

export const Farms: React.FC = () => {
  const { showToast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [totalArea, setTotalArea] = useState('50');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Under Maintenance' | 'Inactive'>('Active');
  
  // Geolocation & Coordinates State
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'timeout' | 'unsupported'
  >('idle');
  const [locationMessage, setLocationMessage] = useState<string>('');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    const data = await farmService.getFarms();
    setFarms(data);
  };

  // Browser Geolocation API Handler
  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationMessage('Geolocation is not supported by your browser.');
      showToast('Error', 'Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocationStatus('loading');
    setLocationMessage('Getting current location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = pos.coords.latitude;
        const currentLng = pos.coords.longitude;

        setLat(currentLat);
        setLng(currentLng);
        setLocationStatus('success');
        setLocationMessage(`Location detected (${currentLat.toFixed(4)}, ${currentLng.toFixed(4)})`);
        showToast('Location Detected', `Coordinates: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`, 'success');

        // Reverse geocode to readable location address
        reverseGeocodeCoords(currentLat, currentLng);
      },
      (err) => {
        setLat(null);
        setLng(null);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationStatus('denied');
            setLocationMessage('Location permission denied. Please allow location access in your browser.');
            showToast('Permission Denied', 'Please allow location access in browser settings.', 'error');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationStatus('unavailable');
            setLocationMessage('Unable to determine your physical location. Position unavailable.');
            showToast('Location Error', 'Unable to determine your location.', 'error');
            break;
          case err.TIMEOUT:
            setLocationStatus('timeout');
            setLocationMessage('Location request timed out. Please try again.');
            showToast('Timeout', 'Location request timed out.', 'error');
            break;
          default:
            setLocationStatus('unavailable');
            setLocationMessage(`Unable to determine your location: ${err.message}`);
            showToast('Location Error', err.message, 'error');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reverse Geocoding Helper (Google Maps Geocoder primary, Nominatim API fallback)
  const reverseGeocodeCoords = async (latitude: number, longitude: number) => {
    const gObj = typeof window !== 'undefined' ? (window as any).google : null;

    if (gObj && gObj.maps && gObj.maps.Geocoder) {
      try {
        const geocoder = new gObj.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], statusState: string) => {
          if (statusState === 'OK' && results && results[0]) {
            setLocation(results[0].formatted_address);
            return;
          }
          fallbackReverseGeocode(latitude, longitude);
        });
        return;
      } catch (e) {
        console.warn('Google Geocoder failed, using fallback:', e);
      }
    }

    fallbackReverseGeocode(latitude, longitude);
  };

  const fallbackReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data && data.display_name) {
        setLocation(data.display_name);
        return;
      }
    } catch (e) {
      console.warn('Nominatim reverse geocode failed:', e);
    }
    
    // Set coordinate fallback text if reverse geocode is unavailable
    if (!location) {
      setLocation(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    }
  };

  const handleOpenAddForm = () => {
    setEditingFarm(null);
    setName('');
    setLocation('');
    setTotalArea('50');
    setDescription('');
    setStatus('Active');
    setLat(null);
    setLng(null);
    setLocationStatus('idle');
    setLocationMessage('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocation(farm.location);
    setTotalArea(farm.totalArea.toString());
    setDescription(farm.description || '');
    setStatus(farm.status || 'Active');
    setLat(farm.lat || null);
    setLng(farm.lng || null);
    setLocationStatus(farm.lat && farm.lng ? 'success' : 'idle');
    setLocationMessage(farm.lat && farm.lng ? `Saved location (${farm.lat.toFixed(4)}, ${farm.lng.toFixed(4)})` : '');
    setIsFormOpen(true);
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Validation Error', 'Please provide a Farm Name.', 'error');
      return;
    }

    // Default coordinates if not set via GPS or Map
    const finalLat = lat !== null ? lat : 12.9716;
    const finalLng = lng !== null ? lng : 77.5946;
    const finalLocation = location.trim() || `GPS Location (${finalLat.toFixed(4)}, ${finalLng.toFixed(4)})`;

    const payload = {
      name,
      location: finalLocation,
      totalArea: parseFloat(totalArea) || 0,
      description,
      status,
      lat: finalLat,
      lng: finalLng
    };

    try {
      if (editingFarm) {
        await farmService.updateFarm(editingFarm.id || editingFarm._id!, payload);
        showToast('Farm Updated', `Farm "${name}" record updated in database.`, 'success');
      } else {
        await farmService.createFarm(payload);
        showToast('Farm Registered', `Farm "${name}" saved to MongoDB database.`, 'success');
      }

      setIsFormOpen(false);
      setEditingFarm(null);
      setName('');
      setLocation('');
      setDescription('');
      setLat(null);
      setLng(null);
      setLocationStatus('idle');
      setLocationMessage('');
      loadFarms();
    } catch (err: any) {
      console.error('Failed to save farm record:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save farm record to database.';
      showToast('Error', errMsg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await farmService.deleteFarm(deleteTargetId);
      showToast('Farm Deleted', 'Farm record removed from database.', 'info');
      setDeleteTargetId(null);
      loadFarms();
    } catch (err: any) {
      console.error('Failed to delete farm record:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete farm record.';
      showToast('Error', errMsg, 'error');
    }
  };

  const filteredFarms = farms.filter(
    (f) =>
      (f.name && f.name.toLowerCase().includes(search.toLowerCase())) ||
      (f.location && f.location.toLowerCase().includes(search.toLowerCase()))
  );


  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Farm Estates Management"
        subtitle="Manage primary agricultural properties, real GPS coordinates, acreage, and operational status."
        icon={<Tractor className="w-6 h-6" />}
        action={
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Farm Estate
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search farm name or location..." />
      </div>

      {/* Farm Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Farm Name</th>
                <th className="py-3.5 px-4">GPS & Location</th>
                <th className="py-3.5 px-4">Total Area</th>
                <th className="py-3.5 px-4">Fields</th>
                <th className="py-3.5 px-4">Active Crops</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFarms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No farm estates found in database. Click "Add Farm Estate" to register one.
                  </td>
                </tr>
              ) : (
                filteredFarms.map((farm) => (
                  <tr key={farm.id || farm._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-agri-50 text-agri-700 rounded-lg">
                          <Tractor className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{farm.name}</span>
                          {farm.description && (
                            <span className="block text-xs text-slate-400 font-normal truncate max-w-xs">
                              {farm.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-agri-600" /> {farm.location || 'Location Not Set'}
                        </span>
                        {typeof farm.lat === 'number' && typeof farm.lng === 'number' && (
                          <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                            GPS: {farm.lat.toFixed(4)}, {farm.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-slate-400" /> {farm.totalArea} ha
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" /> {farm.fieldCount || 0} Sectors
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-agri-700">{farm.activeCrops || 0} Crops</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={farm.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditForm(farm)}
                          className="p-1.5 text-slate-400 hover:text-agri-700 rounded-lg hover:bg-agri-50 transition-colors"
                          title="Edit Farm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(farm.id || farm._id!)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Farm"
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

      {/* Add / Edit Farm Modal */}
      <FormModal
        isOpen={isFormOpen}
        title={editingFarm ? 'Edit Farm Estate' : 'Register New Farm Estate'}
        onClose={() => setIsFormOpen(false)}
      >
        <form onSubmit={handleSaveFarm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Farm Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunrise Organic Estate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          {/* Real Physical Geolocation Button & Status Badges */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-agri-600" /> Physical Location (GPS)
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locationStatus === 'loading'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-agri-600 hover:bg-agri-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {locationStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Getting location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" /> Use Current Location
                  </>
                )}
              </button>
            </div>

            {/* Geolocation Status Indicator */}
            {locationStatus === 'loading' && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Getting current location...</span>
              </div>
            )}

            {locationStatus === 'success' && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{locationMessage}</span>
              </div>
            )}

            {(locationStatus === 'denied' ||
              locationStatus === 'unavailable' ||
              locationStatus === 'timeout' ||
              locationStatus === 'unsupported') && (
              <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{locationMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat !== null ? lat : ''}
                  onChange={(e) => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 12.9716"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng !== null ? lng : ''}
                  onChange={(e) => setLng(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 77.5946"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Readable Address / Location Name</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Auto-filled from GPS reverse geocode or enter manually"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Area (Hectares)</label>
              <input
                type="number"
                required
                value={totalArea}
                onChange={(e) => setTotalArea(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
              >
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary crop types, irrigation access, soil characteristics..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-agri-500/30"
            />
          </div>

          {/* Interactive Google Map Preview & Marker Verification */}
          {lat !== null && lng !== null && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Interactive Location Map Verification</label>
              <GoogleFieldMap
                fields={[]}
                activeLocation={{ lat, lng }}
                height="h-52"
                onLocationSelect={(sel) => {
                  setLat(sel.lat);
                  setLng(sel.lng);
                  if (sel.address) setLocation(sel.address);
                  setLocationStatus('success');
                  setLocationMessage(`Location updated from map (${sel.lat.toFixed(4)}, ${sel.lng.toFixed(4)})`);
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
            >
              {editingFarm ? 'Update Farm Record' : 'Save Farm Record'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Delete Farm Estate"
        message="Are you sure you want to delete this farm estate record? Associated field sectors will need reassignment."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
