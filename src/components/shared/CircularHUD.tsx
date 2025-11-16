interface CircularHUDProps {
  size?: number;
  color?: "primary" | "secondary";
  segments?: number;
  animated?: boolean;
}

export default function CircularHUD({
  size = 200,
  color = "primary",
  segments = 24,
  animated = true,
}: CircularHUDProps) {
  const radius = size / 2 - 4;
  const centerX = size / 2;
  const centerY = size / 2;

  const segmentAngle = 360 / segments;

  const createArc = (
    startAngle: number,
    endAngle: number,
    innerRadius: number,
    outerRadius: number,
  ) => {
    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const colorClass =
    color === "primary" ? "var(--primary)" : "var(--secondary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={animated ? "animate-spin" : ""}
      style={{ animationDuration: animated ? "20s" : undefined }}
    >
      {Array.from({ length: segments }).map((_, i) => {
        const startAngle = i * segmentAngle;
        const endAngle = startAngle + segmentAngle * 0.7;
        const shouldShow = i % 3 === 0;

        if (!shouldShow) return null;

        return (
          <path
            key={i}
            d={createArc(startAngle, endAngle, radius - 8, radius)}
            fill={colorClass}
            opacity={0.4}
          />
        );
      })}

      <circle
        cx={centerX}
        cy={centerY}
        r={radius - 15}
        fill="none"
        stroke={colorClass}
        strokeWidth="1"
        opacity="0.3"
      />

      <circle
        cx={centerX}
        cy={centerY}
        r={radius - 25}
        fill="none"
        stroke={colorClass}
        strokeWidth="2"
        opacity="0.5"
        strokeDasharray="4 4"
      />

      <circle
        cx={centerX}
        cy={centerY}
        r={radius - 35}
        fill="none"
        stroke={colorClass}
        strokeWidth="1"
        opacity="0.2"
      />

      {[0, 90, 180, 270].map((angle) => {
        const angleRad = ((angle - 90) * Math.PI) / 180;
        const x1 = centerX + (radius - 40) * Math.cos(angleRad);
        const y1 = centerY + (radius - 40) * Math.sin(angleRad);
        const x2 = centerX + (radius - 10) * Math.cos(angleRad);
        const y2 = centerY + (radius - 10) * Math.sin(angleRad);

        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colorClass}
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}
    </svg>
  );
}
