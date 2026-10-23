import React from "react";
import {
  AbsoluteFill,
  Audio,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, clamp01, getBeatPulse, mapRange } from "./data/math";
import { PALETTE, mixHex } from "./data/palette";
import { BEAT } from "./data/script";
import { ArmorFrame } from "./kit/ArmorFrame";
import { CRTOverlay } from "./kit/CRTOverlay";
import { SliceGlitch } from "./kit/SliceGlitch";
import { Beat1Power } from "./beats/Beat1Power";
import { Beat2Protection } from "./beats/Beat2Protection";
import { Beat3Pieces } from "./beats/Beat3Pieces";
import { Beat4Creation } from "./beats/Beat4Creation";
import { Beat5Overflow } from "./beats/Beat5Overflow";
import { Beat6Initialization } from "./beats/Beat6Initialization";
import { Beat7Simulation } from "./beats/Beat7Simulation";

/**
 * ============================================================================
 *  src/MainVideo.tsx  —  七拍导演台
 * ============================================================================
 *  B1  0000–0105  0.00–1.75  Switch on the power line      高压电流劈屏
 *  B2  0105–0219  1.75–3.65  PROTECTION                    装甲板砸合封印
 *  B3  0219–0330  3.65–5.50  Lay down your pieces          8 块碎片发牌
 *  B4  0330–0480  5.50–8.00  OBJECT CREATION               代码实例化
 *  B5  0480–0660  8.00–11.0  Fill in my data parameters    参数溢出暴走
 *  B6  0660–0780  11.0–13.0  INITIALIZATION                六道金门洗回去
 *  B7  0780–0900  13.0–15.0  SIMULATION                    星图展开 + 归位
 * ============================================================================
 */

const getRage = (frame: number): number => {
  if (frame < 536) return 0;
  if (frame < 556) return mapRange(frame, 536, 556, 0, 1);
  if (frame < 780) return 1;
  if (frame < 820) return mapRange(frame, 780, 820, 1, 0.04);
  return 0.03;
};

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = getBeatPulse(frame);
  const rageLevel = getRage(frame);
  const colorT = clamp01(rageLevel * 1.15);
  const accent = mixHex(PALETTE.ordis.core, PALETTE.karris.core, colorT);
  const soft = mixHex(PALETTE.ordis.soft, PALETTE.karris.soft, colorT);

  // 装甲板：168 反色闪白 → 170 砸合 → 219 退回边框
  const closeIn =
    frame < 170
      ? 0
      : spring({ frame: frame - 170, fps, config: { stiffness: 300, damping: 13, mass: 1 } });
  const openOut =
    frame < BEAT.threeStart
      ? 0
      : spring({ frame: frame - BEAT.threeStart, fps, config: { stiffness: 120, damping: 20, mass: 0.8 } });
  const armorClose = clamp(clamp(closeIn, 0, 1.18) * clamp(1 - openOut, 0, 1.2), 0, 1.18);

  const invertFlash = frame >= 168 && frame < 170;

  let scene: React.ReactNode;
  if (frame < BEAT.twoStart) {
    scene = <Beat1Power frame={frame} accent={PALETTE.orokin.core} soft={soft} />;
  } else if (frame < BEAT.threeStart) {
    scene = <Beat2Protection frame={frame} accent={accent} soft={soft} />;
  } else if (frame < BEAT.fourStart) {
    scene = <Beat3Pieces frame={frame} accent={accent} soft={soft} />;
  } else if (frame < BEAT.fiveStart) {
    scene = <Beat4Creation frame={frame} accent={accent} soft={soft} />;
  } else if (frame < BEAT.sixStart) {
    scene = <Beat5Overflow frame={frame} accent={accent} soft={soft} />;
  } else if (frame < BEAT.sevenStart) {
    scene = <Beat6Initialization frame={frame} accent={accent} soft={soft} />;
  } else {
    scene = <Beat7Simulation frame={frame} accent={accent} soft={soft} />;
  }

  const sliceIntensity = clamp01((rageLevel - 0.45) / 0.4);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02060A", overflow: "hidden" }}>
      <Audio src={staticFile("bgm.mp3")} />

      <AbsoluteFill style={{ filter: invertFlash ? "invert(1)" : undefined }}>
        <SliceGlitch frame={frame} intensity={sliceIntensity}>
          {scene}
        </SliceGlitch>

        <ArmorFrame
          frame={frame}
          close={armorClose}
          accent={frame < BEAT.threeStart ? PALETTE.orokin.core : accent}
          pulse={pulse}
        />
      </AbsoluteFill>

      <CRTOverlay frame={frame} rageLevel={rageLevel} />

      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 18,
          fontFamily: '"Cascadia Mono", Consolas, monospace',
          fontSize: 9,
          letterSpacing: 2,
          color: `${PALETTE.ordis.core}30`,
        }}
      >
        F{String(frame).padStart(5, "0")} · BEAT{" "}
        {frame < 105 ? "1" : frame < 219 ? "2" : frame < 330 ? "3" : frame < 480 ? "4" : frame < 660 ? "5" : frame < 780 ? "6" : "7"}
        /7
      </div>
    </AbsoluteFill>
  );
};

export default MainVideo;
