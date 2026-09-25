import React, { useEffect, useRef, useState } from 'react';
import { Search, Navigation, AlertTriangle, CheckCircle, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Field } from '../../types';

interface LocationSelection {
  lat: number;
  lng: number;
  address: string;
}

interface GoogleFieldMapProps {
  fields: Field[];
  activeLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (selection: LocationSelection) => void;
  onEditField?: (field: Field) => void;
  onDeleteField?: (fieldId: string) => void;
  height?: string;
}

/**
 * Load Google Maps JS API script dynamically into document head.
 */
const loadGoogleMapsScript = (apiKey: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      resolve((window as any).google);
      return;
    }

    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve((window as any).google));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google && (window as any).google.maps) {
        resolve((window as any).google);
      } else {
        reject(new Error('Google Maps script loaded but google namespace not found'));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export const GoogleFieldMap: React.FC<GoogleFieldMapProps> = ({
  fields,
  activeLocation,
  onLocationSelect,
  onEditField,
  onDeleteField,
  height = 'h-[600px]'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [map, setMap] = useState<any>(null);
  const [activeMarker, setActiveMarker] = useState<any>(null);
  const [fieldMarkers, setFieldMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 1. Initialize Google Maps via dynamic script loader
  useEffect(() => {
    if (!apiKey) {
      setApiError('Google Maps API key is not configured. Please check VITE_GOOGLE_MAPS_API_KEY in frontend/.env');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    loadGoogleMapsScript(apiKey)
      .then((gObj: any) => {
        if (!isMounted || !mapRef.current) return;

        const defaultCenter = activeLocation || { lat: 12.9716, lng: 77.5946 }; // Bangalore default

        const mapInstance = new gObj.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeId: gObj.maps.MapTypeId.HYBRID,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const sharedInfoWindow = new gObj.maps.InfoWindow();
        setInfoWindow(sharedInfoWindow);
        setMap(mapInstance);
        setIsLoading(false);

        // Map Click Event Listener
        mapInstance.addListener('click', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            handleMapClick(lat, lng, mapInstance, gObj, sharedInfoWindow);
          }
        });

        // Initialize Google Places Autocomplete
        if (searchInputRef.current && gObj.maps.places) {
          try {
            const autocomplete = new gObj.maps.places.Autocomplete(searchInputRef.current, {
              fields: ['geometry', 'formatted_address', 'name']
            });
            autocomplete.bindTo('bounds', mapInstance);

            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place && place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || place.name || '';

                mapInstance.setCenter({ lat, lng });
                mapInstance.setZoom(15);
                placeOrUpdateActiveMarker(lat, lng, address, mapInstance, gObj);
              } else if (searchInputRef.current?.value) {
                geocodeAddressQuery(searchInputRef.current.value, mapInstance, gObj);
              }
            });
          } catch (e) {
            console.warn('Google Places Autocomplete init warning:', e);
          }
        }
      })
      .catch((err: any) => {
        console.error('Google Maps Load Error:', err);
        if (isMounted) {
          setApiError('Failed to load Google Maps API. Please check your API key and network connection.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // 2. Dual Geocode Function (Primary: Google Geocoder, Fallback: Nominatim Search API)
  const geocodeAddressQuery = async (query: string, mapInstance: any, gObj: any) => {
    if (!query || !mapInstance) return;

    setIsSearching(true);

    // Primary: Try Google Geocoder API
    if (gObj && gObj.maps && gObj.maps.Geocoder) {
      try {
        const geocoder = new gObj.maps.Geocoder();
        const res = await new Promise<any>((resolve) => {
          geocoder.geocode({ address: query }, (results: any[], status: string) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          });
        });

        if (res) {
          const lat = res.geometry.location.lat();
          const lng = res.geometry.location.lng();
          const address = res.formatted_address || query;

          mapInstance.setCenter({ lat, lng });
          mapInstance.setZoom(15);
          placeOrUpdateActiveMarker(lat, lng, address, mapInstance, gObj);
          setIsSearching(false);
          return;
        }
      } catch (err) {
        console.warn('Google Geocoder failed, using fallback:', err);
      }
    }

    // Secondary Fallback: Nominatim OpenStreetMap Search API
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const address = data[0].display_name || query;

        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(15);
        if (gObj) {
          placeOrUpdateActiveMarker(lat, lng, address, mapInstance, gObj);
        }
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.warn('Fallback search error:', err);
    }

    setIsSearching(false);
    alert(`Could not find location "${query}". Please check spelling (e.g. Bangalore, Mandya, Mysore, Ramanagara).`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gObj = (window as any).google;
    if (searchQuery && map) {
      geocodeAddressQuery(searchQuery, map, gObj);
    }
  };

  // 3. Dual Reverse Geocode Helper (Google + Nominatim fallback)
  const reverseGeocode = (
    lat: number,
    lng: number,
    gObj: any,
    callback: (address: string) => void
  ) => {
    if (gObj && gObj.maps && gObj.maps.Geocoder) {
      const geocoder = new gObj.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status === 'OK' && results && results[0]) {
          callback(results[0].formatted_address);
          return;
        }
        // Fallback reverse geocoding via Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((r) => r.json())
          .then((d) => callback(d.display_name || `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`))
          .catch(() => callback(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`));
      });
    } else {
      callback(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  // 4. Place or Update Active Selection Marker
  const placeOrUpdateActiveMarker = (
    lat: number,
    lng: number,
    initialAddress: string,
    mapInstance: any,
    gObj: any
  ) => {
    if (activeMarker) {
      activeMarker.setMap(null);
    }

    const newMarker = new gObj.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      draggable: true,
      animation: gObj.maps.Animation.DROP,
      title: 'Selected Field Location',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      }
    });

    setActiveMarker(newMarker);
    setGeocodedAddress(initialAddress);

    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: initialAddress });
    }

    // Drag Listener
    newMarker.addListener('dragend', (e: any) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        reverseGeocode(newLat, newLng, gObj, (addr) => {
          setGeocodedAddress(addr);
          if (onLocationSelect) {
            onLocationSelect({ lat: newLat, lng: newLng, address: addr });
          }
        });
      }
    });
  };

  // 4b. Re-center & place marker when activeLocation prop changes dynamically
  useEffect(() => {
    if (!map || !activeLocation || typeof window === 'undefined' || !(window as any).google) return;
    const gObj = (window as any).google;
    const { lat, lng } = activeLocation;
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      map.setCenter({ lat, lng });
      map.setZoom(15);
      reverseGeocode(lat, lng, gObj, (addr) => {
        placeOrUpdateActiveMarker(lat, lng, addr, map, gObj);
      });
    }
  }, [map, activeLocation?.lat, activeLocation?.lng]);


  // 5. Handle Map Click Event
  const handleMapClick = (
    lat: number,
    lng: number,
    mapInstance: any,
    gObj: any,
    windowObj: any
  ) => {
    if (windowObj) windowObj.close();
    reverseGeocode(lat, lng, gObj, (addr) => {
      placeOrUpdateActiveMarker(lat, lng, addr, mapInstance, gObj);
    });
  };

  // 6. Render Saved Field Markers
  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google) return;

    const gObj = (window as any).google;

    // Clear existing markers
    fieldMarkers.forEach((m) => m.setMap(null));
    const newMarkers: any[] = [];

    const bounds = new gObj.maps.LatLngBounds();

    fields.forEach((field) => {
      if (typeof field.lat !== 'number' || typeof field.lng !== 'number') return;

      const position = { lat: field.lat, lng: field.lng };
      bounds.extend(position);

      const marker = new gObj.maps.Marker({
        position,
        map,
        title: field.name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      const fieldId = field.id || field._id!;

      marker.addListener('click', () => {
        if (!infoWindow) return;

        const contentString = `
          <div style="padding: 8px; max-width: 260px; font-family: system-ui, sans-serif;">
            <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">${field.farmName || 'Farm Sector'}</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 2px;">${field.name}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 6px; line-height: 1.5;">
              <strong>Active Crop:</strong> ${field.currentCrop}<br/>
              <strong>Soil Type:</strong> ${field.soilType}<br/>
              <strong>Area:</strong> ${field.area} ${field.areaUnit || 'Acres'}<br/>
              <strong>Address:</strong> ${field.address || `${field.lat.toFixed(4)}, ${field.lng.toFixed(4)}`}
            </div>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;">
              <button id="edit-field-${fieldId}" style="background: #15803d; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; flex: 1;">Edit Sector</button>
              <button id="delete-field-${fieldId}" style="background: #be123c; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">Delete</button>
            </div>
          </div>
        `;

        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);

        // Attach DOM events after InfoWindow renders
        setTimeout(() => {
          const editBtn = document.getElementById(`edit-field-${fieldId}`);
          const deleteBtn = document.getElementById(`delete-field-${fieldId}`);

          if (editBtn && onEditField) {
            editBtn.onclick = () => {
              onEditField(field);
              infoWindow.close();
            };
          }
          if (deleteBtn && onDeleteField) {
            deleteBtn.onclick = () => {
              onDeleteField(fieldId);
              infoWindow.close();
            };
          }
        }, 100);
      });

      newMarkers.push(marker);
    });

    setFieldMarkers(newMarkers);

    // Fit map bounds if fields exist
    if (fields.length > 0) {
      map.fitBounds(bounds);
      if (fields.length === 1) {
        map.setZoom(14);
      }
    }
  }, [map, fields]);

  // 7. Handle "My Location" GPS button
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const gObj = (window as any).google;

        if (map && gObj) {
          map.setCenter({ lat, lng });
          map.setZoom(15);

          reverseGeocode(lat, lng, gObj, (addr) => {
            placeOrUpdateActiveMarker(lat, lng, addr, map, gObj);
            setGpsLoading(false);
          });
        }
      },
      (err) => {
        console.warn('Geolocation Error:', err.message);
        alert('Could not obtain GPS location. Please ensure location permissions are enabled.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Render API Error State
  if (apiError) {
    return (
      <div className={`w-full ${height} bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center p-6 text-center text-white`}>
        <div className="max-w-md space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">Google Maps Configuration Required</h3>
          <p className="text-xs text-slate-400">{apiError}</p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-left text-xs font-mono text-emerald-400">
            frontend/.env:<br/>
            VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
          </div>
        </div>
      </div>
    );
  }

  const containerHeightClass = isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none h-screen' : `relative w-full rounded-2xl ${height}`;
  const mapInnerHeightClass = isFullscreen ? 'w-full h-full' : `w-full ${height}`;

  return (
    <div className={`${containerHeightClass} overflow-hidden border border-slate-200 shadow-lg bg-slate-950 transition-all duration-300`}>
      {/* Map Control Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Google Places & Location Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96 pointer-events-auto shadow-xl">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search village, city, town (e.g. Bangalore, Mandya, Mysore)..."
            className="w-full pl-10 pr-24 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-agri-500 shadow-md"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute left-3 top-3 text-slate-400 hover:text-agri-700 transition-colors"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin text-agri-600" /> : <Search className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs"
          >
            Search Map
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs font-bold rounded-xl border border-slate-700/80 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Google Maps Live Layer
          </span>

          <button
            type="button"
            onClick={handleMyLocation}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {gpsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-agri-700" />}
            My Location
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1.5 p-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 shadow-md transition-all active:scale-95"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-700" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className={`w-full ${mapInnerHeightClass} bg-slate-900 flex items-center justify-center text-white`}>
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-agri-500 animate-spin" />
            <span className="text-xs font-bold tracking-wide">Loading Google Maps GIS Layer...</span>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div ref={mapRef} className={mapInnerHeightClass} />

      {/* Selected Address Banner Footer */}
      {geocodedAddress && (
        <div className="bg-slate-900 px-4 py-2.5 text-xs text-slate-300 flex items-center justify-between border-t border-slate-800 z-10 relative">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-200 shrink-0">Selected Location:</span>
            <span className="text-slate-300 font-medium truncate">{geocodedAddress}</span>
          </div>
          <span className="text-[11px] font-mono text-agri-400 ml-2 shrink-0 hidden sm:inline">Click map or drag marker to set field boundaries</span>
        </div>
      )}
    </div>
  );
};
