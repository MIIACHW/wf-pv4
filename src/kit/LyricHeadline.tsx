import React from "react";
import { clamp01, getBeatPulse, seededSign } from "../data/math";
import { PALETTE, rgba } from "../data/palette";
import { MONO, SANS } from "../data/typography";
import { getBeatLyric } from "../data/script";

/**
 * ============================================================================
 *  src/kit/LyricHeadline.tsx  —  歌词即指令
 * ============================================================================
 *  歌词不是字幕，是主视觉：40~72px 巨型动能字，核心词再放大加发光，
 *  每 0.46 秒跟着鼓点做一次 scale punch + 横向抖动。
 * ============================================================================
 */

export type LyricHeadlineProps = {
  frame: number;
  accent: string;
  soft: string;
  /** 基础字号，会按歌词长度自动收缩 */
  baseSize?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
};

export const LyricHeadline: React.FC<LyricHeadlineProps> = ({
  frame,
  accent,
  soft,
  baseSize = 66,
  align = "left",
  style,
}) => {
  const lyric = getBeatLyric(frame);
  const pulse = getBeatPulse(frame);
  const text = lyric.text;
  const emphasis = lyric.emphasis ?? "";

  // 长句自动降字号，保证一行/两行内拍满画面
  const size = Math.max(38, Math.min(baseSize, baseSize - Math.max(0, text.length - 20) * 0.62));

  const hasEmphasis = emphasis.length > 0 && text.includes(emphasis);
  const before = hasEmphasis ? text.slice(0, text.indexOf(emphasis)) : text;
  const after = hasEmphasis ? text.slice(text.indexOf(emphasis) + emphasis.length) : "";

  const jitter = seededSign(frame * 1.7) * (1 + pulse * 3);
  const scale = 1 + pulse * 0.025;

  return (
    <div style={{ textAlign: align, ...style }}>
      {/* 标签行 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: align === "center" ? "center" : "flex-start",
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 3.2,
          color: rgba(accent, 0.45),
          marginBottom: 10,
        }}
      >
        <span style={{ width: 16, height: 2, background: accent, opacity: 0.7 }} />
        AUDIO STREAM // LYRIC LOCK
        <span style={{ color: rgba(accent, 0.2) }}>|</span>
        <span>130.00 BPM</span>
      </div>

      <div
        style={{
          fontFamily: SANS,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 0.94,
          letterSpacing: -1.6,
          textTransform: "uppercase",
          color: soft,
          transform: `translateX(${jitter.toFixed(2)}px) scale(${scale.toFixed(4)})`,
          transformOrigin: align === "center" ? "center" : "left top",
          textShadow: `0 0 ${18 + pulse * 16}px ${rgba(accent, 0.55)}`,
        }}
      >
        {before}
        {hasEmphasis && (
          <span
            style={{
              color: "#FFFFFF",
              textShadow: `0 0 ${26 + pulse * 26}px ${accent}, 0 0 60px ${rgba(accent, 0.6)}`,
              textDecoration: "underline",
              textDecorationColor: rgba(PALETTE.orokin.core, 0.55),
              textUnderlineOffset: size * 0.12,
              textDecorationThickness: Math.max(2, size * 0.05),
            }}
          >
            {emphasis}
          </span>
        )}
        {after}
      </div>

      {lyric.cn && (
        <div
          style={{
            marginTop: 8,
            fontFamily: MONO,
            fontSize: 13,
            letterSpacing: 3,
            color: rgba(accent, 0.4),
          }}
        >
          {lyric.cn}
        </div>
      )}
    </div>
  );
};

/** 小工具：把进度 0~1 变成 beat 对齐的整数步数 */
export const beatStep = (frame: number, perBeat = 1): number =>
  Math.floor((frame / ((60 / 130) * 60)) * perBeat);

export const clampPulse = (v: number): number => clamp01(v);
