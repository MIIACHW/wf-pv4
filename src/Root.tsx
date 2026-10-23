import React from "react";
import { Composition } from "remotion";

import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from "./data/math";
import { MainVideo } from "./MainVideo";

/**
 * ============================================================================
 *  src/Root.tsx  —  Remotion 的"项目清单"
 * ============================================================================
 *  这里注册了两条时间线：
 *  1) OrdisPV   —— 全片 12720 帧（212 秒 @60fps），最终渲染用这个
 *  2) OrdisTest —— 900 帧（15 秒），只跑第一步的分镜测试
 * ============================================================================
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OrdisPV"
        component={MainVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="OrdisTest"
        component={MainVideo}
        durationInFrames={900}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
