function riskColor(tier) {
  return { HIGH: '#F87171', MEDIUM: '#FBBF24', LOW: '#34D399' }[tier] || '#94A3B8';
}

// Semicircle gauge, 0-100, with a threshold marker.
export default function Gauge({ probPct, tier, thresholdPct }) {
  const color = riskColor(tier);
  const r = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = 180; // degrees, left
  const endAngle = 0; // degrees, right
  const angleFor = (pct) => startAngle - (pct / 100) * (startAngle - endAngle);

  const polarToCartesian = (angleDeg) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };

  const describeArc = (fromPct, toPct) => {
    const start = polarToCartesian(angleFor(fromPct));
    const end = polarToCartesian(angleFor(toPct));
    const largeArc = toPct - fromPct > 50 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const needleAngle = angleFor(probPct);
  const needleEnd = polarToCartesian(needleAngle);
  const thresholdPos = polarToCartesian(angleFor(thresholdPct));

  return (
    <div className="gauge-wrap">
      <div className="gauge-label">Denial Probability</div>
      <svg viewBox="0 0 200 115" width="100%" height="140">
        <path d={describeArc(0, 40)} stroke="rgba(16,185,129,0.15)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={describeArc(40, 70)} stroke="rgba(245,158,11,0.15)" strokeWidth="14" fill="none" />
        <path d={describeArc(70, 100)} stroke="rgba(239,68,68,0.15)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d={describeArc(0, probPct)} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
        <line x1={thresholdPos.x} y1={thresholdPos.y - 8} x2={thresholdPos.x} y2={thresholdPos.y + 8} stroke="#FFFFFF" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={color} strokeWidth="2" opacity="0.4" />
      </svg>
      <div className="gauge-value" style={{ color }}>{probPct.toFixed(1)}%</div>
    </div>
  );
}
