import type { Hexagram } from "@/types";

interface HexagramSVGProps {
  hexagram: Hexagram;
  size?: number;
}

// SVG 渲染六爻卦象
export function HexagramSVG({ hexagram, size = 80 }: HexagramSVGProps) {
  const lines = hexagram.symbol.split("\n");
  const lineHeight = size / 6;
  const gap = 3;
  const strokeWidth = lineHeight * 0.55;
  const y0 = lineHeight * 0.3;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {lines.map((line, i) => {
        const y = y0 + i * lineHeight + lineHeight / 2;
        if (line === "—") {
          // 阳爻：实线
          return (
            <line
              key={i}
              x1={size * 0.1}
              y1={y}
              x2={size * 0.9}
              y2={y}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        } else {
          // 阴爻：两段线
          return (
            <g key={i}>
              <line
                x1={size * 0.1}
                y1={y}
                x2={size * 0.42}
                y2={y}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <line
                x1={size * 0.58}
                y1={y}
                x2={size * 0.9}
                y2={y}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            </g>
          );
        }
      })}
      {/* 动爻标记（中间爻） */}
      <g opacity={0} />
    </svg>
  );
}

interface HexagramCardProps {
  label: string;
  hexagram: Hexagram;
  isGood?: boolean;
}

export function HexagramCard({ label, hexagram, isGood }: HexagramCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={isGood ? "text-green-600" : "text-foreground"}>
        <HexagramSVG hexagram={hexagram} size={60} />
      </div>
      <span className="text-sm font-medium text-center leading-tight">
        {hexagram.name}
      </span>
    </div>
  );
}
