import React from "react";
import {
  clamp01,
  corruptTokens,
  getBeatPulse,
  typewriter,
  type CorruptKind,
} from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { typingSpeed, type OrdisLine } from "../data/script";

/**
 * ============================================================================
 *  src/kit/BeatStage.tsx  —  左侧舞台（38%）
 * ============================================================================
 *  只放主体图形 + 极少量读数；有台词时把台词放大到 26px，
 *  没有台词时用节拍计量条把空白填满。
 * ============================================================================
 */

export type BeatStageProps = {
  frame: number;
  accent: string;
  soft: string;
  label: string;
  sub?: string;
  children: React.ReactNode;
  dialogue?: OrdisLine | null;
  metrics?: { label: string; value: number }[];
};

export const BeatStage: React.FC<BeatStageProps> = ({
  frame,
  accent,
  soft,
  label,
  sub,
  children,
  dialogue,
  metrics,
}) => {
  const pulse = getBeatPulse(frame);

  const typed = dialogue
    ? typewriter(dialogue.en, frame, dialogue.start, typingSpeed(dialogue.en, dialogue.start, dialogue.end))
    : "";
  const tokens = dialogue
    ? corruptTokens(typed, "OROKIN_ARCHIVE_04", clamp01(dialogue.glitch), frame)
    : [];
  const cnTyped = dialogue
    ? typewriter(
        dialogue.cn,
        frame,
        dialogue.start + (dialogue.end - dialogue.start) * 0.4,
        typingSpeed(dialogue.cn, dialogue.start, dialogue.end)
      )
    : "";

  const color: Record<CorruptKind, string> = {
    normal: soft,
    glitch: rgba(PALETTE.karris.core, 0.95),
    hidden: PALETTE.karris.core,
  };

  return (
    <div
      style={{
        width: "38%",
        flexShrink: 0,
        height: "100%",
        boxSizing: "border-box",
        padding: "30px 26px 22px 36px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRight: `1px solid ${rgba(accent, 0.2)}`,
      }}
    >
      {/* 左缘能量条 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 60,
          bottom: 60,
          width: 3,
          background: accent,
          opacity: 0.35 + pulse * 0.6,
          boxShadow: `0 0 ${12 + pulse * 22}px ${accent}`,
        }}
      />

      {/* 头部 */}
      <div style={{ flexShrink: 0, marginBottom: 4 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 3,
            color: rgba(accent, 0.9),
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              marginTop: 4,
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 1.8,
              color: rgba(accent, 0.3),
            }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* 主体 */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      {/* 计量条：不管有没有台词都显示，保证左栏不空 */}
      {metrics && (
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 5, marginBottom: dialogue ? 12 : 0 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span
                style={{
                  width: 146,
                  fontFamily: MONO,
                  fontSize: 9.8,
                  letterSpacing: 1.1,
                  color: rgba(accent, 0.52),
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {m.label}
              </span>
              <div style={{ flex: 1, height: 4, background: rgba(accent, 0.1) }}>
                <div
                  style={{
                    width: `${clamp01(m.value) * 100}%`,
                    height: "100%",
                    background: accent,
                    boxShadow: `0 0 6px ${rgba(accent, 0.6)}`,
                  }}
                />
              </div>
              <span
                style={{
                  width: 34,
                  textAlign: "right",
                  fontFamily: MONO,
                  fontSize: 9,
                  color: rgba(accent, 0.6),
                }}
              >
                {(clamp01(m.value) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 台词 */}
      {dialogue && (
        <div
          style={{
            flexShrink: 0,
            borderLeft: `2px solid ${rgba(accent, 0.6)}`,
            paddingLeft: 14,
            marginBottom: 2,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 8.5,
              letterSpacing: 2.6,
              color: rgba(accent, 0.4),
              marginBottom: 7,
            }}
          >
            ORBITER TRANSMISSION // {dialogue.glitch > 0.3 ? "ORDAN KARRIS" : "ORDIS"}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 25,
              lineHeight: 1.28,
              fontWeight: 400,
              color: soft,
              textShadow: `0 0 22px ${rgba(accent, 0.45)}`,
              minHeight: 72,
            }}
          >
            {tokens.map((token, i) => (
              <span key={i} style={{ color: color[token.kind] }}>
                {token.text}
              </span>
            ))}
            <span style={{ opacity: frame % 30 < 15 ? 1 : 0, color: accent }}>▌</span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              lineHeight: 1.45,
              letterSpacing: 0.6,
              color: rgba(accent, 0.55),
            }}
          >
            {cnTyped}
          </div>
        </div>
      )}
    </div>
  );
};
