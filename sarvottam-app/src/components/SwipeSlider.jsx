import { useState, useEffect, useRef } from 'react';
import './SwipeSlider.css';

export default function SwipeSlider({ label = 'Swipe to confirm', activeColor = '#2FA56C', onConfirm }) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const containerRef = useRef(null);
  const handleRef = useRef(null);
  const startXRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e) {
      handleMove(e.clientX);
    }

    function handleTouchMove(e) {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    }

    function handleMouseUp() {
      handleEnd();
    }

    function handleTouchEnd() {
      handleEnd();
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragX]);

  const getMaxDrag = () => {
    if (!containerRef.current || !handleRef.current) return 0;
    return containerRef.current.clientWidth - handleRef.current.clientWidth - 8; // padding offset
  };

  const handleStart = (clientX) => {
    if (confirmed) return;
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX) => {
    const maxDrag = getMaxDrag();
    if (maxDrag <= 0) return;
    let newX = clientX - startXRef.current;
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    setDragX(newX);
  };

  const handleEnd = () => {
    setIsDragging(false);
    const maxDrag = getMaxDrag();
    if (maxDrag > 0 && dragX >= maxDrag * 0.88) {
      // Swiped far enough -> Confirmed
      setDragX(maxDrag);
      setConfirmed(true);
      if (onConfirm) {
        // Trigger callback after a tiny delay for visual completion
        setTimeout(() => {
          onConfirm();
          // Reset after action trigger
          setConfirmed(false);
          setDragX(0);
        }, 300);
      }
    } else {
      // Snap back
      setDragX(0);
    }
  };

  const pct = getMaxDrag() > 0 ? (dragX / getMaxDrag()) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`swipe-slider-container ${confirmed ? 'confirmed' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ '--active-color': activeColor }}
    >
      {/* Background track indicator */}
      <div className="swipe-slider-bg-track" style={{ width: `${pct}%` }} />

      {/* Label Text */}
      <div className="swipe-slider-text" style={{ opacity: Math.max(0.2, 1 - pct / 75) }}>
        {confirmed ? 'Processing...' : label}
      </div>

      {/* Sliding Handle */}
      <div
        ref={handleRef}
        className="swipe-slider-handle"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging || confirmed ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        <span className="swipe-slider-arrow">
          {confirmed ? (
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>
          )}
        </span>
      </div>
    </div>
  );
}
