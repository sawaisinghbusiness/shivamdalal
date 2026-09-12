import { useNavigate } from 'react-router-dom';
import svcFurniture from '../assets/svc-furniture.png';
import svcPainting from '../assets/svc-painting.png';
import './AllServices.css';

export default function AllServices() {
  const nav = useNavigate();

  return (
    <div className="page all-services-page" id="all-services-panel">
      {/* Title Header */}
      <div className="as-header-container">
        <h1 className="as-page-title">All Services</h1>
      </div>

      {/* 2-Tile Grid */}
      <div className="as-grid-container">
        {/* 1. Furniture */}
        <button
          type="button"
          className="as-tile-btn as-tile-enabled"
          onClick={() => nav('/furniture')}
          aria-label="Furniture"
        >
          <div className="as-tile-panel">
            <img src={svcFurniture} alt="Furniture" className="as-tile-img" />
          </div>
          <span className="as-tile-label">Furniture</span>
        </button>

        {/* 2. Painting */}
        <button
          type="button"
          className="as-tile-btn as-tile-enabled"
          onClick={() => nav('/painting')}
          aria-label="Painting"
        >
          <div className="as-tile-panel">
            <img src={svcPainting} alt="Painting" className="as-tile-img" />
          </div>
          <span className="as-tile-label">Painting</span>
        </button>
      </div>

      <div className="bottom-spacer" />
    </div>
  );
}
