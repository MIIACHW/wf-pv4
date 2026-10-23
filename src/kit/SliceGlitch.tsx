import React from "react";
import { clamp01, seededSign } from "../data/math";

/**
 * ============================================================================
 *  src/kit/SliceGlitch.tsx  —  真正的屏幕切片撕裂
 * ============================================================================
 *  rageLevel > 0.5 时，把整幅画面额外复制 3 层，
 *  每层用 clip-path: inset() 切成不同高度的横条，
 *  再各自 translateX(±25px) 错位，并用 mix-blend-mode: screen 做红/青通道分离。
 *
 *  实现小技巧：每层内部再叠一张纯色 + multiply，就等于"只保留该通道"，
 *  叠回底图时用 screen 相加，就是标准的 RGB 分离。
 * ============================================================================
 */

export type SliceGlitchProps = {
  frame: number;
  intensity: number; // 0 ~ 1，> 0.02 才启用
  children: React.ReactNode;
};

type Band = {
  top: number;
  bottom: number;
  dx: number;
  color: string;
  opacity: number;
};

export const SliceGlitch: React.FC<SliceGlitchProps> = ({ frame, intensity, children }) => {
  const amount = clamp01(intensity);

  if (amount <= 0.02) {
    return <>{children}</>;
  }

  // 每 2 帧换一次撕裂高度，避免每帧乱跳导致糊
  const tick = Math.floor(frame / 2);
  const bands: Band[] = [
    {
      top: 4 + (seededSign(tick * 1.7) + 1) * 6,
      bottom: 52 + (seededSign(tick * 2.3) + 1) * 8,
      dx: seededSign(tick * 3.1) * 34 * amount,
      color: "#FF0033",
      opacity: 1,
    },
    {
      top: 34 + (seededSign(tick * 2.9) + 1) * 8,
      bottom: 26 + (seededSign(tick * 1.3) + 1) * 6,
      dx: seededSign(tick * 4.7 + 2) * 34 * amount,
      color: "#00E5FF",
      opacity: 0.95,
    },
    {
      top: 64 + (seededSign(tick * 3.7) + 1) * 6,
      bottom: 2 + (seededSign(tick * 5.1) + 1) * 3,
      dx: seededSign(tick * 2.1 + 7) * 34 * amount,
      color: "#FF0033",
      opacity: 0.85,
    },
  ];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* 底层：原画 */}
      {children}

      {/* 撕裂层 */}
      {bands.map((band, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(${band.top.toFixed(1)}% 0 ${band.bottom.toFixed(1)}% 0)`,
            transform: `translateX(${band.dx.toFixed(2)}px)`,
            mixBlendMode: "screen",
            opacity: band.opacity * amount,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              isolation: "isolate",
              // 提亮一点，screen 叠上去才看得见（否则在血红的画面里几乎无感）
              filter: "brightness(1.45) contrast(1.1)",
            }}
          >
            {children}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: band.color,
                mixBlendMode: "multiply",
              }}
            />
          </div>
          {/* 切缝高光 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 1,
              background: band.color,
              opacity: 0.8,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 1,
              background: band.color,
              opacity: 0.55,
            }}
          />
        </div>
      ))}
    </div>
  );
};
