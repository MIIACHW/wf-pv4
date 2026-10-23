import React from "react";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { clamp01, getBeatPulse, seededRandom } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { FRAGMENT_DEAL } from "../data/script";
import { FRAGMENT_CARDS } from "../data/warframe";
import { BeatStage } from "../kit/BeatStage";
import { CephalonCube } from "../kit/CephalonCube";
import { LyricHeadline } from "../kit/LyricHeadline";

/**
 * ============================================================================
 *  src/beats/Beat3Pieces.tsx  —  00:03.65 ~ 00:05.50
 * ============================================================================
 *  "Lay down your pieces"
 *  8 块中枢记忆菱形碎片像发牌一样砸在右侧，每块内部有扫描线和记忆标签，
 *  缝隙里闪红光。左侧是刚被锁死的八面体。
 * ============================================================================
 */

export type Beat3Props = {
  frame: number;
  accent: string;
  soft: string;
};

const Card: React.FC<{
  index: number;
  frame: number;
  accent: string;
}> = ({ index, frame, accent }) => {
  const { fps } = useVideoConfig();
  const card = FRAGMENT_CARDS[index];
  const dealAt = FRAGMENT_DEAL[index] ?? 219 + index * 6;

  const pop = spring({
    frame: frame - dealAt,
    fps,
    config: { stiffness: 320, damping: 16, mass: 0.55 },
  });

  if (frame < dealAt) return null;

  const scale = 0.2 + pop * 0.8;
  const rot = 45 - (1 - Math.min(1, pop)) * 24;
  const flash = clamp01(1 - (frame - dealAt) / 10);
  const scan = (frame * 1.2 + index * 30) % 100;
  const redPulse = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.12 + index));

  return (
    <div
      style={{
        width: 268,
        height: 268,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 196,
          height: 196,
          transform: `rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
          border: `1.5px solid ${rgba(accent, 0.85)}`,
          background: `linear-gradient(135deg, ${rgba(accent, 0.16)} 0%, rgba(4,10,16,0.92) 60%)`,
          boxShadow: `0 0 ${18 + flash * 40}px ${rgba(accent, 0.55)}, inset 0 0 30px ${rgba(
            accent,
            0.12
          )}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotate(-45deg) scale(1.38)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 8,
              letterSpacing: 1.1,
              color: rgba(accent, 0.55),
            }}
          >
            {card.id}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: 0,
              color: "#DFFBFF",
              marginTop: 3,
              whiteSpace: "nowrap",
            }}
          >
            {card.label}
          </div>
          {/* 记忆缩略波形 */}
          <svg width="100%" height="26" viewBox="0 0 120 26" preserveAspectRatio="none" style={{ marginTop: 5 }}>
            <polyline
              points={Array.from({ length: 40 })
                .map((_, i) => {
                  const x = (i / 39) * 120;
                  const y = 13 - (seededRandom(i * 2.1 + index * 7) - 0.5) * 22;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ")}
              fill="none"
              stroke={rgba(accent, 0.7)}
              strokeWidth={0.9}
            />
          </svg>
        </div>

        {/* 扫描线 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scan}%`,
            height: 2,
            background: rgba(accent, 0.5),
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(to bottom, ${rgba(
              accent,
              0.09
            )} 0 1px, transparent 1px 4px)`,
          }}
        />
      </div>

      {/* 缝隙红光 */}
      <div
        style={{
          position: "absolute",
          width: 6,
          height: 6,
          borderRadius: 0,
          background: PALETTE.karris.core,
          boxShadow: `0 0 14px ${PALETTE.karris.core}`,
          opacity: redPulse * (1 - flash),
          transform: `translate(${(index % 2 === 0 ? 1 : -1) * 104}px, ${
            (index < 4 ? 1 : -1) * 104
          }px) rotate(45deg)`,
        }}
      />
    </div>
  );
};

export const Beat3Pieces: React.FC<Beat3Props> = ({ frame, accent, soft }) => {
  const pulse = getBeatPulse(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "#03070C", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 28% 45%, ${rgba(
            accent,
            0.09
          )} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      <div style={{ position: "absolute", inset: "54px 56px" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <BeatStage
            frame={frame}
            accent={accent}
            soft={soft}
            label="CEPHALON // ORDIS"
            sub="PRECEPT PROTECTION: LOCKED"
            metrics={[
              { label: "SHELL INTEGRITY", value: 0.98 },
              { label: "MEMORY INDEX", value: 0.62 + pulse * 0.04 },
              { label: "FRAGMENT QUEUE", value: 0.8 },
              { label: "KUVA TRACE", value: 0.18 + pulse * 0.08 },
            ]}
          >
            <CephalonCube frame={frame} rageLevel={0} size={560} idPrefix="b3" />
          </BeatStage>

          {/* 右侧 */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: 28,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <LyricHeadline frame={frame} accent={accent} soft={soft} baseSize={62} />

            {/* 发牌网格 */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: 6,
                placeItems: "center",
              }}
            >
              {FRAGMENT_CARDS.map((card, i) => (
                <Card key={card.id} index={i} frame={frame} accent={accent} />
              ))}
            </div>

            {/* 底部计数 */}
            <div
              style={{
                height: 34,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: `1px solid ${rgba(accent, 0.16)}`,
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                color: rgba(accent, 0.38),
              }}
            >
              <span>CEPHALON FRAGMENTS // 08 PIECES</span>
              <span style={{ color: rgba(accent, 0.7) }}>
                EXPOSED {Math.min(8, Math.max(0, Math.floor((frame - 219) / 6) + 1))}/8
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
