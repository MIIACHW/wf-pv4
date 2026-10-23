import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO } from "../data/typography";
import { BEAT } from "../data/script";
import { LyricHeadline } from "../kit/LyricHeadline";
import { CephalonCube } from "../kit/CephalonCube";

/**
 * ============================================================================
 *  src/beats/Beat2Protection.tsx  —  00:01.75 ~ 00:03.65
 * ============================================================================
 *  "Remember to put on — PROTECTION"
 *  105~165：血红色的 RAW_SOUL 尖刺核心拼命往外顶
 *  168（02.8s 重音）：反色闪白 2 帧 → 四块装甲板砸合 → 核心被压成冰蓝八面体
 *  + 巨大封印钢印 [ PRECEPT PROTECTION: LOCKED ]
 * ============================================================================
 */

export type Beat2Props = {
  frame: number;
  accent: string;
  soft: string;
};

const CX = 960;
const CY = 594;

const RawCore: React.FC<{ frame: number; intensity: number }> = ({ frame, intensity }) => {
  const pulse = getBeatPulse(frame);
  const spikes = 14;

  const points = Array.from({ length: spikes * 2 })
    .map((_, i) => {
      const isOuter = i % 2 === 0;
      const wobble = 0.72 + seededRandom(i * 3.7 + Math.floor(frame / 4) * 0.9) * 0.55;
      const r = (isOuter ? 230 : 96) * wobble * (1 + pulse * 0.06 + intensity * 0.1);
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      return `${(CX + Math.cos(a) * r).toFixed(1)},${(CY + Math.sin(a) * r * 0.94).toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id="raw-glow">
          <stop offset="0%" stopColor="#FFD9DE" stopOpacity={0.95} />
          <stop offset="35%" stopColor={PALETTE.karris.core} stopOpacity={0.55} />
          <stop offset="100%" stopColor={PALETTE.karris.core} stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r={330 + pulse * 40} fill="url(#raw-glow)" opacity={0.7} />

      <polygon
        points={points}
        fill={rgba(PALETTE.karris.core, 0.22)}
        stroke={PALETTE.karris.core}
        strokeWidth={2.2}
        strokeOpacity={0.95}
      />
      <polygon
        points={points}
        fill="none"
        stroke="#FFD9DE"
        strokeWidth={0.8}
        strokeOpacity={0.55}
        transform={`rotate(${frame * 0.6} ${CX} ${CY})`}
      />

      {/* 往外顶的触须 */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + Math.sin(frame * 0.02 + i) * 0.2;
        const r1 = 210;
        const r2 = 260 + seededRandom(i * 5.1 + Math.floor(frame / 3)) * 190 * intensity;
        return (
          <line
            key={i}
            x1={CX + Math.cos(a) * r1}
            y1={CY + Math.sin(a) * r1 * 0.95}
            x2={CX + Math.cos(a) * r2}
            y2={CY + Math.sin(a) * r2 * 0.95}
            stroke={PALETTE.karris.core}
            strokeWidth={1 + seededRandom(i * 2.3) * 2}
            strokeOpacity={0.55}
          />
        );
      })}

      {/* 内核心 */}
      <circle cx={CX} cy={CY} r={26 + pulse * 8} fill="#FFF0F2" opacity={0.9} />
    </svg>
  );
};

export const Beat2Protection: React.FC<Beat2Props> = ({ frame, accent, soft }) => {
  const pulse = getBeatPulse(frame);

  // 100~150 越顶越凶
  const struggling = clamp01((frame - 105) / 55);
  // 168 撞击后切换成八面体
  const locked = frame >= BEAT.protectionHit;
  const lockT = easeOutCubic(clamp01((frame - BEAT.protectionHit) / 26));

  const stampIn = clamp01((frame - 188) / 12);
  const stampShake = stampIn < 1 ? (1 - stampIn) * 6 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#080002", overflow: "hidden" }}>
      {/* 背景血色脉冲 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 55%, ${rgba(
            PALETTE.karris.core,
            0.22 + pulse * 0.1
          )} 0%, rgba(0,0,0,0) 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${rgba(
            PALETTE.karris.core,
            0.06
          )} 1px, transparent 1px), linear-gradient(to bottom, ${rgba(
            PALETTE.karris.core,
            0.06
          )} 1px, transparent 1px)`,
          backgroundSize: "110px 110px",
          opacity: 0.55 * (1 - lockT * 0.6),
        }}
      />

      {/* 核心 */}
      <div style={{ position: "absolute", inset: 0 }}>
        {!locked && <RawCore frame={frame} intensity={struggling} />}
        {locked && (
          <div
            style={{
              position: "absolute",
              left: CX,
              top: CY,
              transform: `translate(-50%, -50%) scale(${(0.55 + lockT * 0.45).toFixed(3)})`,
              opacity: lockT,
            }}
          >
            <CephalonCube frame={frame} rageLevel={0} size={600} idPrefix="lock" />
          </div>
        )}
      </div>

      {/* RAW_SOUL 标注 */}
      {!locked && (
        <div
          style={{
            position: "absolute",
            left: CX - 330,
            top: CY + 316,
            width: 660,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 13,
            letterSpacing: 3,
            color: PALETTE.karris.soft,
            opacity: 0.6 + 0.4 * Math.sin(frame * 0.5),
          }}
        >
          RAW_SOUL: ORDAN_KARRIS [LETHAL]
          <div style={{ marginTop: 6, fontSize: 10, color: rgba(PALETTE.karris.core, 0.6) }}>
            ESCAPE VECTOR {(struggling * 100).toFixed(0)}% · CONTAINMENT FAILING
          </div>
        </div>
      )}

      {/* 歌词 */}
      <div
        style={{
          position: "absolute",
          left: 380,
          right: 380,
          top: 186,
          display: "flex",
          justifyContent: "center",
          opacity: 1 - lockT * 0.25,
        }}
      >
        <LyricHeadline frame={frame} accent={accent} soft={soft} baseSize={56} align="center" />
      </div>

      {/* 封印钢印 */}
      {frame >= 186 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 858,
            display: "flex",
            justifyContent: "center",
            transform: `translate(${(seededSign(frame * 2.1) * stampShake).toFixed(2)}px, ${
              (seededSign(frame * 3.3) * stampShake).toFixed(2)
            }px) scale(${(1.18 - stampIn * 0.18).toFixed(3)})`,
            opacity: stampIn,
          }}
        >
          <div
            style={{
              border: `2px solid ${PALETTE.ordis.core}`,
              padding: "12px 30px",
              fontFamily: MONO,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 5,
              color: "#DFFBFF",
              background: rgba(PALETTE.ordis.core, 0.1),
              boxShadow: `0 0 40px ${rgba(PALETTE.ordis.core, 0.6)}, inset 0 0 30px ${rgba(
                PALETTE.ordis.core,
                0.25
              )}`,
              textShadow: `0 0 22px ${PALETTE.ordis.core}`,
            }}
          >
            [ PRECEPT PROTECTION: LOCKED ]
          </div>
        </div>
      )}

      {/* 锁定后的八面体读数 */}
      {locked && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 300,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 3,
            color: rgba(PALETTE.ordis.core, 0.55 * lockT),
          }}
        >
          CEPHALON SHELL · OCTAHEDRON · 8F
        </div>
      )}
    </AbsoluteFill>
  );
};
