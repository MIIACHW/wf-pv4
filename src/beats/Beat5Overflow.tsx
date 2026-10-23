import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, getBeatPulse, seededRandom, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { BEAT, getLine, getOverflowWord } from "../data/script";
import { PARAM_SLIDERS } from "../data/warframe";
import { BeatStage } from "../kit/BeatStage";
import { CephalonCube } from "../kit/CephalonCube";
import { LotusSigil } from "../kit/LotusSigil";
import { LyricHeadline } from "../kit/LyricHeadline";

/**
 * ============================================================================
 *  src/beats/Beat5Overflow.tsx  —  00:08.00 ~ 00:11.00
 * ============================================================================
 *  "Fill in my data parameters"
 *  480~540：12 条青色参数通道极速充能
 *  540~660：冲爆 999% [OVERFLOW]，全屏赤毒血红 + 奥罗金暗金，
 *           八面体炸开露出血色莲花与骨栓，右侧巨型动能字连砸三句
 * ============================================================================
 */

export type Beat5Props = {
  frame: number;
  accent: string;
  soft: string;
};

export const Beat5Overflow: React.FC<Beat5Props> = ({ frame, accent, soft }) => {
  const pulse = getBeatPulse(frame);
  const line = getLine(frame);

  const overflow = frame >= BEAT.overflowHit;
  const overflowT = clamp01((frame - BEAT.overflowHit) / 16);
  const slidersOut = 1 - clamp01((frame - 556) / 18);
  const kineticIn = clamp01((frame - 548) / 10);

  const { word, since } = getOverflowWord(frame);
  const punch = 1 + Math.max(0, 1 - since / 9) * 0.09;
  const jitter = seededSign(frame * 2.1) * (2 + overflowT * 6);

  return (
    <AbsoluteFill style={{ backgroundColor: overflow ? "#0A0003" : "#03080D", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: overflow
            ? `radial-gradient(ellipse 70% 65% at 32% 50%, ${rgba(
                PALETTE.karris.core,
                0.3
              )} 0%, rgba(0,0,0,0) 62%), radial-gradient(ellipse 50% 50% at 82% 40%, ${rgba(
                PALETTE.orokin.core,
                0.16
              )} 0%, rgba(0,0,0,0) 70%)`
            : `radial-gradient(ellipse 55% 50% at 30% 50%, ${rgba(accent, 0.1)} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${rgba(
            overflow ? PALETTE.karris.core : accent,
            0.06
          )} 1px, transparent 1px), linear-gradient(to bottom, ${rgba(
            overflow ? PALETTE.karris.core : accent,
            0.06
          )} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          opacity: 0.7,
        }}
      />

      {/* 巨型动能大字（只占右侧，别压住左边的主体） */}
      {overflow && (
        <div
          style={{
            position: "absolute",
            left: "36%",
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: kineticIn * 0.95,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: Math.min(132, 1050 / (word.length * 0.58)),
              fontWeight: 900,
              lineHeight: 0.84,
              letterSpacing: -5,
              textTransform: "uppercase",
              textAlign: "center",
              color: rgba(PALETTE.karris.core, 0.32 + pulse * 0.1),
              transform: `translate(${jitter.toFixed(1)}px, 0) scale(${punch.toFixed(3)})`,
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </div>
          <div
            style={{
              position: "absolute",
              top: "58%",
              fontFamily: SANS,
              fontSize: Math.min(132, 1050 / (word.length * 0.58)),
              fontWeight: 900,
              letterSpacing: -5,
              textTransform: "uppercase",
              color: "transparent",
              WebkitTextStroke: `2px ${rgba(PALETTE.karris.soft, 0.22)}`,
              transform: `translate(${(jitter * -1.4).toFixed(1)}px, 0)`,
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </div>
        </div>
      )}

      <div style={{ position: "absolute", inset: "54px 56px" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <BeatStage
            frame={frame}
            accent={accent}
            soft={soft}
            label={overflow ? "ORDAN KARRIS" : "CEPHALON // ORDIS"}
            sub={overflow ? "BONE_PLUGS_EXTRACTED · LETHAL" : "DATA INJECTION"}
            dialogue={line}
            metrics={[
              { label: "FOUNDRY_SYNC", value: 0.92 },
              { label: "ARSENAL_LINK", value: 0.88 },
              { label: "KUVA_TRACE", value: overflow ? 0.99 : 0.2 },
              { label: "CORE TEMP", value: overflow ? 0.98 : 0.42 },
            ]}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {overflow && (
                <CephalonCube
                  frame={frame}
                  rageLevel={1}
                  size={560}
                  idPrefix="b5"
                />
              )}
              {overflow && (
                <div
                  style={{
                    position: "absolute",
                    width: 470,
                    height: 470,
                    opacity: overflowT,
                    transform: `rotate(${-frame * 0.15}deg)`,
                    mixBlendMode: "screen",
                  }}
                >
                  <LotusSigil frame={frame} progress={overflowT} rageLevel={1} accent={PALETTE.karris.core} />
                </div>
              )}
              {!overflow && <CephalonCube frame={frame} rageLevel={0.05} size={560} idPrefix="b5" />}
            </div>
          </BeatStage>

          {/* 右侧 */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              paddingLeft: 28,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div style={{ opacity: 1 - kineticIn * 0.85 }}>
              <LyricHeadline
                frame={frame}
                accent={accent}
                soft={overflow ? "#FFD9DE" : soft}
                baseSize={54}
              />
            </div>

            {/* 参数通道 */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 9,
                opacity: slidersOut,
              }}
            >
              {PARAM_SLIDERS.map((name, i) => {
                const start = BEAT.fiveStart + i * 3;
                const charge = clamp01((frame - start) / 34);
                const value = overflow ? 9.99 : charge;
                const pct = Math.round(value * 100);
                const hot = pct > 100;
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span
                      style={{
                        width: 236,
                        fontFamily: MONO,
                        fontSize: 12,
                        letterSpacing: 1.4,
                        color: hot ? rgba(PALETTE.karris.soft, 0.95) : rgba(accent, 0.62),
                      }}
                    >
                      {name}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 12,
                        background: rgba(hot ? PALETTE.karris.core : accent, 0.12),
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, value * 100)}%`,
                          height: "100%",
                          background: hot ? PALETTE.karris.core : accent,
                          boxShadow: `0 0 14px ${rgba(hot ? PALETTE.karris.core : accent, 0.9)}`,
                        }}
                      />
                      {hot && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `repeating-linear-gradient(45deg, ${rgba(
                              "#FFD9DE",
                              0.35
                            )} 0 6px, transparent 6px 12px)`,
                            transform: `translateX(${seededRandom(i * 3.3 + Math.floor(frame / 2)) * 12}px)`,
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        width: 96,
                        textAlign: "right",
                        fontFamily: MONO,
                        fontSize: 12,
                        fontWeight: 700,
                        color: hot ? "#FFD9DE" : rgba(accent, 0.85),
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {pct}%
                    </span>
                    <span
                      style={{
                        width: 92,
                        textAlign: "right",
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 1,
                        color: hot ? PALETTE.karris.core : rgba(accent, 0.3),
                      }}
                    >
                      {hot ? "[OVERFLOW]" : charge >= 1 ? "[OK]" : "[LINK]"}
                    </span>
                  </div>
                );
              })}
            </div>

            {overflow && (
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 2,
                  color: rgba(PALETTE.karris.soft, 0.7 * kineticIn),
                }}
              >
                <span>PARAMETER OVERFLOW // 999%</span>
                <span style={{ color: PALETTE.karris.core }}>CONTAINMENT LOST</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
