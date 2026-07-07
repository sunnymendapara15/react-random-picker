import React, { useEffect, useMemo, useState } from 'react';
import '../styles/SpinWheel.css';

const palette = ['#ff8a00', '#ff3d7f', '#3d5afe', '#00c6ff', '#4caf50', '#ffca28'];

const SpinWheel = ({ entries, spinTrigger, selectedIndex, onSpinEnd, isSpinning }) => {
  const [rotation, setRotation] = useState(0);

  const gradientBackground = useMemo(() => {
    if (!entries.length) {
      return '#3b4254';
    }
    const segmentAngle = 360 / entries.length;
    const colors = entries.map((_, index) => {
      const start = index * segmentAngle;
      const end = start + segmentAngle;
      const color = palette[index % palette.length];
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${colors.join(', ')})`;
  }, [entries]);

  useEffect(() => {
    if (!spinTrigger || entries.length === 0) {
      return undefined;
    }
    const segmentAngle = 360 / entries.length;
    const randomSpins = 4 + Math.floor(Math.random() * 3);
    const offset = Math.random() * (segmentAngle / 6);
    const target =
      randomSpins * 360 + (entries.length - selectedIndex - 0.5) * segmentAngle + offset;
    setRotation(target);
    const timer = setTimeout(() => {
      onSpinEnd?.();
    }, 2600);
    return () => clearTimeout(timer);
  }, [spinTrigger, entries.length, selectedIndex, onSpinEnd]);

  const wheelStyle = {
    background: gradientBackground,
    transform: `rotate(${rotation}deg)`
  };

  return (
    <div className="wheel-viewport" aria-live="polite">
      <div className="wheel" style={wheelStyle}>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <span
              key={`${entry}-${index}`}
              className="segment-label"
              style={{
                transform: `rotate(${index * (360 / entries.length)}deg) translateY(-50%)`
              }}
            >
              {entry}
            </span>
          ))
        ) : (
          <p className="wheel-placeholder">Add entries to load the wheel.</p>
        )}
      </div>
      <div className={`wheel-pointer ${isSpinning ? 'spinning' : ''}`}>▼</div>
    </div>
  );
};

export default SpinWheel;
