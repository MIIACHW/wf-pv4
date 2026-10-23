import React from "react";
import { clamp01, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO } from "../data/typography";
import { FACTION_COLOR, NAV_NODES } from "../data/warframe";

/**
 * ============================================================================
 *  src/kit/OriginSystemMap.tsx  —  始源星系导航星图（动态版）
 * ============================================================================
 *  全部动态：轨道环自转、连线脉冲、节点随鼓点呼吸、扫描扇区、导航光点、
 *  以及右侧一颗放大的全息星球（经纬线在转）。
 * ============================================================================
 */

const W = 1000;
const H = 760;

const segLen = (ax: number, ay: number, bx: number, by: number) => Math.hypot(bx - ax, by - ay);

const TOTAL_LEN = NAV_NODES.reduce((acc, node, i) => {
  if (i === 0) return 0;
  const prev = NAV_NODES[i - 1];
  return acc + segLen(prev.x, prev.y, node.x, node.y);
}, 0);

const pointAt = (progress: number): { x: number; y: number; angle: number } => {
  let dist = clamp01(progress) * TOTAL_LEN;
  for (let i = 1; i < NAV_NODES.length; i += 1) {
    const a = NAV_NODES[i - 1];
    const b = NAV_NODES[i];
    const len = segLen(a.x, a.y, b.x, b.y);
    if (dist <= len || i === NAV_NODES.length - 1) {
      const t = len === 0 ? 0 : clamp01(dist / len);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      };
    }
    dist -= len;
  }
  const last = NAV_NODES[NAV_NODES.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
};

export type OriginSystemMapProps = {
  frame: number;
  boot?: number;
  rageLevel: number;
  accent: string;
  /** 右侧放大的全息星球 */
  hologram?: boolean;
};

export const OriginSystemMap: React.FC<OriginSystemMapProps> = ({
  frame,
  boot = 1,
  rageLevel,
  accent,
  hologram = true,
}) => {
  const bootT = clamp01(boot);
  const rage = clamp01(rageLevel);
  const pulse = getBeatPulse(frame);
  const jitter = rage > 0.2 ? seededSign(frame * 2.1) * rage * 9 : 0;

  const progress = ((frame - 780) / 300) % 1;
  const ship = pointAt(progress < 0 ? 0 : progress);

  // 扫描扇区
  const sweepAngle = (frame * 1.4) % 360;
  const sweepRad = (sweepAngle * Math.PI) / 180;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="60 70 900 620"
      preserveAspectRatio="xMidYMid meet"
      style={{ transform: `translateX(${jitter.toFixed(2)}px)` }}
    >
      <defs>
        <radialGradient id="nav-nebula">
          <stop offset="0%" stopColor={PALETTE.orokin.core} stopOpacity={0.12} />
          <stop offset="60%" stopColor={accent} stopOpacity={0.05} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="nav-kuva">
          <stop offset="0%" stopColor={PALETTE.karris.core} stopOpacity={0.6} />
          <stop offset="100%" stopColor={PALETTE.karris.core} stopOpacity={0} />
        </radialGradient>
        <radialGradient id="holo-sph">
          <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
          <stop offset="70%" stopColor={accent} stopOpacity={0.08} />
          <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
        </radialGradient>
      </defs>

      <g opacity={bootT}>
        <ellipse cx={520} cy={380} rx={470} ry={340} fill="url(#nav-nebula)" />

        {/* 星尘 */}
        {Array.from({ length: 160 }).map((_, i) => {
          const x = seededRandom(i * 1.37 + 2) * W;
          const y = seededRandom(i * 2.71 + 5) * H;
          const r = seededRandom(i * 3.11) * 1.6;
          return (
            <circle
              key={`star-${i}`}
              cx={x.toFixed(1)}
              cy={y.toFixed(1)}
              r={r.toFixed(2)}
              fill="#CFE9F2"
              opacity={0.1 + seededRandom(i * 4.7) * 0.45}
            />
          );
        })}

        {/* 旋转轨道环 */}
        {[
          { rx: 180, ry: 92, speed: 0.5, a: 0.16 },
          { rx: 300, ry: 150, speed: -0.34, a: 0.13 },
          { rx: 410, ry: 210, speed: 0.26, a: 0.1 },
          { rx: 490, ry: 260, speed: -0.18, a: 0.07 },
        ].map((ring, i) => (
          <g key={`orbit-${i}`} transform={`rotate(${frame * ring.speed} 500 380)`}>
            <ellipse
              cx={500}
              cy={380}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke={rgba(accent, ring.a)}
              strokeWidth={1.2}
              strokeDasharray={i % 2 === 0 ? "2 10" : "18 8 3 8"}
            />
            <circle cx={500 + ring.rx} cy={380} r={2.4} fill={rgba(accent, 0.55)} />
          </g>
        ))}

        {/* 扫描扇区 */}
        <path
          d={`M 500 380 L ${500 + Math.cos(sweepRad) * 470} ${380 + Math.sin(sweepRad) * 260} A 470 260 0 0 1 ${
            500 + Math.cos(sweepRad + 0.35) * 470
          } ${380 + Math.sin(sweepRad + 0.35) * 260} Z`}
          fill={rgba(accent, 0.06)}
        />
        <line
          x1={500}
          y1={380}
          x2={500 + Math.cos(sweepRad) * 470}
          y2={380 + Math.sin(sweepRad) * 260}
          stroke={rgba(accent, 0.35)}
          strokeWidth={1.2}
        />

        {/* 脉冲连线 */}
        <polyline
          points={NAV_NODES.map((n) => `${n.x},${n.y}`).join(" ")}
          fill="none"
          stroke={rgba(accent, 0.4)}
          strokeWidth={2}
          strokeDasharray="8 10"
          strokeDashoffset={-frame * 1.4}
        />
        {/* 沿线的能量脉冲（半径由 frame 推导，不用 SMIL） */}
        {Array.from({ length: 3 }).map((_, k) => {
          const p = (((frame * 0.004 + k / 3) % 1) + 1) % 1;
          const pt = pointAt(p);
          const r = 3 + 4 * (0.5 + 0.5 * Math.sin(frame * 0.35 + k * 2.1));
          return <circle key={`pulse-${k}`} cx={pt.x} cy={pt.y} r={r} fill={accent} opacity={0.9} />;
        })}

        {/* 节点 */}
        {NAV_NODES.map((node, i) => {
          const color = FACTION_COLOR[node.faction];
          const isKuva = node.id === "kuva";
          const labelLeft = node.x > 780;
          const active = progress * NAV_NODES.length >= i;
          const breathe = 1 + pulse * (isKuva ? 0.5 : 0.25);
          const kuvaFlash = 0.5 + 0.5 * Math.sin(frame * 0.42);

          return (
            <g key={node.id}>
              {isKuva && (
                <>
                  <circle cx={node.x} cy={node.y} r={62} fill="url(#nav-kuva)" opacity={0.4 + kuvaFlash * 0.5} />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={30 + kuvaFlash * 10}
                    fill="none"
                    stroke={PALETTE.karris.core}
                    strokeWidth={1.4}
                    opacity={0.6 + kuvaFlash * 0.4}
                  />
                </>
              )}

              <circle
                cx={node.x}
                cy={node.y}
                r={16 * breathe}
                fill="none"
                stroke={rgba(color, active ? 0.95 : 0.5)}
                strokeWidth={isKuva ? 2.2 : 1.6}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={(isKuva ? 7 : 5) * breathe}
                fill={isKuva ? (kuvaFlash > 0.5 ? PALETTE.karris.core : "#FFD9DE") : color}
              />
              {/* 行星刻度环 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={26}
                fill="none"
                stroke={rgba(color, 0.28)}
                strokeDasharray="2 6"
                transform={`rotate(${frame * 0.6 + i * 20} ${node.x} ${node.y})`}
              />

              <text
                x={node.x}
                y={node.y - 34}
                textAnchor="middle"
                fontFamily={MONO}
                fontSize={9}
                fill={rgba(accent, 0.4)}
              >
                {String(i + 1).padStart(2, "0")}
              </text>

              <text
                x={node.x + (labelLeft ? -28 : 28)}
                y={node.y + 2}
                textAnchor={labelLeft ? "end" : "start"}
                fontFamily={MONO}
                fontSize={15}
                letterSpacing={1.4}
                fill={isKuva ? rgba(PALETTE.karris.soft, 0.98) : "#E6F7FC"}
              >
                {node.name}
              </text>
              <text
                x={node.x + (labelLeft ? -28 : 28)}
                y={node.y + 20}
                textAnchor={labelLeft ? "end" : "start"}
                fontFamily={MONO}
                fontSize={9.5}
                letterSpacing={1.4}
                fill={rgba(color, 0.9)}
              >
                {node.faction}
              </text>
              <text
                x={node.x + (labelLeft ? -28 : 28)}
                y={node.y + 35}
                textAnchor={labelLeft ? "end" : "start"}
                fontFamily={MONO}
                fontSize={9}
                letterSpacing={1.2}
                fill={rgba(accent, 0.35)}
              >
                {node.cn}
              </text>
            </g>
          );
        })}

        {/* 导航光点 */}
        <g transform={`translate(${ship.x.toFixed(1)} ${ship.y.toFixed(1)})`}>
          <circle r={18} fill={rgba(accent, 0.12)} />
          <circle r={8} fill="none" stroke={accent} strokeWidth={1.6} />
          <polygon
            points="10,0 -7,-6 -7,6"
            fill="#EAFBFF"
            transform={`rotate(${ship.angle.toFixed(1)})`}
          />
        </g>

        {/* 放大的全息星球 */}
        {hologram && (
          <g transform="translate(790 560)">
            <circle r={112} fill="url(#holo-sph)" stroke={rgba(accent, 0.5)} strokeWidth={1.2} />
            {[-70, -40, 0, 40, 70].map((lat) => {
              const ry = Math.sqrt(Math.max(0, 112 * 112 - lat * lat)) * 0.34;
              return (
                <ellipse
                  key={`lat-${lat}`}
                  cx={0}
                  cy={lat}
                  rx={Math.sqrt(Math.max(0, 112 * 112 - lat * lat))}
                  ry={ry}
                  fill="none"
                  stroke={rgba(accent, 0.28)}
                  strokeWidth={0.8}
                />
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => {
              const phase = (i / 8) * Math.PI * 2 + frame * 0.05;
              return (
                <ellipse
                  key={`mer-${i}`}
                  cx={0}
                  cy={0}
                  rx={Math.max(2, Math.abs(Math.cos(phase)) * 112)}
                  ry={112}
                  fill="none"
                  stroke={rgba(accent, 0.22)}
                  strokeWidth={0.8}
                />
              );
            })}
            <line
              x1={-112}
              x2={112}
              y1={(frame * 1.6) % 224 - 112}
              y2={(frame * 1.6) % 224 - 112}
              stroke={rgba(PALETTE.ordis.soft, 0.7)}
              strokeWidth={1.2}
            />
            <text
              x={0}
              y={136}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={10}
              letterSpacing={2}
              fill={rgba(accent, 0.6)}
            >
              HOLOGRAPHIC SCAN
            </text>
            <text
              x={0}
              y={152}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={9}
              letterSpacing={1.6}
              fill={rgba(accent, 0.32)}
            >
              ORIGIN SYSTEM · 10 NODES
            </text>
          </g>
        )}

      </g>
    </svg>
  );
};
