import { useEffect, useState, useRef } from 'react';
import './SimulatedMap.css';

// Coordinates for simulation (SVG viewbox 0 0 600 500)
const CAPTAIN_START = { x: 120, y: 380, label: 'You (Sarvottam Captain)' };

// Map matching customer locations in JOBS_BY_SKILL to coordinates on our SVG map
const CUSTOMER_LOCATIONS = {
  'Indra Colony, Barmer': { x: 420, y: 150 },
  'Gandhi Nagar, Barmer': { x: 480, y: 320 },
  'Station Road, Barmer': { x: 180, y: 140 },
  'Mahaveer Park, Barmer': { x: 320, y: 220 },
  'Ratanada, Barmer': { x: 380, y: 410 },
  'Sadar Bazar, Barmer': { x: 260, y: 280 },
};

export default function SimulatedMap({ online, activeJob, stage, onProgressUpdate }) {
  const [captainPos, setCaptainPos] = useState(CAPTAIN_START);
  const [navProgress, setNavProgress] = useState(0); // 0 to 100%
  const animationRef = useRef(null);

  const destination = activeJob ? (CUSTOMER_LOCATIONS[activeJob.area] || { x: 300, y: 250 }) : null;

  // Simulate movement when navigating
  useEffect(() => {
    if (stage === 'navigate' && destination) {
      setNavProgress(0);
      let start = Date.now();
      const duration = 12000; // 12 seconds to travel

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const currentProgressPct = progress * 100;
        setNavProgress(currentProgressPct);

        // Interpolate position
        const currentX = CAPTAIN_START.x + (destination.x - CAPTAIN_START.x) * progress;
        const currentY = CAPTAIN_START.y + (destination.y - CAPTAIN_START.y) * progress;
        setCaptainPos({ x: currentX, y: currentY });

        // Update remaining distance and time
        const rawDist = parseFloat(activeJob.dist) || 2.0;
        const remainingDist = Math.max(0, rawDist * (1 - progress));
        const remainingMins = Math.max(0, Math.round(rawDist * 4 * (1 - progress)));

        if (onProgressUpdate) {
          onProgressUpdate({
            pct: currentProgressPct,
            distance: remainingDist.toFixed(1) + ' km',
            time: remainingMins > 0 ? `${remainingMins} min` : 'Arriving now'
          });
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // If not navigating, keep captain at start position or customer position based on job stage
      if (stage !== 'navigate' && destination && (stage === 'otp' || stage === 'working' || stage === 'bill')) {
        setCaptainPos(destination);
      } else {
        setCaptainPos(CAPTAIN_START);
      }
      setNavProgress(0);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stage, activeJob]);

  // Determine active route path string
  const getRoutePath = () => {
    if (!destination) return '';
    // Let's make the path slightly curved/L-shaped instead of a straight line for realism
    const midX = (CAPTAIN_START.x + destination.x) / 2;
    return `M ${CAPTAIN_START.x} ${CAPTAIN_START.y} Q ${midX} ${CAPTAIN_START.y - 40} ${destination.x} ${destination.y}`;
  };

  return (
    <div className={`sim-map-container ${online ? 'online' : 'offline'} stage-${stage}`}>
      <svg className="sim-map-svg" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
        {/* Land Background */}
        <rect width="600" height="500" fill="#E8EEEE" className="map-land" />

        {/* Sand Dune / Desert accents (Barmer local vibe) */}
        <path d="M-50 420 Q120 400 240 450 T520 400 Q580 430 650 410 L650 550 L-50 550 Z" fill="#E1EAE9" className="map-dunes" />
        <path d="M-50 120 Q80 140 180 90 T420 110 T650 70 L650 -50 L-50 -50 Z" fill="#E1EAE9" className="map-dunes-top" />

        {/* Green Parks */}
        {/* Mahaveer Park Area */}
        <rect x="280" y="180" width="80" height="60" rx="10" fill="#D3E5DE" className="map-park" />
        <text x="320" y="215" className="map-label" textAnchor="middle">Mahaveer Park</text>

        {/* Shastri Nagar Ground */}
        <circle cx="100" cy="220" r="45" fill="#D3E5DE" className="map-park" />
        <text x="100" y="225" className="map-label" textAnchor="middle">Shastri Nagar</text>

        {/* Water Reservoirs */}
        <path d="M500 50 Q540 80 520 120 T460 160 T420 110 Z" fill="#D0E3E8" className="map-water" />
        <text x="480" y="110" className="map-label water-label" textAnchor="middle">Kalyana Reservoir</text>

        {/* Roads Grid */}
        <g className="map-roads">
          {/* Main Highway - NH 15 (Barmer Bypass) */}
          <path d="M -50 450 L 650 350" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <path d="M -50 450 L 650 350" stroke="#D1DDDC" strokeWidth="10" strokeLinecap="round" strokeDasharray="6,6" />
          <text x="180" y="430" className="map-road-name" transform="rotate(-9, 180, 430)">NH-68 Bypass</text>

          {/* Station Road */}
          <path d="M 120 -50 L 120 220 L 260 280 L 380 410" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" fill="none" />
          <text x="105" y="60" className="map-road-name" transform="rotate(90, 105, 60)">Station Road</text>

          {/* Indra Colony Marg */}
          <path d="M 120 160 L 420 160 L 520 280" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
          <text x="240" y="150" className="map-road-name">Indra Colony Rd</text>

          {/* Gandhi Nagar Marg */}
          <path d="M 280 200 L 520 200 M 420 160 L 420 480" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
          <text x="432" y="270" className="map-road-name" transform="rotate(90, 432, 270)">Gandhi Nagar Rd</text>

          {/* Sadar Bazar Lane */}
          <path d="M 50 280 L 450 280" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
          <text x="150" y="274" className="map-road-name">Sadar Bazar Rd</text>

          {/* Ratanada Connector */}
          <path d="M 120 380 L 380 410" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>

        {/* Building Blocks Outline (Decorative) */}
        <g fill="#DEE6E5" opacity="0.6" className="map-buildings">
          <rect x="50" y="80" width="30" height="20" rx="2" />
          <rect x="50" y="110" width="40" height="25" rx="2" />
          <rect x="140" y="40" width="30" height="40" rx="2" />
          <rect x="180" y="40" width="35" height="25" rx="2" />
          
          <rect x="180" y="180" width="40" height="30" rx="2" />
          <rect x="230" y="180" width="30" height="20" rx="2" />
          <rect x="180" y="220" width="60" height="20" rx="2" />

          <rect x="440" y="80" width="40" height="35" rx="2" />
          <rect x="440" y="125" width="25" height="20" rx="2" />

          <rect x="470" y="230" width="30" height="40" rx="2" />
          <rect x="510" y="230" width="40" height="30" rx="2" />

          <rect x="290" y="310" width="50" height="30" rx="2" />
          <rect x="350" y="310" width="40" height="25" rx="2" />
          <rect x="290" y="350" width="30" height="35" rx="2" />

          <rect x="50" y="320" width="40" height="30" rx="2" />
          <rect x="50" y="360" width="30" height="25" rx="2" />
        </g>

        {/* ACTIVE NAVIGATION ROUTE */}
        {destination && (stage === 'navigate' || stage === 'otp' || stage === 'working' || stage === 'bill') && (
          <path
            d={getRoutePath()}
            fill="none"
            stroke="url(#route-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8,8"
            className="map-route-line"
          />
        )}

        {/* Customer Location Pin */}
        {destination && (
          <g transform={`translate(${destination.x}, ${destination.y - 12})`} className="map-pin-group">
            {/* Glow effect */}
            <circle cx="0" cy="12" r="14" fill="#E5484D" opacity="0.25" className="map-customer-glow" />
            <circle cx="0" cy="12" r="6" fill="#E5484D" opacity="0.4" />
            {/* Pin Shape */}
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.5 12 28 12 28C12 28 22 17.5 22 12C22 6.48 17.52 2 12 2ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z"
              fill="#E5484D"
              transform="scale(0.8) translate(-15, -15)"
            />
            {/* Tooltip */}
            <g transform="translate(0, -22)" className="map-tooltip">
              <rect x="-45" y="-18" width="90" height="20" rx="4" fill="#101828" />
              <text x="0" y="-4" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle">
                {activeJob ? activeJob.customer : 'Job'}
              </text>
              <polygon points="0,2 -4,-2 4,-2" fill="#101828" />
            </g>
          </g>
        )}

        {/* Captain Location Marker */}
        <g transform={`translate(${captainPos.x}, ${captainPos.y})`} className="map-captain-group">
          {/* Pulse ring when online */}
          {online && (
            <>
              <circle cx="0" cy="0" r="30" fill="#0E3D3E" opacity="0.08" className="map-radar-pulse-1" />
              <circle cx="0" cy="0" r="18" fill="#0E3D3E" opacity="0.15" className="map-radar-pulse-2" />
            </>
          )}
          {/* Base shadow */}
          <circle cx="0" cy="3" r="10" fill="#000000" opacity="0.2" />

          {/* Captain Indicator Dot / Icon */}
          <circle cx="0" cy="0" r="9" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="7" fill={online ? '#0E3D3E' : '#98A2B3'} className="map-captain-core" />
          
          {/* Tiny Scooter Icon or Compass needle */}
          <path
            d="M-3 -3 L4 0 L-3 3 Z"
            fill="#FFFFFF"
            transform={destination ? `rotate(${Math.atan2(destination.y - captainPos.y, destination.x - captainPos.x) * (180 / Math.PI)}, 0, 0)` : ''}
          />
        </g>
      </svg>

      {/* Map Gradient definitions */}
      <svg width="0" height="0" className="svg-defs">
        <defs>
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E3D3E" />
            <stop offset="100%" stopColor="#2FA56C" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating GPS HUD when navigating */}
      {stage === 'navigate' && activeJob && (
        <div className="map-gps-hud animate-hud">
          <div className="gps-icon-arrow">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <div className="gps-directions">
            <strong>Head North on Station Road</strong>
            <small>Navigating to {activeJob.customer} · {activeJob.area}</small>
          </div>
        </div>
      )}
    </div>
  );
}
