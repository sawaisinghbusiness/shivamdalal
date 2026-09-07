import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import './BottomSheet.css';

/**
 * BottomSheet — 60fps Ola/Uber-Style Draggable Bottom Sheet with Snap Points
 * 
 * Configurable Snap Points:
 * Default: [0.05, 0.54] -> EXPANDED (sheet top @ 5% vh), COLLAPSED (sheet top @ 54% vh)
 * To add a 3rd snap point (e.g. Mid 30%): pass snapPoints={[0.05, 0.30, 0.54]}
 */
export const DEFAULT_SHEET_SNAPS = [0.05, 0.54];

const BottomSheet = forwardRef(function BottomSheet(
  {
    snapPoints = DEFAULT_SHEET_SNAPS,
    defaultSnapIndex = 1, // Start at COLLAPSED
    onSnapChange,
    onProgress,
    children,
    header,
    footer,
    className = '',
  },
  ref
) {
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const handleRef = useRef(null);

  // Active snap index state for external UI / accessibility
  const [activeSnapIndex, setActiveSnapIndex] = useState(defaultSnapIndex);

  // Mutable refs for 60fps physics without React re-render thrash
  const currentY = useRef(0);
  const currentSnapIdx = useRef(defaultSnapIndex);
  const isDragging = useRef(false);
  const startPointerY = useRef(0);
  const startSheetY = useRef(0);
  const moveHistory = useRef([]);
  const rafId = useRef(null);

  // Compute absolute pixel values for snap points
  const getSnapPixels = () => {
    const vh = window.innerHeight;
    return snapPoints.map((p) =>
      typeof p === 'function' ? p(vh) : p <= 1 ? p * vh : p
    );
  };

  // Imperative snapTo method
  const snapTo = (index, animate = true) => {
    const snaps = getSnapPixels();
    const targetIdx = Math.max(0, Math.min(snaps.length - 1, index));
    const targetY = snaps[targetIdx];
    currentSnapIdx.current = targetIdx;
    currentY.current = targetY;

    const sheet = sheetRef.current;
    if (!sheet) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (animate && !prefersReducedMotion) {
      sheet.classList.add('anim');
    } else {
      sheet.classList.remove('anim');
    }

    sheet.style.setProperty('--sheet-y', String(targetY) + 'px');

    const minSnap = snaps[0];
    const maxSnap = snaps[snaps.length - 1];
    const progress = Math.max(0, Math.min(1, (maxSnap - targetY) / (maxSnap - minSnap)));
    sheet.style.setProperty('--sheet-progress', String(progress));

    const isExpanded = targetIdx === 0;
    sheet.classList.toggle('is-expanded', isExpanded);
    setActiveSnapIndex(targetIdx);

    if (onSnapChange) {
      onSnapChange(targetIdx, isExpanded ? 'expanded' : 'collapsed');
    }
    if (onProgress) {
      onProgress(progress);
    }
  };

  useImperativeHandle(ref, () => ({
    snapTo,
    expand: () => snapTo(0),
    collapse: () => snapTo(snapPoints.length - 1),
    getSnapIndex: () => currentSnapIdx.current,
  }));

  // Initial layout & Resize listener
  useEffect(() => {
    snapTo(defaultSnapIndex, false);

    const handleResize = () => {
      // Re-apply current snap on viewport change (e.g. keyboard / rotation)
      snapTo(currentSnapIdx.current, false);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // ── Unified Pointer Drag Handling ──
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const isExpanded = currentSnapIdx.current === 0;
    const content = contentRef.current;
    const isHandle = handleRef.current && (handleRef.current === e.target || handleRef.current.contains(e.target));

    // When expanded, only drag if touching handle/header, OR if content scrollTop <= 0
    if (isExpanded && !isHandle) {
      if (content && content.scrollTop > 0) {
        return; // Allow native scroll inside list
      }
    }

    isDragging.current = true;
    startPointerY.current = e.clientY;
    startSheetY.current = currentY.current;
    moveHistory.current = [{ y: e.clientY, t: performance.now() }];

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.classList.remove('anim');
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;

    const now = performance.now();
    moveHistory.current.push({ y: e.clientY, t: now });
    if (moveHistory.current.length > 8) {
      moveHistory.current = moveHistory.current.filter((sample) => now - sample.t <= 100);
    }

    const dy = e.clientY - startPointerY.current;
    const snaps = getSnapPixels();
    const minSnap = snaps[0];
    const maxSnap = snaps[snaps.length - 1];

    let ny = startSheetY.current + dy;

    // Rubber-band resistance factor 0.25 beyond min/max snap
    if (ny < minSnap) {
      ny = minSnap - (minSnap - ny) * 0.25;
    } else if (ny > maxSnap) {
      ny = maxSnap + (ny - maxSnap) * 0.25;
    }

    // Direct rAF-throttled style writes
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        currentY.current = ny;
        const sheet = sheetRef.current;
        if (sheet) {
          sheet.style.setProperty('--sheet-y', String(ny) + 'px');
          const progress = Math.max(0, Math.min(1, (maxSnap - ny) / (maxSnap - minSnap)));
          sheet.style.setProperty('--sheet-progress', String(progress));
          if (onProgress) onProgress(progress);
        }
        rafId.current = null;
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    document.body.style.userSelect = '';

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    const snaps = getSnapPixels();

    // Compute fling velocity from recent move samples
    const now = performance.now();
    const recent = moveHistory.current.filter((s) => now - s.t <= 100);
    let velocity = 0;
    if (recent.length >= 2) {
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        velocity = (last.y - first.y) / dt; // px/ms (+ = down, - = up)
      }
    }

    let targetIdx = currentSnapIdx.current;

    // Fast flick threshold: |velocity| > 0.5 px/ms
    if (Math.abs(velocity) > 0.5) {
      if (velocity < -0.5) {
        targetIdx = Math.max(0, currentSnapIdx.current - 1); // Fling up
      } else {
        targetIdx = Math.min(snaps.length - 1, currentSnapIdx.current + 1); // Fling down
      }
    } else {
      // Settle at nearest snap point
      let minDistance = Infinity;
      snaps.forEach((s, idx) => {
        const dist = Math.abs(s - currentY.current);
        if (dist < minDistance) {
          minDistance = dist;
          targetIdx = idx;
        }
      });
    }

    snapTo(targetIdx, true);
  };

  return (
    <div
      ref={sheetRef}
      className={'ola-bottom-sheet ' + className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* 46x5px Grey Drag Handle Bar */}
      <div
        ref={handleRef}
        className="sheet-handle-bar"
        onClick={() => snapTo(activeSnapIndex === 0 ? snapPoints.length - 1 : 0)}
      >
        <div className="sheet-handle-pill" />
      </div>

      {/* Header Slot */}
      {header && <div className="sheet-header-slot">{header}</div>}

      {/* Scrollable Content (Scrolls natively ONLY when expanded) */}
      <div ref={contentRef} className="sheet-content-scroll">
        {children}
      </div>

      {/* Fixed Sticky Footer Slot */}
      {footer && <div className="sheet-footer-slot">{footer}</div>}
    </div>
  );
});

export default BottomSheet;
