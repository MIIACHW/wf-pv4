import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic, getBeatPulse, seededRandom } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { BEAT, getLine } from "../data/script";
import { ORDIS_CLASS_CODE } from "../data/warframe";
import { BeatStage } from "../kit/BeatStage";
import { CephalonCube } from "../kit/CephalonCube";
import { LyricHeadline } from "../kit/LyricHeadline";

/**
 * ============================================================================
 *  src/beats/Beat4Creation.tsx  —  00:05.50 ~ 00:08.00
 * ============================================================================
 *  "And let's begin — OBJECT CREATION"
 *  330~352：8 块碎片向中心坍缩
 *  352~390：三维蓝图视口建立
 *  390（06.5s）：OBJECT CREATION 重音 → 代码块砸进画面，奥迪斯第一次开口
 * ============================================================================
 */

export type Beat4Props = {
  frame: number;
  accent: string;
  soft: string;
};

const CODE_COLOR = {
  kw: PALETTE.orokin.core,
  str: PALETTE.ordis.core,
  com: PALETTE.karris.core,
  plain: "#DCEFF6",
} as const;

export const Beat4Creation: React.FC<Beat4Props> = ({ frame, accent, soft }) => {
  const pulse = getBeatPulse(frame);
  const line = getLine(frame);

  const collapseT = easeOutCubic(clamp01((frame - 330) / 22));
  const buildT = clamp01((frame - 352) / 38);
  const slam = clamp01((frame - BEAT.creationHit) / 12);

  const panelScale = 1 + Math.max(0, 1 - (frame - BEAT.creationHit) / 14) * 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: "#03080D", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 50% at 70% 50%, ${rgba(
            PALETTE.ordis.core,
            0.08
          )} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* 蓝图网格 */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${rgba(
            accent,
            0.07
          )} 1px, transparent 1px), linear-gradient(to bottom, ${rgba(
            accent,
            0.07
          )} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.8 * buildT,
        }}
      />

      <div style={{ position: "absolute", inset: "54px 56px" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <BeatStage
            frame={frame}
            accent={accent}
            soft={soft}
            label="CEPHALON // ORDIS"
            sub="INSTANTIATION · SERIES 2"
            dialogue={line}
            metrics={[
              { label: "BODY", value: 0.12 },
              { label: "SOURCE", value: 0.34 },
              { label: "LOYALTY", value: 1 },
              { label: "VOICE", value: 0.48 + pulse * 0.05 },
            ]}
          >
            <CephalonCube frame={frame} rageLevel={0} assemble={0.55 + buildT * 0.45} size={560} idPrefix="b4" />
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
            <div style={{ transform: `scale(${panelScale.toFixed(3)})`, transformOrigin: "left top" }}>
              <LyricHeadline frame={frame} accent={accent} soft={soft} baseSize={58} />
            </div>

            {/* 坍缩的碎片残影 */}
            {frame < 360 &&
              Array.from({ length: 8 }).map((_, i) => {
                const col = i % 4;
                const row = Math.floor(i / 4);
                const startX = (col + 0.5) * 25;
                const startY = 26 + row * 30;
                const t = clamp01((collapseT - i * 0.03) / 0.9);
                const x = startX + (62 - startX) * t;
                const y = startY + (58 - startY) * t;
                return (
                  <div
                    key={`ghost-${i}`}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      width: 120,
                      height: 120,
                      transform: `translate(-50%, -50%) rotate(45deg) scale(${(1 - t).toFixed(3)})`,
                      border: `1px solid ${rgba(accent, 0.8)}`,
                      background: rgba(accent, 0.08),
                      opacity: 1 - t * 0.4,
                    }}
                  />
                );
              })}

            {/* 编译视口 */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                marginTop: 16,
                border: `1px solid ${rgba(accent, 0.35)}`,
                background: "rgba(3, 9, 14, 0.86)",
                display: "flex",
                flexDirection: "column",
                opacity: buildT,
                boxShadow: `0 0 ${30 + pulse * 20}px ${rgba(accent, 0.18)}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* 标题栏 */}
              <div
                style={{
                  height: 34,
                  flexShrink: 0,
                  borderBottom: `1px solid ${rgba(accent, 0.3)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 2,
                  color: rgba(accent, 0.6),
                  background: rgba(accent, 0.06),
                }}
              >
                <span>OROKIN_WEAVE // COMPILER</span>
                <span style={{ color: rgba(accent, 0.35) }}>Cephalon_Ordis.ts — 5 lines</span>
              </div>

              {/* 代码 */}
              <div
                style={{
                  flex: 1,
                  padding: "22px 20px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {ORDIS_CLASS_CODE.map((codeLine, i) => {
                  const showAt = BEAT.creationHit + i * 7;
                  if (frame < showAt) return null;
                  const lineT = clamp01((frame - showAt) / 6);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 14,
                        fontFamily: MONO,
                        fontSize: 25,
                        lineHeight: "52px",
                        opacity: lineT,
                      }}
                    >
                      <span style={{ color: rgba(accent, 0.22), width: 26, textAlign: "right" }}>
                        {i + 1}
                      </span>
                      <span
                        style={{
                          color: CODE_COLOR[codeLine.kind],
                          whiteSpace: "pre",
                          textShadow:
                            codeLine.kind === "com" ? `0 0 14px ${rgba(PALETTE.karris.core, 0.7)}` : "none",
                        }}
                      >
                        {codeLine.text}
                      </span>
                    </div>
                  );
                })}
                {frame >= BEAT.creationHit + 35 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      fontFamily: MONO,
                      fontSize: 25,
                      lineHeight: "52px",
                    }}
                  >
                    <span style={{ width: 26 }} />
                    <span style={{ color: accent, opacity: frame % 30 < 15 ? 1 : 0.2 }}>█</span>
                  </div>
                )}

                {/* 编译日志：把代码下方的空白填满 */}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 14,
                    borderTop: `1px dashed ${rgba(accent, 0.18)}`,
                    fontFamily: MONO,
                    fontSize: 12,
                    lineHeight: "24px",
                    color: rgba(accent, 0.42),
                  }}
                >
                  {[
                    "> resolving OrokinServant ................ OK",
                    "> binding BEAST_OF_BONES ................ [REDACTED]",
                    "> mounting voice module ................. CHEERFUL_BUT_CRACKED",
                    "> loyaltyToOperator = Infinity",
                    "> instance created ...................... Cephalon_Ordis",
                  ].map((log, i) => {
                    if (frame < 400 + i * 7) return null;
                    return (
                      <div key={log} style={{ whiteSpace: "pre" }}>
                        {log}
                      </div>
                    );
                  })}
                </div>

                {/* 内存分配图：把编译窗底部填满 */}
                <div style={{ marginTop: "auto", paddingTop: 16 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 9,
                      letterSpacing: 2.2,
                      color: rgba(accent, 0.4),
                      marginBottom: 8,
                    }}
                  >
                    MEMORY ALLOCATION // 0x4F0000 — {Math.round(buildT * 96)} BLOCKS
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(48, 1fr)", gap: 3 }}>
                    {Array.from({ length: 96 }).map((_, i) => {
                      const alive = i < buildT * 96;
                      const hot = alive && seededRandom(i * 3.1 + Math.floor(frame / 6)) > 0.9;
                      return (
                        <div
                          key={i}
                          style={{
                            height: 10,
                            background: alive
                              ? hot
                                ? PALETTE.orokin.core
                                : rgba(accent, 0.55)
                              : rgba(accent, 0.1),
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 编译状态 */}
              <div
                style={{
                  height: 40,
                  flexShrink: 0,
                  borderTop: `1px solid ${rgba(accent, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 1.6,
                  color: rgba(accent, 0.45),
                }}
              >
                <span>COMPILING… {Math.min(100, Math.max(0, Math.round((frame - 390) / 1.1)))}%</span>
                <span style={{ color: rgba(PALETTE.karris.core, 0.75) }}>WARN 1 · source deprecated</span>
              </div>

              {/* 扫描线 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: `${((frame * 1.4) % 100).toFixed(1)}%`,
                  height: 1,
                  background: rgba(accent, 0.35),
                }}
              />
            </div>

            {/* 底部条 */}
            <div
              style={{
                height: 30,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: 2,
                color: rgba(accent, 0.35),
              }}
            >
              <span>OBJECT CREATION // CEPHALON SERIES 2</span>
              <span style={{ color: rgba(accent, 0.65) }}>
                {frame >= 390 ? "INSTANCE CREATED" : "AWAITING HIT"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 06.5s 重音：两帧白闪 */}
      {frame >= 390 && frame < 393 && (
        <AbsoluteFill style={{ background: "#EAFBFF", opacity: 0.55 }} />
      )}

      {/* 背景全息 */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: 260,
          width: 520,
          height: 520,
          opacity: 0.18 * buildT,
          transform: `rotate(${frame * 0.2}deg)`,
          pointerEvents: "none",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: i * 70,
              border: `1px solid ${rgba(accent, 0.6)}`,
              transform: `rotate(${(45 * (i + 1)) % 90}deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(to bottom, ${rgba(
              accent,
              0.5
            )} 0 1px, transparent 1px 22px)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
