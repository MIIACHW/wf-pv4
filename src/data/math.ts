/**
 * ============================================================================
 *  src/data/math.ts  —  时间轴 / 确定性伪随机 / 文本腐蚀
 * ============================================================================
 *  铁律 1：这里所有函数都是 (frame, seed) → value 的**纯映射**。
 *          没有 useState、没有 useEffect、没有 setTimeout、没有 CSS 动画。
 *  铁律 2：绝不调用 Math.random()。渲染器会开多个进程同时算不同帧，
 *          只有「同一个 seed 永远得到同一个结果」才不会闪烁。
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  0. 全片基准参数                                                            */
/* -------------------------------------------------------------------------- */

export const FPS = 60;
export const BPM = 130;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_IN_SECONDS = 212;
export const DURATION_IN_FRAMES = 12720; // 212s × 60fps

/** 一拍的帧数：60 / 130 × 60 ≈ 27.6923 帧 */
export const FRAMES_PER_BEAT = (60 / BPM) * FPS;
/** 一小节（4/4）的帧数 ≈ 110.77 帧 */
export const FRAMES_PER_BAR = FRAMES_PER_BEAT * 4;

/* -------------------------------------------------------------------------- */
/*  1. 基础数学                                                                */
/* -------------------------------------------------------------------------- */

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const clamp01 = (v: number): number => clamp(v, 0, 1);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** 把 frame 从 [inStart, inEnd] 映射到 [outStart, outEnd] 并夹紧，不依赖 Remotion 的 interpolate */
export const mapRange = (
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
): number => {
  if (inEnd === inStart) return outStart;
  const t = clamp01((frame - inStart) / (inEnd - inStart));
  return lerp(outStart, outEnd, t);
};

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInCubic = (t: number): number => Math.pow(clamp01(t), 3);
export const easeInOutQuad = (t: number): number => {
  const p = clamp01(t);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
};

/* -------------------------------------------------------------------------- */
/*  2. 鼓点脉冲  getBeatPulse(frame, bpm = 130)                                */
/* -------------------------------------------------------------------------- */

/**
 * 130 BPM 的鼓点脉冲，返回值 0 ~ 1。
 * 形态：每拍起音 2 帧内冲到 1，然后指数衰减到 0，重音拍（每 4 拍一次）更猛。
 *
 * 典型用法：
 *   const pulse = getBeatPulse(frame);
 *   scale = 1 + pulse * 0.08;          // 跟着鼓点呼吸
 */
export const getBeatPulse = (
  frame: number,
  bpm: number = BPM,
  fps: number = FPS
): number => {
  const framesPerBeat = (60 / bpm) * fps;
  const beatFloat = frame / framesPerBeat;
  const beatIndex = Math.floor(beatFloat);
  const phase = beatFloat - beatIndex; // 0 → 1，本拍内的进度

  const attack = Math.min(1, phase / 0.08); // 起音，避免数值从 1 硬切
  const decay = Math.exp(-phase * 5.4); // 衰减，越往后越接近 0
  const accent = beatIndex % 4 === 0 ? 1 : 0.55; // 4/4 的强拍

  return clamp01(attack * decay * accent);
};

/** 当前是第几拍（整数），用于 "每两拍换一次文字" 这类节奏切换 */
export const getBeatIndex = (frame: number, bpm: number = BPM): number =>
  Math.floor(frame / ((60 / bpm) * FPS));

/** 当前拍内进度 0~1 */
export const getBeatPhase = (frame: number, bpm: number = BPM): number => {
  const framesPerBeat = (60 / bpm) * FPS;
  const beatFloat = frame / framesPerBeat;
  return beatFloat - Math.floor(beatFloat);
};

/** 小节内进度 0~1 */
export const getBarPhase = (frame: number, bpm: number = BPM): number => {
  const barFloat = frame / FRAMES_PER_BAR;
  return barFloat - Math.floor(barFloat);
};

/* -------------------------------------------------------------------------- */
/*  3. 确定性伪随机  seededRandom(seed)                                        */
/* -------------------------------------------------------------------------- */

/**
 * 基于正弦函数的确定性随机数，返回 0 ~ 1。
 * 同一个 seed 在任何进程、任何机器上都会得到同一个值 —— 这是不闪烁的唯一保证。
 *
 * 错误示范：Math.random()
 * 正确示范：seededRandom(frame * 13.7 + 42)
 */
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
};

/** 区间随机 */
export const seededRange = (seed: number, min: number, max: number): number =>
  min + seededRandom(seed) * (max - min);

/** -1 ~ 1 的对称抖动，最常用于"偏移量" */
export const seededSign = (seed: number): number => seededRandom(seed) * 2 - 1;

/** 从数组里确定性地挑一个 */
export const seededPick = <T,>(items: readonly T[], seed: number): T => {
  const index = Math.floor(seededRandom(seed) * items.length) % items.length;
  return items[index];
};

/* -------------------------------------------------------------------------- */
/*  4. 文本腐蚀  corruptText(normalText, hiddenText, glitchLevel, frame)       */
/* -------------------------------------------------------------------------- */

/** 乱码符号表（铁律里规定的那一套） */
export const GLITCH_GLYPHS = ["▓", "▒", "░", "█", "▄", "▀", "Ø", "∆"] as const;

export type CorruptKind = "normal" | "glitch" | "hidden";

export type CorruptToken = {
  /** 这一段文字 */
  text: string;
  /** normal = 正常台词，glitch = 乱码，hidden = 底层奥丹·卡里斯的血腥潜意识 */
  kind: CorruptKind;
};

/**
 * corruptText 的分段版本：返回带类型的分片，方便 React 分别上色
 * （正常台词冰蓝、潜意识血红）。
 */
export const corruptTokens = (
  normalText: string,
  hiddenText: string,
  glitchLevel: number,
  frame: number
): CorruptToken[] => {
  const level = clamp01(glitchLevel);
  if (level < 0.02) {
    return normalText.length > 0 ? [{ text: normalText, kind: "normal" }] : [];
  }

  // 乱码以 30Hz 刷新（每 2 帧换一次）。每帧都换会糊成噪点，太慢又不像故障。
  const churn = Math.floor(frame / 2) * 1.6180339;

  const normalChars = Array.from(normalText);
  const hiddenChars = Array.from(hiddenText.trim().length > 0 ? hiddenText : "…");

  // 腐蚀预算：即使 glitchLevel = 1，也保留约 1/4 的字形，
  // 让观众还能从噪点里读出半句原台词 —— 否则 PV 会变成一坨糊。
  const visitable = normalChars.filter(
    (c) => c !== " " && c !== "\n" && c !== "\t"
  ).length;
  let budget = Math.floor(visitable * clamp01(level * 0.7));

  const tokens: CorruptToken[] = [];
  const push = (text: string, kind: CorruptKind) => {
    if (text.length === 0) return;
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind) {
      // 合并同色片段，减少 <span> 数量（渲染 12720 帧时 DOM 越少越快）
      tokens[tokens.length - 1] = { text: last.text + text, kind };
      return;
    }
    tokens.push({ text, kind });
  };

  let i = 0;
  while (i < normalChars.length) {
    const ch = normalChars[i];
    const r1 = seededRandom(churn + i * 3.31);
    const r2 = seededRandom(churn + i * 7.77 + 41.3);
    const r3 = seededRandom(churn + i * 1.13 + 7.7);

    // 空格、换行原样保留，否则整句话结构会散架
    if (ch === " " || ch === "\n" || ch === "\t") {
      push(ch, "normal");
      i += 1;
      continue;
    }

    // 预算用尽 → 后面全部恢复正常（读起来像"闪回一句完整的话"）
    if (budget <= 0) {
      push(ch, "normal");
      i += 1;
      continue;
    }

    // ① 潜意识溢出：从 glitchLevel 0.25 开始，成片段地插入 hiddenText
    const leakChance = level > 0.25 ? (level - 0.25) * 0.3 : 0;
    if (budget > 3 && r1 < leakChance) {
      const maxStart = Math.max(1, hiddenChars.length - 2);
      const start = Math.floor(seededRandom(churn + i * 2.71) * maxStart);
      const len = 2 + Math.floor(r2 * 9);
      push(hiddenChars.slice(start, start + len).join(""), "hidden");
      const eaten = 1 + Math.floor(r3 * 3);
      budget -= eaten;
      i += eaten;
      continue;
    }

    // ② 逐字被乱码吞掉
    const glyphChance = level * 0.52;
    if (r2 < glyphChance) {
      push(seededPick(GLITCH_GLYPHS, churn + i * 5.19), "glitch");
      budget -= 1;
      i += 1;
      continue;
    }

    push(ch, "normal");
    i += 1;
  }

  return tokens;
};

/**
 * 把正常台词按 glitchLevel 比例替换为乱码符号 + 底层血腥台词。
 * glitchLevel = 0    → 原样返回
 * glitchLevel = 0.5  → 一半字被 ▓▒░ 吃掉，偶尔冒出"血"字
 * glitchLevel = 1    → 几乎全是噪点，潜意识台词成句地插进来
 */
export const corruptText = (
  normalText: string,
  hiddenText: string,
  glitchLevel: number,
  frame: number
): string =>
  corruptTokens(normalText, hiddenText, glitchLevel, frame)
    .map((t) => t.text)
    .join("");

/* -------------------------------------------------------------------------- */
/*  5. 打字机 & 终端排版小工具                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 打字机：只显示前 N 个字符，N 由 frame 推进。
 * charsPerSecond 决定说话速度；返回的是"已经显示出来的部分"。
 */
export const typewriter = (
  text: string,
  frame: number,
  startFrame: number,
  charsPerSecond = 34
): string => {
  const elapsed = (frame - startFrame) / FPS;
  if (elapsed <= 0) return "";
  const count = Math.floor(elapsed * charsPerSecond);
  return Array.from(text).slice(0, count).join("");
};

const HEX_TABLE = "0123456789ABCDEF";

/** 0~255 → 两位大写十六进制 */
export const byteHex = (value: number): string => {
  const v = Math.abs(Math.floor(value)) % 256;
  return HEX_TABLE[Math.floor(v / 16)] + HEX_TABLE[v % 16];
};

/** 帧号 → 00:00:07:12 这种时间码，用于面板角标 */
export const toTimecode = (frame: number, fps: number = FPS): string => {
  const totalSeconds = Math.floor(frame / fps);
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const ff = Math.floor(frame % fps);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
};

/** 帧号 → 秒，保留两位，用于调试角标 */
export const toSeconds = (frame: number, fps: number = FPS): string =>
  (frame / fps).toFixed(2);
