import React from "react";
import { clamp01, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";

/**
 * ============================================================================
 *  src/kit/LotusSigil.tsx  —  Shot 4 中央特写
 * ============================================================================
 *  Lotus（莲）多层莲花几何线框图
 *    × Orokin 七人议会金色审判之环（七枚审判节点）
 *    × 两根被拔出的带血骨栓（Bone Plugs）
 *  全部是纯几何线框，没有位图、没有外包资源。
 * ============================================================================
 */

const C = 400;

/** 单片莲瓣：从 (0,0) 向上生长 */
const petal = (len: number, w: number): string =>
  `M 0 0 C ${w} ${-len * 0.22} ${w * 0.74} ${-len * 0.72} 0 ${-len} ` +
  `C ${-w * 0.74} ${-len * 0.72} ${-w} ${-len * 0.22} 0 0 Z`;

const PETALS: { angle: number; len: number; w: number; opacity: number }[] = [
  { angle: 0, len: 262, w: 86, opacity: 0.9 },
  { angle: -38, len: 236, w: 74, opacity: 0.8 },
  { angle: 38, len: 236, w: 74, opacity: 0.8 },
  { angle: -72, len: 198, w: 58, opacity: 0.62 },
  { angle: 72, len: 198, w: 58, opacity: 0.62 },
  { angle: -18, len: 166, w: 52, opacity: 0.5 },
  { angle: 18, len: 166, w: 52, opacity: 0.5 },
];

const BLADE =
  "M 0 -232 L 15 -158 L 4 -148 L 19 -78 L 6 -68 L 23 0 L 0 44 L -23 0 L -6 -68 L -19 -78 L -4 -148 L -15 -158 Z";

export type LotusSigilProps = {
  frame: number;
  /** 0 ~ 1 骨栓拔出进度 */
  progress: number;
  rageLevel: number;
  accent: string;
};

export const LotusSigil: React.FC<LotusSigilProps> = ({
  frame,
  progress,
  rageLevel,
  accent,
}) => {
  const p = clamp01(progress);
  const rage = clamp01(rageLevel);
  const pulse = getBeatPulse(frame);
  const shake = rage * (1.2 + 3.2 * pulse);
  const sx = seededSign(frame * 2.3) * shake;
  const sy = seededSign(frame * 3.1 + 4) * shake;

  // 骨栓：沿自身轴向被拽出
  const pull = p * 96;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="lotus-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF2EE" stopOpacity={0.96} />
          <stop offset="52%" stopColor="#E9C9BF" stopOpacity={0.82} />
          <stop offset="100%" stopColor={PALETTE.karris.core} stopOpacity={0.92} />
        </linearGradient>
        <radialGradient id="lotus-halo">
          <stop offset="0%" stopColor={PALETTE.orokin.core} stopOpacity={0.2} />
          <stop offset="45%" stopColor={PALETTE.karris.core} stopOpacity={0.08} />
          <stop offset="100%" stopColor={PALETTE.karris.core} stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r={380} fill="url(#lotus-halo)" />

      <g transform={`translate(${sx.toFixed(2)} ${sy.toFixed(2)})`}>
        {/* ================= Orokin 七人议会审判之环 ================= */}
        <g transform={`rotate(${frame * 0.28} ${C} ${C})`}>
          <circle
            cx={C}
            cy={C}
            r={330}
            fill="none"
            stroke={rgba(PALETTE.orokin.core, 0.5)}
            strokeWidth={1.4}
            strokeDasharray="52 10 6 10"
          />
          {Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            const x = C + Math.cos(a) * 330;
            const y = C + Math.sin(a) * 330;
            return (
              <g key={`seven-${i}`}>
                <rect
                  x={x - 7}
                  y={y - 7}
                  width={14}
                  height={14}
                  fill="none"
                  stroke={PALETTE.orokin.soft}
                  strokeWidth={1.4}
                  transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`}
                />
                <circle cx={x} cy={y} r={2.4} fill={PALETTE.orokin.soft} />
              </g>
            );
          })}
        </g>
        <g transform={`rotate(${-frame * 0.42} ${C} ${C})`}>
          <circle
            cx={C}
            cy={C}
            r={292}
            fill="none"
            stroke={rgba(PALETTE.orokin.core, 0.22)}
            strokeWidth={1}
            strokeDasharray="2 9"
          />
        </g>

        {/* ================= Lotus 莲花线框 ================= */}
        <g>
          {PETALS.map((petalSpec, i) => (
            <path
              key={`petal-${i}`}
              d={petal(petalSpec.len, petalSpec.w)}
              transform={`translate(${C} ${C + 30}) rotate(${petalSpec.angle})`}
              fill={rgba(accent, 0.04)}
              stroke={rgba(accent, 0.95 * petalSpec.opacity)}
              strokeWidth={1.5}
            />
          ))}
          {/* 花瓣中轴 */}
          {PETALS.map((petalSpec, i) => (
            <line
              key={`spine-${i}`}
              x1={C}
              y1={C + 30}
              x2={C + Math.sin((petalSpec.angle * Math.PI) / 180) * petalSpec.len * 0.94}
              y2={C + 30 - Math.cos((petalSpec.angle * Math.PI) / 180) * petalSpec.len * 0.94}
              stroke={rgba(accent, 0.16)}
              strokeDasharray="3 6"
            />
          ))}
          {/* 花心 */}
          <polygon
            points={`${C},${C - 44} ${C + 26},${C + 30} ${C},${C + 96} ${C - 26},${C + 30}`}
            fill={rgba(accent, 0.06)}
            stroke={rgba(PALETTE.orokin.core, 0.75)}
            strokeWidth={1.2}
          />
          <circle cx={C} cy={C + 26} r={5} fill={PALETTE.orokin.soft} opacity={0.9} />
        </g>

        {/* ================= 拔出口的血 ================= */}
        <ellipse
          cx={C}
          cy={C + 130}
          rx={86 + p * 40}
          ry={26 + p * 14}
          fill={rgba(PALETTE.karris.core, 0.18 + p * 0.14)}
        />

        {/* ================= 两根带血骨栓 ================= */}
        {[
          { rot: -34, dx: -34, dy: -8, mirror: 1 },
          { rot: 34, dx: 34, dy: -8, mirror: -1 },
        ].map((plug, i) => {
          const rad = (plug.rot * Math.PI) / 180;
          const ox = Math.sin(rad) * pull * -1;
          const oy = -Math.cos(rad) * pull;
          return (
            <g
              key={`plug-${i}`}
              transform={`translate(${(C + plug.dx + ox).toFixed(2)} ${(
                C +
                plug.dy +
                oy
              ).toFixed(2)})`}
            >
              <g
                transform={`rotate(${plug.rot}) scale(${plug.mirror * 0.78} 0.78)`}
                opacity={0.82}
              >
                <path d={BLADE} fill="url(#lotus-blade)" stroke="#FFE9E2" strokeOpacity={0.45} />
                <path
                  d={BLADE}
                  fill="none"
                  stroke={PALETTE.karris.core}
                  strokeOpacity={0.6}
                  strokeWidth={1.1}
                />
                <path
                  d="M 0 -60 L 9 -104 L -2 -150 L 8 -196"
                  fill="none"
                  stroke={rgba(PALETTE.karris.core, 0.8)}
                  strokeWidth={1.2}
                />
              </g>
            </g>
          );
        })}

        {/* ================= 血珠 ================= */}
        {Array.from({ length: 34 }).map((_, i) => {
          const seed = i * 6.13;
          const angle = seededRandom(seed) * Math.PI * 2;
          const dist = Math.pow(p, 1.2) * (40 + seededRandom(seed + 2) * 250);
          const x = C + Math.cos(angle) * dist;
          const y = C + 40 + Math.sin(angle) * dist * 0.8;
          const size = 2 + seededRandom(seed + 4) * 6;
          return (
            <polygon
              key={`drop-${i}`}
              points={`0,${-size} ${size * 0.8},${size * 0.6} ${-size * 0.8},${size * 0.6}`}
              fill={i % 5 === 0 ? "#FFE9E2" : PALETTE.karris.core}
              fillOpacity={0.9 * (1 - p * 0.45)}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(angle * 57.3).toFixed(
                1
              )})`}
            />
          );
        })}
      </g>
    </svg>
  );
};
