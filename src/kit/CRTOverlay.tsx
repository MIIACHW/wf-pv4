import React from "react";
import { HEIGHT, WIDTH, clamp01 } from "../data/math";

/**
 * ============================================================================
 *  src/kit/CRTOverlay.tsx  —  全局 CRT 显像管遮罩
 * ============================================================================
 *  扫描线、滚动亮带、暗角、随机噪点。
 *  注意：扫描线的位移是 backgroundPositionY = frame 的函数，
 *  不是 CSS animation —— 这是铁律 1 的要求。
 * ============================================================================
 */

export type CRTOverlayProps = {
  frame: number;
  rageLevel: number;
};

export const CRTOverlay: React.FC<CRTOverlayProps> = ({ frame, rageLevel }) => {
  const rage = clamp01(rageLevel);

  // 扫描线以 4px 为周期向上滚动
  const scanOffset = -((frame * 1.25) % 4);
  // 一条缓慢下扫的亮带
  const rollY = ((frame * 6) % (HEIGHT + 500)) - 500;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* 扫描线 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.34) 0px, rgba(0,0,0,0.34) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)",
          backgroundPositionY: `${scanOffset}px`,
          opacity: 0.5,
          mixBlendMode: "multiply",
        }}
      />

      {/* 滚动亮带 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: rollY,
          height: 260,
          background:
            "linear-gradient(to bottom, rgba(120,255,255,0) 0%, rgba(160,245,255,0.035) 45%, rgba(160,245,255,0.06) 50%, rgba(160,245,255,0.03) 55%, rgba(120,255,255,0) 100%)",
        }}
      />

      {/* 暗角：一定要缓，否则四角和上下会被压成纯黑，TUI 全看不见 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 115% 108% at 50% 50%, rgba(0,0,0,0) 56%, rgba(0,0,0,0.14) 82%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* 噪点：feTurbulence 的 seed 固定 → 每帧完全一致，不会闪 */}
      <svg
        width={WIDTH}
        height={HEIGHT}
        style={{ position: "absolute", inset: 0, opacity: 0.05 + rage * 0.06 }}
      >
        <filter id="crt-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={7}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={WIDTH} height={HEIGHT} filter="url(#crt-grain)" />
      </svg>

      {/* 屏幕边缘内阴影 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow:
            "inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 24px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};
