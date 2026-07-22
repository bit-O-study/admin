import type { CellSpec, Shape, FillStyle } from "@/features/iq/questions";

/** 도형 개수별 배치(중심 좌표, 반지름) — 100×100 좌표계 */
const LAYOUTS: Record<number, { cx: number; cy: number; r: number }[]> = {
  1: [{ cx: 50, cy: 50, r: 30 }],
  2: [
    { cx: 31, cy: 50, r: 17 },
    { cx: 69, cy: 50, r: 17 },
  ],
  3: [
    { cx: 50, cy: 31, r: 15 },
    { cx: 33, cy: 66, r: 15 },
    { cx: 67, cy: 66, r: 15 },
  ],
  4: [
    { cx: 33, cy: 33, r: 14 },
    { cx: 67, cy: 33, r: 14 },
    { cx: 33, cy: 67, r: 14 },
    { cx: 67, cy: 67, r: 14 },
  ],
};

function shapePath(shape: Shape, cx: number, cy: number, r: number): string {
  switch (shape) {
    case "square":
      return `M ${cx - r} ${cy - r} H ${cx + r} V ${cy + r} H ${cx - r} Z`;
    case "triangle":
      return `M ${cx} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
    case "diamond":
      return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
    case "hexagon": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (-90 + i * 60);
        return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }
    default:
      return "";
  }
}

interface OneShapeProps {
  shape: Shape;
  cx: number;
  cy: number;
  r: number;
  fill: FillStyle;
  color: string;
  id: string;
}

function OneShape({ shape, cx, cy, r, fill, color, id }: OneShapeProps) {
  const strokeW = 3;
  const clipId = `clip-${id}`;
  const patId = `pat-${id}`;

  const geom =
    shape === "circle"
      ? { el: "circle" as const }
      : { el: "path" as const, d: shapePath(shape, cx, cy, r) };

  const outline =
    geom.el === "circle" ? (
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW} />
    ) : (
      <path d={geom.d} fill="none" stroke={color} strokeWidth={strokeW} strokeLinejoin="round" />
    );

  const filled = (fillVal: string) =>
    geom.el === "circle" ? (
      <circle cx={cx} cy={cy} r={r} fill={fillVal} stroke="none" />
    ) : (
      <path d={geom.d} fill={fillVal} stroke="none" strokeLinejoin="round" />
    );

  if (fill === "solid") {
    return (
      <g>
        {filled(color)}
        {outline}
      </g>
    );
  }

  if (fill === "half") {
    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect x={cx - r} y={cy - r} width={r} height={r * 2} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>{filled(color)}</g>
        {outline}
      </g>
    );
  }

  if (fill === "dots") {
    return (
      <g>
        <defs>
          <pattern id={patId} width={7} height={7} patternUnits="userSpaceOnUse">
            <circle cx={2} cy={2} r={1.4} fill={color} />
          </pattern>
        </defs>
        {filled(`url(#${patId})`)}
        {outline}
      </g>
    );
  }

  return outline; // outline
}

interface MatrixFigureProps {
  spec: CellSpec;
  size?: number;
  idPrefix: string;
}

/** 한 칸(도형)을 그리는 SVG */
export function MatrixFigure({ spec, size = 96, idPrefix }: MatrixFigureProps) {
  const layout = LAYOUTS[Math.max(1, Math.min(4, spec.count))] ?? LAYOUTS[1];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="도형">
      <g transform={`rotate(${spec.rotation} 50 50)`}>
        {layout.map((pos, i) => (
          <OneShape
            key={i}
            shape={spec.shape}
            cx={pos.cx}
            cy={pos.cy}
            r={pos.r * (spec.size ?? 1)}
            fill={spec.fill}
            color={spec.color}
            id={`${idPrefix}-${i}`}
          />
        ))}
      </g>
    </svg>
  );
}