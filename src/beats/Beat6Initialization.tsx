import React from "react";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { clamp01, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { GATE_HITS } from "../data/script";
import { BeatStage } from "../kit/BeatStage";
import { CephalonCube } from "../kit/CephalonCube";

/**
 * ============================================================================
 *  src/beats/Beat6Initialization.tsx  —  00:11.00 ~ 00:13.00
 * ============================================================================
 *  "I-NI-TIA-LI-ZA-TION" 六个音节 = 六道金门
 *  每砸下一道，就把底下一层血色刷回冰蓝，并敲回一块八面体碎片。
 * ============================================================================
 */

export type Beat6Props = {
  frame: number;
  accent: string;
  soft: string;
};

const SYLLABLES = ["I", "NI", "TIA", "LI", "ZA", "TION"];
const GATE_Y = [232, 366, 500, 634, 768, 902];
const GATE_LEFT = 752;

export const Beat6Initialization: React.FC<Beat6Props> = ({ frame, accent, soft }) => {
  const { fps } = useVideoConfig();
  const pulse = getBeatPulse(frame);

  const landed = GATE_HITS.filter((h) => frame >= h).length;
  const recall = landed / GATE_HITS.length;

  // 已落下的最后一道门，决定青色回刷的边界
  const lastY = landed > 0 ? GATE_Y[landed - 1] : 0;
  const revealPct = clamp01(lastY / 1080) * 100;

  // 每次落门的冲击抖动
  const impact = GATE_HITS.reduce((acc, hit) => {
    const dt = frame - hit;
    if (dt < 0 || dt > 16) return acc;
    return acc + (1 - dt / 16);
  }, 0);
  const shakeX = seededSign(frame * 3.1) * impact * 7;
  const shakeY = seededSign(frame * 2.3) * impact * 7;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0003", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 60% at 25% 50%, ${rgba(
            PALETTE.karris.core,
            0.26
          )} 0%, rgba(0,0,0,0) 65%)`,
        }}
      />

      {/* 青色回刷层（把红色一层层洗掉） */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: PALETTE.ordis.core,
          mixBlendMode: "color",
          opacity: 0.82,
          clipPath: `inset(0 0 ${(100 - revealPct).toFixed(1)}% 0)`,
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${revealPct}%`,
          height: 2,
          background: PALETTE.ordis.soft,
          boxShadow: `0 0 30px ${PALETTE.ordis.core}`,
          opacity: landed > 0 ? 0.9 : 0,
          zIndex: 6,
        }}
      />

      <div style={{ position: "absolute", inset: "54px 56px", zIndex: 8 }}>
        <div style={{ display: "flex", height: "100%", transform: `translate(${shakeX.toFixed(2)}px, ${shakeY.toFixed(2)}px)` }}>
          <BeatStage
            frame={frame}
            accent={accent}
            soft={soft}
            label="GLASSING WIPE"
            sub={`PRECEPT_OVERRIDE · ${landed}/6 NODES`}
            metrics={[
              { label: "BONE_PLUGS.MEM", value: landed >= 1 ? 1 : 0.2 },
              { label: "OROKIN_HALL.MEM", value: landed >= 2 ? 1 : 0.2 },
              { label: "THE_SEVEN.MEM", value: landed >= 3 ? 1 : 0.2 },
              { label: "ORDAN_KARRIS", value: landed >= 4 ? 1 : 0.15 },
              { label: "ORDIS.FACADE", value: landed >= 5 ? 1 : 0.1 },
            ]}
          >
            <CephalonCube
              frame={frame}
              rageLevel={Math.max(0.05, 1 - recall * 0.95)}
              recall={recall}
              size={540}
              idPrefix="b6"
            />
          </BeatStage>

          {/* 右侧：音节 + 金门 */}
          <div style={{ flex: 1, minWidth: 0, position: "relative", paddingLeft: 24 }}>
            {/* 六段音节 */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: 6,
                marginTop: 26,
              }}
            >
              {SYLLABLES.map((syl, i) => {
                const on = landed > i;
                const hitT = clamp01((frame - GATE_HITS[i]) / 8);
                return (
                  <div
                    key={syl}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 74,
                        fontWeight: 900,
                        letterSpacing: -1,
                        color: on ? "#FFFFFF" : rgba(PALETTE.karris.core, 0.55),
                        textShadow: on
                          ? `0 0 30px ${PALETTE.ordis.core}, 0 0 70px ${rgba(PALETTE.ordis.core, 0.6)}`
                          : `0 0 ${10 + pulse * 10}px ${rgba(PALETTE.karris.core, 0.5)}`,
                        transform: `scale(${1 + (on ? Math.max(0, 1 - hitT) * 0.22 : 0)})`,
                        display: "inline-block",
                      }}
                    >
                      {syl}
                    </span>
                    {i < SYLLABLES.length - 1 && (
                      <span style={{ fontSize: 30, color: rgba(accent, 0.3) }}>·</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 被抹除的记忆区块：一格一格从红刷成青 */}
            <div
              style={{
                position: "absolute",
                left: 26,
                right: 0,
                top: 132,
                bottom: 38,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(26, 1fr)",
                  gridTemplateRows: "repeat(9, 1fr)",
                  gap: 4,
                  height: "100%",
                }}
              >
                {Array.from({ length: 234 }).map((_, i) => {
                  const row = Math.floor(i / 26);
                  const rowY = 132 + (row / 9) * 760;
                  const wiped = rowY < (revealPct / 100) * 1080;
                  const hot = !wiped && seededRandom(i * 2.7 + Math.floor(frame / 5)) > 0.88;
                  return (
                    <div
                      key={`cell-${i}`}
                      style={{
                        background: wiped
                          ? rgba(accent, hot ? 0.95 : 0.5)
                          : hot
                          ? PALETTE.karris.core
                          : rgba(PALETTE.karris.core, 0.18),
                        boxShadow: hot ? `0 0 8px ${rgba(wiped ? accent : PALETTE.karris.core, 0.8)}` : "none",
                      }}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${revealPct}%`,
                  height: 2,
                  background: PALETTE.ordis.soft,
                  boxShadow: `0 0 20px ${PALETTE.ordis.core}`,
                  opacity: 0.7,
                }}
              />
            </div>

            {/* 金门 */}
            <div style={{ position: "absolute", left: 24, right: 0, top: 0, bottom: 0 }}>
              {GATE_HITS.map((hit, i) => {
                const p = spring({
                  frame: frame - hit,
                  fps,
                  config: { stiffness: 420, damping: 24, mass: 1.1 },
                });
                if (frame < hit - 6) return null;
                const y = -140 + (GATE_Y[i] + 140) * clamp01(p);
                const flash = clamp01(1 - (frame - hit) / 8);
                return (
                  <div
                    key={hit}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: y,
                      height: 18,
                      background: `linear-gradient(to bottom, ${rgba(PALETTE.orokin.soft, 0.95)} 0%, ${
                        PALETTE.orokin.core
                      } 45%, ${rgba("#6B5210", 0.9)} 100%)`,
                      boxShadow: `0 0 ${26 + flash * 50}px ${rgba(PALETTE.orokin.core, 0.85)}, 0 0 90px ${rgba(
                        PALETTE.orokin.core,
                        0.45
                      )}`,
                      zIndex: 12,
                    }}
                  >
                    {/* 门齿 */}
                    {Array.from({ length: 14 }).map((_, k) => (
                      <div
                        key={k}
                        style={{
                          position: "absolute",
                          left: `${(k / 14) * 100}%`,
                          top: 18,
                          width: 10,
                          height: 12,
                          background: PALETTE.orokin.core,
                          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                          opacity: 0.75,
                        }}
                      />
                    ))}
                    {/* 撞击火花 */}
                    {flash > 0.05 &&
                      Array.from({ length: 10 }).map((_, k) => (
                        <div
                          key={`spark-${k}`}
                          style={{
                            position: "absolute",
                            left: `${seededRandom(i * 7 + k * 3) * 100}%`,
                            top: -4 - seededRandom(k * 5.1 + i) * 40 * flash,
                            width: 3,
                            height: 3,
                            background: "#FFF6DC",
                            opacity: flash,
                            transform: "rotate(45deg)",
                          }}
                        />
                      ))}
                  </div>
                );
              })}
            </div>

            {/* 底部 */}
            <div
              style={{
                position: "absolute",
                left: 24,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                color: rgba(accent, 0.45),
              }}
            >
              <span>GLASSING WIPE // GOLDEN GATES</span>
              <span style={{ color: landed >= 6 ? PALETTE.ordis.soft : PALETTE.orokin.core }}>
                {landed}/6 SEALED
              </span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
