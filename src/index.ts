import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

/**
 * Remotion 的入口文件。
 * package.json 里没有 "main"，Remotion CLI 会自动找 src/index.ts 并调用 registerRoot。
 */
registerRoot(RemotionRoot);
