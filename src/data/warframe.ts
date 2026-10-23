/**
 * ============================================================================
 *  src/data/warframe.ts  —  《Warframe》官方数据（唯一数据源）
 * ============================================================================
 *  铁律：画面里出现的专有名词、台词、星图节点、模块名，全部从这里取。
 *  禁止在组件里手写任何"看起来像 Warframe 但其实是编的"文本。
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  始源星系导航星图（NAVIGATION: ORIGIN SYSTEM）                              */
/* -------------------------------------------------------------------------- */

export type Faction = "GRINEER" | "CORPUS" | "OROKIN" | "INFESTED" | "CORRUPTED";

/** 派系官方配色 */
export const FACTION_COLOR: Record<Faction, string> = {
  GRINEER: "#E0A33E",
  CORPUS: "#59C8E8",
  OROKIN: "#D4AF37",
  INFESTED: "#9AD14B",
  CORRUPTED: "#B07CFF",
};

export type NavNode = {
  id: string;
  /** 官方名称 */
  name: string;
  /** 中文名 */
  cn: string;
  faction: Faction;
  /** 星图坐标（viewBox 1000 × 760） */
  x: number;
  y: number;
};

/**
 * 路线顺序即数组顺序：TERRA → VENUS → LUA → MARS → DEIMOS → CERES →
 * SATURN → URANUS → VOID → KUVA FORTRESS
 */
export const NAV_NODES: NavNode[] = [
  { id: "terra", name: "TERRA (EARTH)", cn: "地球", faction: "GRINEER", x: 140, y: 560 },
  { id: "venus", name: "VENUS", cn: "金星", faction: "CORPUS", x: 250, y: 612 },
  { id: "lua", name: "LUA", cn: "月球", faction: "OROKIN", x: 252, y: 428 },
  { id: "mars", name: "MARS", cn: "火星", faction: "GRINEER", x: 372, y: 492 },
  { id: "deimos", name: "DEIMOS", cn: "火卫二", faction: "INFESTED", x: 452, y: 330 },
  { id: "ceres", name: "CERES", cn: "谷神星", faction: "GRINEER", x: 562, y: 402 },
  { id: "saturn", name: "SATURN", cn: "土星", faction: "GRINEER", x: 664, y: 280 },
  { id: "uranus", name: "URANUS", cn: "天王星", faction: "GRINEER", x: 776, y: 352 },
  { id: "void", name: "VOID", cn: "虚空", faction: "CORRUPTED", x: 822, y: 190 },
  { id: "kuva", name: "KUVA FORTRESS", cn: "赤毒要塞", faction: "GRINEER", x: 640, y: 132 },
];

/* -------------------------------------------------------------------------- */
/*  轨道飞行器模块（Orbiter Modules）                                          */
/* -------------------------------------------------------------------------- */

export type OrbiterModule = {
  name: string;
  cn: string;
  value: string;
  progress: number;
  /** 高危模块（赤毒 / 虚空相关）用红色 */
  danger?: boolean;
};

export const ORBITER_MODULES: OrbiterModule[] = [
  {
    name: "FOUNDRY",
    cn: "铸造厂",
    value: "FORMA BLUEPRINT [23h 59m]",
    progress: 0.86,
  },
  {
    name: "ARSENAL",
    cn: "军械库",
    value: "WARFRAME_LINK_ACTIVE",
    progress: 1,
  },
  {
    name: "HELMINTH INFIRMARY",
    cn: "赫敏斯医务室",
    value: "BIOMASS 94%",
    progress: 0.94,
  },
  {
    name: "VOID RELIC REFINERY",
    cn: "虚空遗物精炼",
    value: "RADIANT [光辉]",
    progress: 1,
  },
  {
    name: "NIGHTWAVE",
    cn: "午夜电波",
    value: "NORA NIGHT SIGNAL DETECTED",
    progress: 0.42,
    danger: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  中枢碎片（Cephalon Fragments）—— 奥丹·卡里斯官方独白                       */
/* -------------------------------------------------------------------------- */

export type CephalonFragment = {
  title: string;
  en: string;
  cn: string;
};

export const CEPHALON_FRAGMENTS: CephalonFragment[] = [
  {
    title: "CEPHALON_FRAGMENT // OROKIN_ARCHIVE_04",
    en: "Ballas offered me the red vial: Kuva. Immortality of the Gods.",
    cn: "巴拉斯向我递出红色小瓶：赤毒。神明的永生。",
  },
  {
    title: "ANATOMY_ALERT // BONE_PLUGS_EXTRACTED",
    en: "Carotid arteries severed. Orokin guards eliminated.",
    cn: "颈动脉撕裂。奥罗金禁卫已全歼。",
  },
  {
    title: "EXECUTOR_BALLAS // GLASSING_PROTOCOL",
    en: "Your warrior's death is denied, Ordan Karris.",
    cn: "你身为战士的死志被驳回了，奥丹·卡里斯。",
  },
];

/** 背景动能大字（官方考据名词） */
export const KINETIC_WORDS = ["BEAST OF BONES", "THE SEVEN", "RED IMMORTALITY", "KUVA"] as const;

/** 碎片标签 */
export const FRAGMENT_TAGS = ["OROKIN_ARCHIVE_04", "THE SEVEN", "RED IMMORTALITY", "KUVA"];

/* -------------------------------------------------------------------------- */
/*  巴拉斯中枢编织网重构 —— 清除日志                                           */
/* -------------------------------------------------------------------------- */

export const PURGE_LOGS = [
  "> purging /cephalon_weave/ordan_karris/bone_plugs.mem ... [ERASED]",
  "> purging /cephalon_weave/orokin_hall_massacre.mem ... [ERASED]",
  "> locking /precepts/operator_loyalty_override ... [100% LOCKED]",
  '> restoring_cephalon_persona: "ORDIS" ... [NOMINAL]',
];

/** 镇压面板上被逐条封印的记忆节点（与上面的日志一一对应） */
export const PURGE_TARGETS = [
  { path: "/cephalon_weave/ordan_karris/bone_plugs.mem", state: "ERASED", at: 0.08 },
  { path: "/cephalon_weave/orokin_hall_massacre.mem", state: "ERASED", at: 0.28 },
  { path: "/precepts/operator_loyalty_override", state: "100% LOCKED", at: 0.54 },
  { path: 'restoring_cephalon_persona: "ORDIS"', state: "NOMINAL", at: 0.78 },
];

/* -------------------------------------------------------------------------- */
/*  Beat 3：八块中枢记忆碎片                                                    */
/* -------------------------------------------------------------------------- */

export const FRAGMENT_CARDS = [
  { id: "FRAGMENT_01", label: "BONE_PLUGS" },
  { id: "FRAGMENT_02", label: "CARMINE_MASSACRE" },
  { id: "FRAGMENT_03", label: "RED_KUVA" },
  { id: "FRAGMENT_04", label: "BALLAS_LAUGHTER" },
  { id: "FRAGMENT_05", label: "OROKIN_HALL" },
  { id: "FRAGMENT_06", label: "THE_SEVEN" },
  { id: "FRAGMENT_07", label: "TWIN_JETS" },
  { id: "FRAGMENT_08", label: "GLASSING" },
];

/* -------------------------------------------------------------------------- */
/*  Beat 5：数据参数通道                                                        */
/* -------------------------------------------------------------------------- */

export const PARAM_SLIDERS = [
  "FOUNDRY_SYNC",
  "VOID_RELIC_DB",
  "ARSENAL_LINK",
  "HELMINTH_BIOMASS",
  "NIGHTWAVE_FEED",
  "ORBITER_NAV",
  "PRECEPT_44",
  "CEPHALON_WEAVE",
  "KUVA_TRACE",
  "GLASSING_LOCK",
  "OPERATOR_LINK",
  "SIMULATION_SEED",
];

/* -------------------------------------------------------------------------- */
/*  Beat 4：实例化代码                                                          */
/* -------------------------------------------------------------------------- */

export const ORDIS_CLASS_CODE: { text: string; kind: "kw" | "str" | "com" | "plain" }[] = [
  { text: "class Cephalon_Ordis extends OrokinServant {", kind: "kw" },
  { text: '  source: "BEAST_OF_BONES"; // [REDACTED]', kind: "str" },
  { text: "  loyaltyToOperator: Infinity;", kind: "plain" },
  { text: '  voiceModule: "CHEERFUL_BUT_CRACKED";', kind: "str" },
  { text: "}", kind: "kw" },
];
