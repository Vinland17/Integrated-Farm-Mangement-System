import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet default icon paths in bundlers
const customGreenIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="background-color: #15803d; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  info?: string;
}

interface MapCardProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  title?: string;
}

export const MapCard: React.FC<MapCardProps> = ({
  markers,
  center = [12.9716, 77.5946],
  zoom = 13,
  height = 'h-80',
  title = 'Geospatial Field & Estate Mapping',
}) => {
  const mapCenter: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : center;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-agri-700" />
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-agri-50 text-agri-700 rounded-full border border-agri-200">
            OpenStreetMap Live Layer
          </span>
        </div>
      )}
      <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-0`}>
        <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={customGreenIcon}>
              <Popup>
                <div className="p-1 text-slate-800 font-sans">
                  <h4 className="font-bold text-sm text-agri-900">{m.name}</h4>
                  {m.info && <p className="text-xs text-slate-600 mt-1">{m.info}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
