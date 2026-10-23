import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic, getBeatPulse, lerp, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";

/**
 * ============================================================================
 *  src/beats/Beat1Power.tsx  —  00:00.00 ~ 00:01.75
 * ============================================================================
 *  "Switch on the power line"
 *  0~30 帧：黑场里一道耀金高压电流从左到右劈开屏幕，正中炸出巨型字
 *  30~105 帧：电流分叉灌进左右边框，电压从 0V 飙到 100,000V
 * ============================================================================
 */

export type Beat1Props = {
  frame: number;
  accent: string;
  soft: string;
};

const GOLD = PALETTE.orokin.core;

export const Beat1Power: React.FC<Beat1Props> = ({ frame }) => {
  const pulse = getBeatPulse(frame);

  // 电流横扫
  const sweep = easeOutCubic(clamp01((frame - 2) / 26));
  const beamX = lerp(-160, 2080, sweep);

  // 文字在 12 帧炸出来
  const textIn = easeOutCubic(clamp01((frame - 10) / 14));
  // 30 帧之后文字让位给电压表
  const lift = easeOutCubic(clamp01((frame - 30) / 22));
  const textTop = lerp(438, 112, lift);
  const textSize = lerp(64, 46, lift);

  // 电压
  const voltT = easeOutCubic(clamp01((frame - 30) / 70));
  const voltage = Math.round(voltT * 100000);
  const online = frame >= 86;

  const shake = frame < 46 ? (1 - clamp01((frame - 2) / 26)) * 9 : 0;
  const shakeX = seededSign(frame * 1.7) * shake;
  const shakeY = seededSign(frame * 2.3) * shake;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020304", overflow: "hidden" }}>
      {/* 背景网格（暗） */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${rgba(GOLD, 0.05)} 1px, transparent 1px), linear-gradient(to bottom, ${rgba(
            GOLD,
            0.05
          )} 1px, transparent 1px)`,
          backgroundSize: "120px 120px",
          opacity: 0.5 * sweep,
        }}
      />

      {/* 主电流：40 帧后淡出，避免横线切过电压数字 */}
      {frame >= 2 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 540,
            width: Math.max(0, beamX),
            height: 4,
            background: `linear-gradient(to right, ${rgba(GOLD, 0)} 0%, ${rgba(
              GOLD,
              0.9
            )} 70%, #FFF8D8 100%)`,
            boxShadow: `0 0 30px ${rgba(GOLD, 0.85)}, 0 0 90px ${rgba(GOLD, 0.5)}`,
            opacity: 1 - clamp01((frame - 38) / 22),
          }}
        />
      )}
      {frame >= 2 && frame < 40 && (
        <div
          style={{
            position: "absolute",
            left: beamX - 3,
            top: 400,
            width: 6,
            height: 280,
            background: "#FFF8D8",
            boxShadow: `0 0 40px ${GOLD}, 0 0 120px ${rgba(GOLD, 0.8)}`,
            opacity: 1 - clamp01((frame - 26) / 12),
          }}
        />
      )}

      {/* 分叉电弧 */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, opacity: clamp01((frame - 30) / 12) }}
      >
        {[
          "M 960 540 C 700 540, 420 330, 40 300",
          "M 960 540 C 700 540, 420 760, 40 790",
          "M 960 540 C 1220 540, 1500 330, 1880 300",
          "M 960 540 C 1220 540, 1500 760, 1880 790",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={GOLD}
            strokeWidth={2}
            strokeOpacity={0.5 + pulse * 0.4}
            strokeDasharray="14 22"
            strokeDashoffset={-frame * (2 + i)}
            filter="url(#none)"
          />
        ))}
        {/* 沿电弧跳动的火花 */}
        {Array.from({ length: 22 }).map((_, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const t = ((frame * 0.02 + i * 0.05) % 1);
          const x = 960 + side * t * 900;
          const y = 540 + (seededRandom(i * 3.7) - 0.5) * 420 * t;
          return (
            <circle
              key={`spark-${i}`}
              cx={x}
              cy={y}
              r={2 + seededRandom(i * 1.3) * 3}
              fill="#FFF8D8"
              opacity={0.5 * (1 - t)}
            />
          );
        })}
      </svg>

      {/* 左右边框充能 */}
      {[0, 1].map((side) => {
        const x = side === 0 ? 0 : 1918;
        const h = 1080 * easeOutCubic(clamp01((frame - 34) / 60));
        return (
          <div
            key={side}
            style={{
              position: "absolute",
              top: (1080 - h) / 2,
              left: x,
              width: 4,
              height: h,
              background: GOLD,
              boxShadow: `0 0 34px ${GOLD}`,
              opacity: 0.75,
            }}
          />
        );
      })}

      {/* 巨型歌词 */}
      {frame >= 10 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: textTop,
            textAlign: "center",
            fontFamily: SANS,
            fontSize: textSize,
            fontWeight: 900,
            letterSpacing: -1,
            color: "#FFF6DC",
            transform: `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px) scale(${
              (1 + Math.max(0, 1 - (frame - 10) / 16) * 0.22).toFixed(3)
            })`,
            textShadow: `0 0 ${28 + pulse * 30}px ${rgba(GOLD, 0.9)}, 0 0 90px ${rgba(GOLD, 0.45)}`,
            opacity: textIn,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: GOLD }}>&gt;&gt;</span> SWITCH ON THE POWER LINE
        </div>
      )}

      {/* 电压表 */}
      {frame >= 30 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 470,
            textAlign: "center",
            fontFamily: MONO,
            opacity: clamp01((frame - 30) / 10),
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#FFF6DC",
              textShadow: `0 0 ${34 + pulse * 26}px ${rgba(GOLD, 0.85)}`,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            {voltage.toLocaleString("en-US")}
            <span style={{ fontSize: 54, marginLeft: 12, color: GOLD }}>V</span>
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 15,
              letterSpacing: 6,
              color: online ? "#FFF6DC" : rgba(GOLD, 0.55),
              textShadow: online ? `0 0 22px ${GOLD}` : "none",
            }}
          >
            {online ? "100,000V // OROKIN_WEAVE_ONLINE" : "CHARGING OROKIN WEAVE"}
          </div>
        </div>
      )}

      {/* 角落读数 */}
      <div
        style={{
          position: "absolute",
          left: 46,
          bottom: 40,
          fontFamily: MONO,
          fontSize: 10,
          lineHeight: "19px",
          letterSpacing: 2,
          color: rgba(GOLD, 0.45),
        }}
      >
        <div>POLARITY +</div>
        <div>AMP {(voltT * 42).toFixed(1)} A</div>
        <div>GLASSING CIRCUIT</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 46,
          bottom: 40,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 10,
          lineHeight: "19px",
          letterSpacing: 2,
          color: rgba(GOLD, 0.45),
        }}
      >
        <div>EXECUTOR BALLAS</div>
        <div>ORDAN KARRIS // TERMINAL</div>
        <div style={{ color: online ? rgba(GOLD, 0.9) : rgba(GOLD, 0.3) }}>
          {online ? "WEAVE ONLINE" : "LINKING"}
        </div>
      </div>

      {/* 上下细轨 */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i === 0 ? 62 : 1012,
            height: 2,
            background: `linear-gradient(to right, ${rgba(GOLD, 0)} 0%, ${rgba(
              GOLD,
              0.5
            )} 50%, ${rgba(GOLD, 0)} 100%)`,
            opacity: sweep,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
