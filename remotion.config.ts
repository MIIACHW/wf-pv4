import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

/**
 * Remotion 全局渲染配置
 * 注意：本项目的所有画面都必须由 frame 决定，
 * 所以这里开启多进程渲染也不会出现"每个进程画面不一样"的闪烁。
 */
Config.setEntryPoint("src/index.ts");

// 中间帧用 jpeg，速度快；最终 MP4 仍是 h264
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// 正式渲染输出位置
Config.setOutputLocation("out/ordis-pv.mp4");

// 在 headless Chrome 里用 ANGLE 渲染，SVG 滤镜 / 混合模式更稳定
Config.setChromiumOpenGlRenderer("angle");

/**
 * 浏览器内核解析
 * ---------------------------------------------------------------------------
 * Remotion 默认会去 storage.googleapis.com 下载 Chrome Headless Shell（约 120MB）。
 * 国内网络下这一步经常被阻断（ENOTFOUND），所以这里优先复用本机已安装的
 * Chrome / Edge，直接把它的路径交给 Remotion。
 *
 * 想强制用 Headless Shell，只要把环境变量 REMOTION_BROWSER_EXECUTABLE 设成
 * 对应可执行文件路径即可（优先级最高）。
 */
const BROWSER_CANDIDATES: string[] = [
  process.env.REMOTION_BROWSER_EXECUTABLE ?? "",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const localBrowser = BROWSER_CANDIDATES.find((candidate) => {
  return candidate.length > 0 && existsSync(candidate);
});

if (localBrowser) {
  Config.setBrowserExecutable(localBrowser);
}
