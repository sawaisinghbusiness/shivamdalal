import { useNavigate } from 'react-router-dom';
import svcHome from '../assets/svc-home.png';
import svcFurniture from '../assets/svc-furniture.png';
import svcPainting from '../assets/svc-painting.png';
import './AllServices.css';

export default function AllServices() {
  const nav = useNavigate();

  const handleDisabledClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="page all-services-page" id="all-services-panel">
      {/* Title Header */}
      <div className="as-header-container">
        <h1 className="as-page-title">All Services</h1>
      </div>

      {/* 3-Tile Grid */}
      <div className="as-grid-container">
        {/* 1. Home Services */}
        <button
          type="button"
          className="as-tile-btn as-tile-enabled"
          onClick={() => nav('/')}
          aria-label="Home Services"
        >
          <div className="as-tile-panel">
            <img src={svcHome} alt="Home Services" className="as-tile-img" />
          </div>
          <span className="as-tile-label">Home Services</span>
        </button>

        {/* 2. Furniture */}
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

        {/* 3. Painting (Coming Soon) */}
        <button
          type="button"
          className="as-tile-btn as-tile-disabled"
          disabled
          aria-disabled="true"
          onClickCapture={handleDisabledClick}
          aria-label="Painting - Coming Soon"
        >
          <div className="as-tile-panel">
            <span className="as-pill-coming-soon">Coming Soon</span>
            <img src={svcPainting} alt="Painting" className="as-tile-img" />
          </div>
          <span className="as-tile-label">Painting</span>
        </button>
      </div>

      <div className="bottom-spacer" />
    </div>
  );
}
