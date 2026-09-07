import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Default fallback coordinates (Gandhi Nagar / Vaishali Nagar, Jaipur)
const DEFAULT_CENTER = [26.9030, 75.7420];

// Worker relative offsets from user location (within 400m - 1.2km)
const WORKER_OFFSETS = [
  {
    id: 'w1',
    name: 'Ramesh Kumar',
    service: 'Electrician',
    img: '/electrician-card.jpg',
    badgeColor: '#2563EB',
    badgeIcon: '⚡',
    dLat: 0.0055,
    dLng: -0.0065, // Top-left
  },
  {
    id: 'w2',
    name: 'Dinesh Jain',
    service: 'AC Repair',
    img: '/ac-repair-card.jpg',
    badgeColor: '#EA580C',
    badgeIcon: '❄️',
    dLat: 0.0060,
    dLng: 0.0050, // Top-right
  },
  {
    id: 'w3',
    name: 'Mahesh Mali',
    service: 'Plumber',
    img: '/plumber-card.jpg',
    badgeColor: '#0284C7',
    badgeIcon: '🚰',
    dLat: -0.0045,
    dLng: -0.0075, // Bottom-left (kept above sheet boundary)
  },
  {
    id: 'w4',
    name: 'Suresh Suthar',
    service: 'Electrician',
    img: '/electrician-card.jpg',
    badgeColor: '#2563EB',
    badgeIcon: '⚡',
    dLat: 0.0020,
    dLng: 0.0085, // Right
  },
  {
    id: 'w5',
    name: 'Vikram Gehlot',
    service: 'Electrician',
    img: '/electrician-card.jpg',
    badgeColor: '#2563EB',
    badgeIcon: '⚡',
    dLat: -0.0035,
    dLng: 0.0025, // Center-bottom (kept above sheet boundary)
  },
];

export default function MapView({ onSelectService, onLocationFound }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [userCoords, setUserCoords] = useState(DEFAULT_CENTER);

  const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '6cdeaP6RXF1ayeMycrO9';

  // 1. Initialize Leaflet Map with MapTiler Streets/Retina Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Offset center slightly downwards in latitude so markers are centered in upper visible area
    const initialVisualCenter = [userCoords[0] - 0.0025, userCoords[1]];

    const map = L.map(mapContainerRef.current, {
      center: initialVisualCenter,
      zoom: 14.5,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // ── MapTiler Native Vector / Retina Tile Layer ──
    const tileUrl = maptilerKey
      ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}@2x.png?key=${maptilerKey}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      tileSize: maptilerKey ? 512 : 256,
      zoomOffset: maptilerKey ? -1 : 0,
      maxZoom: 19,
    }).addTo(map);

    // Layer group for dynamic markers
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Render Markers for current coordinates
    renderMarkers(userCoords, markersGroup, map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [maptilerKey]);

  // 2. Request Live GPS Location Access (navigator.geolocation)
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = [latitude, longitude];
        setUserCoords(newCoords);

        if (mapInstanceRef.current) {
          const visualCenter = [latitude - 0.0025, longitude];
          mapInstanceRef.current.setView(visualCenter, 14.5, { animate: true, duration: 1 });
        }

        if (markersGroupRef.current && mapInstanceRef.current) {
          renderMarkers(newCoords, markersGroupRef.current, mapInstanceRef.current);
        }

        // Reverse-geocode to get real Locality / Area name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const areaName =
              addr.suburb ||
              addr.neighbourhood ||
              addr.residential ||
              addr.quarter ||
              addr.city_district ||
              addr.town ||
              addr.city ||
              'My Location';

            if (onLocationFound) {
              onLocationFound(areaName, newCoords);
            }
          }
        } catch (err) {
          console.warn('Geocoding notice:', err);
        }
      },
      (err) => {
        console.log('Location permission info:', err.message);
        // Fallback to default area
        if (onLocationFound) {
          onLocationFound('Gandhi Nagar', DEFAULT_CENTER);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Helper to render user radar marker and nearby 5 Karigar markers
  const renderMarkers = (center, group, map) => {
    group.clearLayers();

    // 1. User Live Radar Pin
    const userIcon = L.divIcon({
      className: 'leaflet-user-marker-container',
      html: `
        <div class="user-radar-marker-inner">
          <div class="user-radar-wave r1"></div>
          <div class="user-radar-wave r2"></div>
          <div class="user-radar-dot"></div>
          <div class="user-eta-badge">2 min away</div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 30],
    });

    L.marker(center, { icon: userIcon, interactive: false }).addTo(group);

    // 2. Nearby Karigar Captain Pins
    WORKER_OFFSETS.forEach((w) => {
      const workerPos = [center[0] + w.dLat, center[1] + w.dLng];

      const workerIcon = L.divIcon({
        className: 'leaflet-worker-marker-container',
        html: `
          <div class="kpin-marker-inner" title="${w.name} (${w.service}) · Tap to book">
            <div class="kpin-avatar-wrap">
              <img src="${w.img}" alt="${w.name}" class="kpin-photo" />
              <span class="kpin-badge" style="background-color: ${w.badgeColor};">
                ${w.badgeIcon}
              </span>
            </div>
            <div class="kpin-pointer" style="border-top-color: ${w.badgeColor};"></div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
      });

      const marker = L.marker(workerPos, { icon: workerIcon }).addTo(group);

      marker.on('click', () => {
        if (onSelectService) {
          onSelectService(w.service);
        }
      });
    });
  };

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="leaflet-map-canvas" />
    </div>
  );
}
