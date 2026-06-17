import React from 'react';
import { motion } from 'framer-motion';

const statLabels = {
  POL: 'פוליטיקה',
  MED: 'מדיה',
  SEC: 'ביטחון',
  ECO: 'כלכלה',
  STR: 'רחוב',
  INT: 'בינלאומי',
  REL: 'נאמנות',
};

const statColors = (val) => {
  if (val >= 85) return '#4ade80';
  if (val >= 70) return '#facc15';
  if (val >= 55) return '#fb923c';
  return '#f87171';
};

const overallGrade = (overall) => {
  if (overall >= 80) return { label: 'זהב', color: '#ffd700' };
  if (overall >= 65) return { label: 'כסף', color: '#c0c0c0' };
  return { label: 'ארד', color: '#cd7f32' };
};

// Simple SVG Radar Chart
function RadarChart({ stats, color }) {
  const keys = Object.keys(stats);
  const n = keys.length;
  const cx = 80, cy = 80, r = 65;

  const points = keys.map((key, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const val = stats[key] / 100;
    return {
      x: cx + r * val * Math.cos(angle),
      y: cy + r * val * Math.sin(angle),
      lx: cx + (r + 16) * Math.cos(angle),
      ly: cy + (r + 16) * Math.sin(angle),
      label: key,
    };
  });

  const gridPoints = (fraction) =>
    keys.map((_, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return `${cx + r * fraction * Math.cos(angle)},${cy + r * fraction * Math.sin(angle)}`;
    }).join(' ');

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon
          key={f}
          points={gridPoints(f)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}
      {/* Spokes */}
      {keys.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill={color + '44'}
        stroke={color}
        strokeWidth="2"
      />
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="9"
          fontFamily="Heebo"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export default function FIFAStatsCard({ leader }) {
  if (!leader) return null;

  const grade = overallGrade(leader.overall);

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -20 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: 'linear-gradient(160deg, #1a1a2e 0%, #0a0a1a 100%)',
        border: `2px solid ${leader.color}55`,
        boxShadow: `0 0 30px ${leader.color}22`,
      }}
    >
      {/* Card header */}
      <div
        className="p-3 flex items-center justify-between"
        style={{ background: `linear-gradient(90deg, ${leader.color}33 0%, transparent 100%)`, borderBottom: `1px solid ${leader.color}33` }}
      >
        <div>
          <div className="text-xs font-bold" style={{ color: leader.color }}>{leader.party}</div>
          <div className="text-white font-black text-sm">{leader.name}</div>
        </div>
        <div className="text-3xl">{leader.emoji}</div>
      </div>

      {/* Overall score */}
      <div className="flex items-center justify-center gap-4 py-3 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black"
          style={{
            background: `radial-gradient(circle, ${grade.color}33 0%, transparent 70%)`,
            border: `3px solid ${grade.color}`,
            boxShadow: `0 0 20px ${grade.color}66`,
          }}
        >
          <span className="text-2xl leading-none" style={{ color: grade.color }}>{leader.overall}</span>
          <span className="text-xs" style={{ color: grade.color }}>{grade.label}</span>
        </motion.div>

        {/* Radar chart */}
        <div className="flex-1">
          <RadarChart stats={leader.stats} color={leader.color} />
        </div>
      </div>

      {/* Stats bars */}
      <div className="px-3 pb-3 space-y-1.5">
        {Object.entries(leader.stats).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6 text-left">{key}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="h-full rounded-full"
                style={{ background: statColors(val) }}
              />
            </div>
            <span className="text-xs font-bold w-5 text-right" style={{ color: statColors(val) }}>{val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
