/**
 * ============================================================================
 *  src/data/palette.ts  —  三色叙事系统（铁律 3）
 * ============================================================================
 *  冰蓝 #00E5FF  →  中枢奥迪斯 / 日常、冷静、系统自检
 *  耀金 #D4AF37  →  奥罗金帝国 / 巴拉斯、仪式、审判
 *  血红 #FF0033  →  骨骸野兽奥丹·卡里斯 / 暴走、血腥潜意识
 * ============================================================================
 */

export const PALETTE = {
  /** 中枢奥迪斯：冰蓝 */
  ordis: {
    core: "#00E5FF",
    soft: "#8FF6FF",
    dim: "#0A7F8E",
  },
  /** 奥罗金 / 巴拉斯：耀金 */
  orokin: {
    core: "#D4AF37",
    soft: "#F5E39B",
    dim: "#7A6320",
  },
  /** 奥丹·卡里斯：赤毒血红 */
  karris: {
    core: "#FF0033",
    soft: "#FF7288",
    dim: "#8A0019",
  },
  /** 虚无底色 */
  void: {
    bg: "#04070B",
    panel: "#060C13",
    line: "#0E2230",
    ink: "#C9E8EF",
    mute: "#4E7180",
  },
} as const;

/**
 * 把 #RRGGBB / #RGB / rgb(r,g,b) / rgba(r,g,b,a) 统一转成 [r, g, b]。
 * 注意：mixHex() 的返回值是 rgb(...) 字符串，之后还会继续被 rgba() 消费，
 * 所以这里必须同时支持两种写法（否则 parseInt('rgb(...)', 16) = NaN，
 * NaN >> 16 = 0，整段文字会悄悄变成纯黑 —— 这个坑踩过一次）。
 */
export const hexToRgb = (color: string): [number, number, number] => {
  const value = color.trim();

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((p) => parseFloat(p));
    return [
      Math.min(255, Math.max(0, Math.round(parts[0] || 0))),
      Math.min(255, Math.max(0, Math.round(parts[1] || 0))),
      Math.min(255, Math.max(0, Math.round(parts[2] || 0))),
    ];
  }

  const raw = value.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const channelToHex = (v: number): string =>
  Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, "0");

/** [r, g, b] → #rrggbb */
export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;

/** 两种颜色之间的线性插值，t = 0 取 a，t = 1 取 b —— 用于冰蓝 ⇄ 血红的人格切换 */
export const mixHex = (a: string, b: string, t: number): string => {
  const p = Math.min(1, Math.max(0, t));
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * p, ag + (bg - ag) * p, ab + (bb - ab) * p);
};

/** 带透明度的 rgb 字符串，颜色与 alpha 都由 frame 决定 */
export const rgba = (color: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`;
};
