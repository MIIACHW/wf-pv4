import React from "react";
import { clamp, lerp } from "../data/math";
import { rgba } from "../data/palette";
import { MONO } from "../data/typography";

/**
 * ============================================================================
 *  src/kit/ArmorFrame.tsx  —  奥罗金装甲边框
 * ============================================================================
 *  Beat 2 第 168 帧：四块装甲板以 spring 高刚度从四周砸合，只留中间一个窗口；
 *  Beat 3 起再退回成 46px 的厚边框，成为全片常驻的"画框"。
 *  close = 0 → 细边框；close = 1 → 完全闭合；允许 > 1 制造过冲撞击感。
 * ============================================================================
 */

export type ArmorFrameProps = {
  frame: number;
  close: number;
  accent: string;
  pulse: number;
};

type PlateProps = {
  style: React.CSSProperties;
  accent: string;
  pulse: number;
  inner: "top" | "bottom" | "left" | "right";
  bolts: number;
};

const Plate: React.FC<PlateProps> = ({ style, accent, pulse, inner, bolts }) => {
  const edge =
    inner === "top"
      ? { left: 0, right: 0, bottom: 0, height: 2 }
      : inner === "bottom"
      ? { left: 0, right: 0, top: 0, height: 2 }
      : inner === "left"
      ? { top: 0, bottom: 0, right: 0, width: 2 }
      : { top: 0, bottom: 0, left: 0, width: 2 };

  return (
    <div
      style={{
        position: "absolute",
        background:
          "linear-gradient(160deg, #0b1620 0%, #071019 42%, #04090e 100%)",
        boxShadow: `inset 0 0 60px rgba(0,0,0,0.9)`,
        ...style,
      }}
    >
      {/* 内侧高光边 */}
      <div
        style={{
          position: "absolute",
          ...edge,
          background: accent,
          opacity: 0.55 + pulse * 0.4,
          boxShadow: `0 0 18px ${accent}`,
        }}
      />
      {/* 螺栓 */}
      {Array.from({ length: bolts }).map((_, i) => {
        const t = (i + 0.5) / bolts;
        const pos =
          inner === "top" || inner === "bottom"
            ? { left: `${t * 100}%`, [inner === "top" ? "bottom" : "top"]: 12 }
            : { top: `${t * 100}%`, [inner === "left" ? "right" : "left"]: 12 };
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              background: rgba(accent, 0.45 + pulse * 0.3),
              transform: "translate(-50%, -50%) rotate(45deg)",
              ...(pos as React.CSSProperties),
            }}
          />
        );
      })}
      {/* 斜纹警示 */}
      <div
        style={{
          position: "absolute",
          ...edge,
          height: inner === "top" || inner === "bottom" ? 10 : undefined,
          width: inner === "left" || inner === "right" ? 10 : undefined,
          transform: inner === "top" ? "translateY(-10px)" : inner === "bottom" ? "translateY(10px)" : undefined,
          backgroundImage: `repeating-linear-gradient(45deg, ${rgba(accent, 0.22)} 0 6px, transparent 6px 16px)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export const ArmorFrame: React.FC<ArmorFrameProps> = ({ frame, close, accent, pulse }) => {
  const c = clamp(close, 0, 1.2);
  const topH = lerp(46, 150, c);
  const bottomH = topH;
  const leftW = lerp(46, 380, c);
  const rightW = leftW;
  const midH = 1080 - topH - bottomH;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}>
      <Plate
        accent={accent}
        pulse={pulse}
        inner="top"
        bolts={9}
        style={{ left: 0, right: 0, top: 0, height: topH }}
      />
      <Plate
        accent={accent}
        pulse={pulse}
        inner="bottom"
        bolts={9}
        style={{ left: 0, right: 0, top: 1080 - bottomH, height: bottomH }}
      />
      <Plate
        accent={accent}
        pulse={pulse}
        inner="left"
        bolts={7}
        style={{ left: 0, top: topH, width: leftW, height: midH }}
      />
      <Plate
        accent={accent}
        pulse={pulse}
        inner="right"
        bolts={7}
        style={{ left: 1920 - rightW, top: topH, width: rightW, height: midH }}
      />

      {/* 角标 */}
      {[
        [12, 12, 1, 1],
        [1908, 12, -1, 1],
        [12, 1068, 1, -1],
        [1908, 1068, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 22,
            height: 22,
            borderTop: `2px solid ${rgba(accent, 0.8)}`,
            borderLeft: `2px solid ${rgba(accent, 0.8)}`,
            transform: `scaleX(${sx}) scaleY(${sy})`,
          }}
        />
      ))}

      {/* 帧号 */}
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 18,
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: 2,
          color: rgba(accent, 0.35),
        }}
      >
        F{String(frame).padStart(5, "0")}
      </div>
    </div>
  );
};
