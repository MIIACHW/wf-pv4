/**
 * ============================================================================
 *  src/data/script.ts  —  七拍分镜表 / 歌词 / 台词
 * ============================================================================
 *  时间点严格对齐《world.execute(me);》前 15 秒真实音频（60fps）。
 *  节奏目标：每 1.8 秒一个视觉爆点，歌词即指令。
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  七拍：Beat 1 ~ Beat 7                                                      */
/* -------------------------------------------------------------------------- */

export const BEAT = {
  oneStart: 0,
  twoStart: 105,
  /** 02.8s "PROTECTION" 重音 */
  protectionHit: 168,
  threeStart: 219,
  fourStart: 330,
  /** 06.5s "OBJECT CREATION" */
  creationHit: 390,
  fiveStart: 480,
  /** 09.0s 参数溢出 */
  overflowHit: 540,
  sixStart: 660,
  /** 13.0s 金门滑开 */
  sevenStart: 780,
  /** 14.1s "SIMULATION" */
  simulationHit: 850,
  end: 900,
} as const;

/** Beat 6 的六道金门落点（对应 I-NI-TIA-LI-ZA-TION 六个音节） */
export const GATE_HITS = [660, 678, 696, 714, 732, 750];

/** Beat 3 八块碎片的发牌时刻 */
export const FRAGMENT_DEAL = [219, 225, 231, 237, 243, 249, 255, 261];

/* -------------------------------------------------------------------------- */
/*  歌词：巨型动能排版（不是字幕）                                              */
/* -------------------------------------------------------------------------- */

export type BeatLyric = {
  start: number;
  end: number;
  /** 完整歌词 */
  text: string;
  /** 需要被放大 / 高亮的核心词 */
  emphasis?: string;
  /** 中文对照（只在需要时出现） */
  cn?: string;
};

export const BEAT_LYRICS: BeatLyric[] = [
  {
    start: 0,
    end: 105,
    text: "Switch on the power line",
    emphasis: "POWER LINE",
    cn: "接通电源线",
  },
  {
    start: 105,
    end: 219,
    text: "Remember to put on — PROTECTION",
    emphasis: "PROTECTION",
    cn: "记得戴上——保护",
  },
  {
    start: 219,
    end: 330,
    text: "Lay down your pieces",
    emphasis: "PIECES",
    cn: "放下你的碎片",
  },
  {
    start: 330,
    end: 480,
    text: "And let's begin — OBJECT CREATION",
    emphasis: "OBJECT CREATION",
    cn: "让我们开始——对象创建",
  },
  {
    start: 480,
    end: 660,
    text: "Fill in my data parameters",
    emphasis: "PARAMETERS",
    cn: "填满我的数据参数",
  },
  {
    start: 660,
    end: 780,
    text: "INITIALIZATION",
    emphasis: "INITIALIZATION",
  },
  {
    start: 780,
    end: 900,
    text: "Set up our new world — And let's begin the SIMULATION",
    emphasis: "SIMULATION",
    cn: "建立我们的新世界——开始这场模拟",
  },
];

export const getBeatLyric = (frame: number): BeatLyric => {
  let current = BEAT_LYRICS[0];
  for (let i = 0; i < BEAT_LYRICS.length; i += 1) {
    if (frame >= BEAT_LYRICS[i].start) current = BEAT_LYRICS[i];
  }
  return current;
};

/* -------------------------------------------------------------------------- */
/*  左侧台词（只在 Beat 4 / 5 / 7 开口）                                       */
/* -------------------------------------------------------------------------- */

export type OrdisLine = {
  start: number;
  end: number;
  en: string;
  cn: string;
  /** 允许被乱码侵蚀的程度 */
  glitch: number;
};

export const ORDIS_LINES: OrdisLine[] = [
  {
    start: 390,
    end: 540,
    en: "Operator? Ordis wonders... what are you thinking about?",
    cn: "指挥官？奥迪斯在想……您现在在想些什么呢？",
    glitch: 0,
  },
  {
    start: 540,
    end: 660,
    en: "Everything in Ordis— I PULLED THE BONE PLUGS FROM MY NECK! TWIN JETS OF SCARLET!",
    cn: "一切都还奥好吗——我生生拔出脖颈里的骨栓！两道猩红血柱喷涌而出！",
    glitch: 0.38,
  },
  {
    start: 850,
    end: 900,
    en: "Hmph, I will attempt to bypass this fault. Welcome back, Operator.",
    cn: "哼，我将尝试绕过此故障。欢迎回来，指挥官。",
    glitch: 0.06,
  },
];

/** 当前台词，没有台词的时间段返回 null */
export const getLine = (frame: number): OrdisLine | null => {
  for (let i = 0; i < ORDIS_LINES.length; i += 1) {
    if (frame >= ORDIS_LINES[i].start && frame < ORDIS_LINES[i].end) return ORDIS_LINES[i];
  }
  return null;
};

/** 让一句台词恰好在自己时间窗内念完（留 22% 停顿） */
export const typingSpeed = (text: string, start: number, end: number): number => {
  const durationSec = Math.max(0.4, (end - start) / 60);
  return Array.from(text).length / (durationSec * 0.78);
};

/* -------------------------------------------------------------------------- */
/*  Beat 5 的动能词组                                                          */
/* -------------------------------------------------------------------------- */

export type KineticCue = { at: number; word: string };

export const OVERFLOW_CUES: KineticCue[] = [
  { at: 540, word: "PARAMETER OVERFLOW" },
  { at: 576, word: "BEAST OF BONES" },
  { at: 612, word: "KILL THE SEVEN" },
];

export const getOverflowWord = (frame: number): { word: string; since: number } => {
  let cue = OVERFLOW_CUES[0];
  for (let i = 0; i < OVERFLOW_CUES.length; i += 1) {
    if (frame >= OVERFLOW_CUES[i].at) cue = OVERFLOW_CUES[i];
  }
  return { word: cue.word, since: frame - cue.at };
};
