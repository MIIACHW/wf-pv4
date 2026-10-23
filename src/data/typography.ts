/**
 * 全局等宽 / 无衬线字体栈。
 * 只用系统字体，避免渲染时去下载 webfont（headless 环境里会等到超时）。
 */
export const MONO =
  '"JetBrains Mono", "Cascadia Mono", "Consolas", "Menlo", "Microsoft YaHei", monospace';

export const SANS =
  '"Inter", "HarmonyOS Sans SC", "Microsoft YaHei", "Segoe UI", sans-serif';
