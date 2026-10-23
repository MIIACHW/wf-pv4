import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic, getBeatPulse, seededRandom } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO } from "../data/typography";
import { BEAT, getLine } from "../data/script";
import { GATE_HITS } from "../data/script";
import { BeatStage } from "../kit/BeatStage";
import { CephalonCube } from "../kit/CephalonCube";
import { LyricHeadline } from "../kit/LyricHeadline";
import { OriginSystemMap } from "../kit/OriginSystemMap";

/**
 * ============================================================================
 *  src/beats/Beat7Simulation.tsx  —  00:13.00 ~ 00:15.00
 * ============================================================================
 *  "Set up our new world — And let's begin the SIMULATION"
 *  780：金门向两侧滑开，星图以 3D 透视旋转展开
 *  850（14.1s）：全屏边框亮起柔和青光，奥迪斯温柔地说话
 * ============================================================================
 */

export type Beat7Props = {
  frame: number;
  accent: string;
  soft: string;
};

const GATE_Y = [232, 366, 500, 634, 768, 902];

export const Beat7Simulation: React.FC<Beat7Props> = ({ frame, accent, soft }) => {
  const pulse = getBeatPulse(frame);
  const line = getLine(frame);

  const openT = easeOutCubic(clamp01((frame - BEAT.sevenStart) / 26));
  const mapT = easeOutCubic(clamp01((frame - 786) / 40));
  const glowT = clamp01((frame - BEAT.simulationHit) / 22);

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080C", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 62% 45%, ${rgba(
            PALETTE.ordis.core,
            0.1 + glowT * 0.08
          )} 0%, rgba(0,0,0,0) 68%)`,
        }}
      />

      <div style={{ position: "absolute", inset: "54px 56px" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <BeatStage
            frame={frame}
            accent={accent}
            soft={soft}
            label="CEPHALON // ORDIS"
            sub="SIMULATION · NOMINAL"
            dialogue={line}
            metrics={[
              { label: "NAV LOCK", value: 0.98 },
              { label: "ORBITER LINK", value: 1 },
              { label: "FRAGMENT INDEX", value: 0.32 },
              { label: "SIMULATION", value: 0.64 + pulse * 0.04 },
            ]}
          >
            <CephalonCube frame={frame} rageLevel={0.04} size={520} idPrefix="b7" />
          </BeatStage>

          {/* 右侧 */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: 26,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <LyricHeadline frame={frame} accent={accent} soft={soft} baseSize={50} />

            {/* 3D 透视星图 */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 10,
                perspective: 1600,
                opacity: mapT,
                transform: `rotateX(${(14 * (1 - mapT * 0.35)).toFixed(1)}deg) rotateZ(${(-2 + frame * 0.004).toFixed(
                  2
                )}deg) scale(${(0.9 + mapT * 0.1).toFixed(3)})`,
                transformStyle: "preserve-3d",
              }}
            >
              <OriginSystemMap
                frame={frame}
                boot={mapT}
                rageLevel={0}
                accent={accent}
                hologram
              />
            </div>

            <div
              style={{
                height: 28,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: 2,
                color: rgba(accent, 0.4),
              }}
            >
              <span>NAVIGATION: ORIGIN SYSTEM</span>
              <span style={{ color: rgba(accent, 0.7) }}>
                {frame >= BEAT.simulationHit ? "SIMULATION RUNNING" : "ORBITER ONLINE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 金门向两侧滑开 */}
      {GATE_HITS.map((hit, i) => {
        if (frame < BEAT.sevenStart) return null;
        const dir = i % 2 === 0 ? -1 : 1;
        const tx = dir * openT * 1980;
        return (
          <div
            key={hit}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: GATE_Y[i],
              height: 18,
              transform: `translateX(${tx.toFixed(1)}px)`,
              opacity: 1 - openT * 0.85,
              background: `linear-gradient(to bottom, ${rgba(PALETTE.orokin.soft, 0.9)}, ${
                PALETTE.orokin.core
              })`,
              boxShadow: `0 0 30px ${rgba(PALETTE.orokin.core, 0.7)}`,
              zIndex: 20,
            }}
          />
        );
      })}

      {/* 14.1s：柔和青光边框 */}
      {glowT > 0 && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `${2 + glowT * 3}px solid ${rgba(PALETTE.ordis.core, 0.55 * glowT)}`,
              boxShadow: `inset 0 0 ${60 + glowT * 80}px ${rgba(PALETTE.ordis.core, 0.22 * glowT)}`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0,0,0,0) 50%, ${rgba(
                PALETTE.ordis.core,
                0.12 * glowT
              )} 100%)`,
              pointerEvents: "none",
            }}
          />
          {/* 光尘 */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={`dust-${i}`}
              style={{
                position: "absolute",
                left: `${seededRandom(i * 3.1) * 100}%`,
                top: `${seededRandom(i * 5.7) * 100}%`,
                width: 2,
                height: 2,
                background: PALETTE.ordis.soft,
                opacity: glowT * (0.25 + seededRandom(i * 7.3) * 0.5),
                transform: `translateY(${-((frame * (0.4 + seededRandom(i * 2.2))) % 120)}px)`,
              }}
            />
          ))}
        </>
      )}
    </AbsoluteFill>
  );
};
