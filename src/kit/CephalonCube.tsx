import React from "react";
import { clamp, clamp01, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, mixHex, rgba } from "../data/palette";

/**
 * ============================================================================
 *  src/kit/CephalonCube.tsx  —  中枢奥迪斯的几何八面体（可碎裂版）
 * ============================================================================
 *  真正的 3D 顶点投影：8 个三角面，绕 Y 轴慢转，带透视与深度排序。
 *
 *  assemble = 0 → 碎片散落在画外，逐个飞回
 *  assemble = 1 → 完整八面体
 *  rageLevel ↑ → 每个面沿自己的法线向外炸开 44~72px，并各自翻滚
 *  recall   ↑ → 被外部（巴拉斯的金色锁链）强行拉回原位
 * ============================================================================
 */

type Vec3 = [number, number, number];
type Vec2 = { x: number; y: number; z: number };

/** 八面体 6 个顶点：上下两个极点 + 赤道四点 */
const OCTA_VERTICES: Vec3[] = [
  [0, 1.35, 0],
  [1, 0, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, 0, -1],
  [0, -1.35, 0],
];

/** 8 个三角面 = 8 块碎片 */
const OCTA_FACES: [number, number, number][] = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 4],
  [0, 4, 1],
  [5, 1, 2],
  [5, 2, 3],
  [5, 3, 4],
  [5, 4, 1],
];

const VIEW = 600;
const CENTER = VIEW / 2;
const BASE_SCALE = 112;

const rotate3d = (v: Vec3, yaw: number, pitch: number): Vec3 => {
  const [x, y, z] = v;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y1 = y * cp - z1 * sp;
  const z2 = y * sp + z1 * cp;
  return [x1, y1, z2];
};

const project = (v: Vec3, scale: number): Vec2 => {
  const perspective = 1 / (1 - v[2] * 0.18);
  return {
    x: CENTER + v[0] * scale * perspective,
    y: CENTER + v[1] * scale * perspective,
    z: v[2],
  };
};

/** 生成星形 / 锯齿多边形，用于内部混沌核 */
const starPoints = (spikes: number, outer: number, inner: number, phase = 0): string => {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2 + phase;
    pts.push(`${(CENTER + Math.cos(a) * r).toFixed(1)},${(CENTER + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
};

export type CephalonCubeProps = {
  frame: number;
  /** 0 = 温和的奥迪斯，1 = 骨骸野兽 */
  rageLevel: number;
  /** 0 = 散落碎片，1 = 聚合完成（开机动画） */
  assemble?: number;
  /** 0 = 炸开，1 = 完全归位；可以 > 1（spring 回弹过冲） */
  recall?: number;
  size?: number;
  idPrefix?: string;
};

export const CephalonCube: React.FC<CephalonCubeProps> = ({
  frame,
  rageLevel,
  assemble = 1,
  recall = 0,
  size = 520,
  idPrefix = "ceph",
}) => {
  const assembleT = clamp01(assemble);
  const scatter = 1 - assembleT;

  const rage = clamp01(rageLevel);
  const pulse = getBeatPulse(frame);
  const heat = clamp01(rage * (0.45 + 0.55 * pulse));

  const accent = mixHex(PALETTE.ordis.core, PALETTE.karris.core, heat);
  const accentSoft = mixHex(PALETTE.ordis.soft, PALETTE.karris.soft, heat);

  const breathe = 0.5 + 0.5 * Math.sin((frame / 60) * 1.2);

  const yaw = 0.45 + frame * 0.0052;
  const pitch =
    0.36 + Math.sin(frame * 0.0041) * 0.09 + rage * 0.16 * Math.sin(frame * 0.37);

  // 碎裂强度：rageLevel 超过 0.32 才开始脱壳，到 0.82 完全炸开
  const shatter = clamp01((rage - 0.32) / 0.5);
  const recallT = clamp(recall, -0.4, 1.4);

  // 炸裂距离：44 ~ 72px（鼓点时更远），被锁链拉住后回弹
  const explodeBase = shatter * (44 + 28 * pulse);
  const explode = explodeBase * (1 - recallT);

  const jitterAmp = shatter * (2 + 7 * pulse);
  const scaleBase = BASE_SCALE * (1 + breathe * 0.022 + pulse * 0.04 + shatter * 0.04 * pulse);

  const rotated = OCTA_VERTICES.map((v) => rotate3d(v, yaw, pitch));
  const projected = rotated.map((v) => project(v, scaleBase));

  const faces = OCTA_FACES.map((indices, index) => {
    const [a, b, c] = indices.map((i) => projected[i]);
    const cx = (a.x + b.x + c.x) / 3;
    const cy = (a.y + b.y + c.y) / 3;
    const depth = (a.z + b.z + c.z) / 3;
    const depthT = (depth + 1.35) / 2.7;

    const dxRaw = cx - CENTER;
    const dyRaw = cy - CENTER;
    const len = Math.hypot(dxRaw, dyRaw) || 1;

    // 每块碎片自己的随机系数，避免 8 块同步飞（那样像整体缩放而不像爆炸）
    const variance = 0.78 + seededRandom(index * 7.7 + 3.1) * 0.44;
    const scatterDist = scatter * (210 + seededRandom(index * 11.3 + 2.2) * 230);
    const depthFactor = 0.6 + depthT * 0.55;

    const dist = explode * variance * depthFactor + scatterDist;

    const jx = seededSign(frame * 1.31 + index * 7.7) * jitterAmp;
    const jy = seededSign(frame * 2.17 + index * 3.3) * jitterAmp;

    // 碎片翻滚：炸开后各自旋转
    const tumble = shatter * seededSign(index * 5.1 + frame * 0.02) * (18 + 36 * pulse);
    const bootTumble = scatter * seededSign(index * 3.7) * 150;

    return {
      index,
      depth,
      depthT,
      cx,
      cy,
      points: `${a.x.toFixed(2)},${a.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(
        2
      )} ${c.x.toFixed(2)},${c.y.toFixed(2)}`,
      dx: (dxRaw / len) * dist + jx,
      dy: (dyRaw / len) * dist + jy,
      rot: tumble + bootTumble,
    };
  });

  faces.sort((f1, f2) => f1.depth - f2.depth);

  const gradId = `${idPrefix}-face`;
  const glowId = `${idPrefix}-glow`;
  const coreId = `${idPrefix}-core`;
  const chaosId = `${idPrefix}-chaos`;

  const orbitRadius = 226 + Math.sin(frame * 0.021) * 5;
  const orbitDots = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2 - frame * 0.012;
    return {
      x: CENTER + Math.cos(angle) * orbitRadius,
      y: CENTER + Math.sin(angle) * orbitRadius * 0.42,
      depth: Math.sin(angle),
    };
  });

  const glowStd = 2.4 + breathe * 1.6 + heat * 7 + pulse * rage * 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.85} />
          <stop offset="55%" stopColor={accent} stopOpacity={0.28} />
          <stop offset="100%" stopColor={accent} stopOpacity={0.05} />
        </linearGradient>

        <radialGradient id={coreId}>
          <stop offset="0%" stopColor={accentSoft} stopOpacity={0.95} />
          <stop offset="45%" stopColor={accent} stopOpacity={0.4} />
          <stop offset="100%" stopColor={accent} stopOpacity={0} />
        </radialGradient>

        <radialGradient id={chaosId}>
          <stop offset="0%" stopColor="#FFF6D0" stopOpacity={0.95} />
          <stop offset="30%" stopColor={PALETTE.orokin.core} stopOpacity={0.85} />
          <stop offset="65%" stopColor={PALETTE.karris.core} stopOpacity={0.5} />
          <stop offset="100%" stopColor={PALETTE.karris.core} stopOpacity={0} />
        </radialGradient>

        <filter
          id={glowId}
          x="-70%"
          y="-70%"
          width="240%"
          height="240%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={glowStd} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ---- 背景光晕 ---- */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={190 + breathe * 22 + rage * 34}
        fill={`url(#${coreId})`}
        opacity={(0.32 + breathe * 0.12) * assembleT}
      />

      {/* ---- 雷达网格 ---- */}
      <g opacity={0.55 * assembleT}>
        <line
          x1={CENTER}
          y1={16}
          x2={CENTER}
          y2={VIEW - 16}
          stroke={rgba(accent, 0.08)}
          strokeDasharray="1 7"
        />
        <line
          x1={16}
          y1={CENTER}
          x2={VIEW - 16}
          y2={CENTER}
          stroke={rgba(accent, 0.08)}
          strokeDasharray="1 7"
        />
        {[120, 168, 262].map((r, i) => (
          <circle
            key={`grid-${r}`}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke={rgba(accent, 0.055 + i * 0.012)}
            strokeDasharray={i === 2 ? "3 9" : "1 5"}
          />
        ))}
        {Array.from({ length: 28 }).map((_, i) => {
          const t = i / 28;
          const len = i % 7 === 0 ? 7 : 3;
          return (
            <g key={`tick-${i}`}>
              <line
                x1={CENTER - 272 + t * 544}
                y1={CENTER - 272}
                x2={CENTER - 272 + t * 544}
                y2={CENTER - 272 + len}
                stroke={rgba(accent, 0.18)}
              />
              <line
                x1={CENTER - 272 + t * 544}
                y1={CENTER + 272}
                x2={CENTER - 272 + t * 544}
                y2={CENTER + 272 - len}
                stroke={rgba(accent, 0.18)}
              />
            </g>
          );
        })}
      </g>

      {/* ---- 外圈 HUD ---- */}
      <g opacity={0.75 * assembleT}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={orbitRadius}
          fill="none"
          stroke={rgba(accent, 0.3)}
          strokeWidth={1}
          strokeDasharray="1 9"
          transform={`rotate(${frame * 0.35} ${CENTER} ${CENTER})`}
        />
        <ellipse
          cx={CENTER}
          cy={CENTER}
          rx={orbitRadius * 1.02}
          ry={orbitRadius * 0.42}
          fill="none"
          stroke={rgba(accent, 0.24)}
          strokeWidth={1}
          strokeDasharray="26 12 4 12"
          transform={`rotate(${-14 + frame * 0.08} ${CENTER} ${CENTER})`}
        />
        <ellipse
          cx={CENTER}
          cy={CENTER}
          rx={orbitRadius * 0.92}
          ry={orbitRadius * 0.3}
          fill="none"
          stroke={rgba(accent, 0.18)}
          strokeWidth={1}
          transform={`rotate(${18 - frame * 0.05} ${CENTER} ${CENTER})`}
        />
      </g>

      {/* ---- 环上的节点 ---- */}
      {orbitDots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.depth > 0 ? 3.4 : 1.8}
          fill={dot.depth > 0 ? accent : rgba(accent, 0.4)}
          opacity={assembleT}
        />
      ))}

      {/* ================= 内部混沌核心（碎裂后暴露，被拉回时重新封住） ================= */}
      <g opacity={shatter * (1 - clamp01(recallT))}>
        <circle
          cx={CENTER}
          cy={CENTER}
          r={78 + pulse * 26}
          fill={`url(#${chaosId})`}
          opacity={0.75 + pulse * 0.25}
        />
        {/* 耀金尖刺星 */}
        <polygon
          points={starPoints(9, 104 + pulse * 18, 34)}
          fill="none"
          stroke={PALETTE.orokin.core}
          strokeOpacity={0.55}
          strokeWidth={1.4}
          transform={`rotate(${frame * 2.6} ${CENTER} ${CENTER})`}
        />
        {/* 血红反向星 */}
        <polygon
          points={starPoints(12, 66, 20)}
          fill={rgba(PALETTE.karris.core, 0.16)}
          stroke={PALETTE.karris.core}
          strokeOpacity={0.85}
          strokeWidth={1.2}
          transform={`rotate(${-frame * 4.4} ${CENTER} ${CENTER})`}
        />
        {/* 疯狂自转的三角碎片 */}
        {Array.from({ length: 9 }).map((_, i) => {
          const angle = frame * (2.2 + (i % 3) * 0.9) + i * 1.7;
          const r = 26 + seededRandom(i * 4.3) * 62;
          const px = CENTER + Math.cos(angle) * r;
          const py = CENTER + Math.sin(angle) * r;
          const s = 6 + seededRandom(i * 9.1 + 3) * 12;
          return (
            <polygon
              key={`chaos-tri-${i}`}
              points={`0,${-s} ${s * 0.86},${s * 0.6} ${-s * 0.86},${s * 0.6}`}
              fill={i % 2 === 0 ? PALETTE.orokin.core : PALETTE.karris.core}
              fillOpacity={0.45 + pulse * 0.3}
              transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(
                angle * 57.3
              ).toFixed(1)})`}
            />
          );
        })}
        {/* 血丝 / 金色电弧 */}
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + frame * 0.06;
          const r1 = 18;
          const r2 = 120 + seededRandom(i * 3.3 + Math.floor(frame / 3)) * 40;
          return (
            <line
              key={`arc-${i}`}
              x1={CENTER + Math.cos(a) * r1}
              y1={CENTER + Math.sin(a) * r1}
              x2={CENTER + Math.cos(a) * r2}
              y2={CENTER + Math.sin(a) * r2}
              stroke={i % 3 === 0 ? PALETTE.orokin.core : PALETTE.karris.core}
              strokeOpacity={0.25 + pulse * 0.4}
              strokeWidth={1 + pulse}
            />
          );
        })}
      </g>

      {/* ================= 八面体本体（8 块碎片） ================= */}
      <g filter={`url(#${glowId})`} opacity={0.15 + assembleT * 0.85}>
        {faces.map((face) => {
          const fillOpacity = 0.06 + face.depthT * 0.22 + heat * 0.14 + shatter * 0.22;
          const strokeOpacity = 0.22 + face.depthT * 0.7;
          const crackOpacity = clamp01((rage - 0.2) * 1.4) * face.depthT * 0.55;

          return (
            <g
              key={face.index}
              transform={`translate(${face.dx.toFixed(2)}, ${face.dy.toFixed(
                2
              )}) rotate(${face.rot.toFixed(2)} ${face.cx.toFixed(1)} ${face.cy.toFixed(1)})`}
            >
              <polygon
                points={face.points}
                fill={`url(#${gradId})`}
                fillOpacity={fillOpacity}
                stroke={accent}
                strokeOpacity={strokeOpacity}
                strokeWidth={0.9 + rage * 1.4 + face.depthT * 0.4}
                strokeLinejoin="round"
              />
              {crackOpacity > 0.01 && (
                <polygon
                  points={face.points}
                  fill="none"
                  stroke={accentSoft}
                  strokeOpacity={crackOpacity}
                  strokeWidth={0.6}
                  strokeDasharray="3 5"
                />
              )}
            </g>
          );
        })}
      </g>

      {/* ---- 未碎裂时的内核小八面体 ---- */}
      <g opacity={(1 - shatter) * 0.9 * assembleT}>
        {(() => {
          const inner = OCTA_VERTICES.map((v) =>
            rotate3d([v[0] * 0.34, v[1] * 0.34, v[2] * 0.34], -yaw * 1.7, -pitch * 1.2)
          );
          const innerPts = inner.map((v) => project(v, scaleBase));
          return OCTA_FACES.map((indices, i) => {
            const pts = indices.map((idx) => innerPts[idx]);
            return (
              <polygon
                key={`inner-${i}`}
                points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
                fill={accent}
                fillOpacity={0.035 + heat * 0.1 + pulse * 0.05}
                stroke={accentSoft}
                strokeOpacity={0.35 + heat * 0.4}
                strokeWidth={0.7}
              />
            );
          });
        })()}
      </g>

      {/* ---- 中心核点 ---- */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={2.5 + pulse * 1.6 + heat * 3}
        fill={accentSoft}
        opacity={assembleT}
      />
    </svg>
  );
};
