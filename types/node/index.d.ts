// Minimal Node.js type stubs for JS tooling.
// Prefer installing @types/node for full typing.

declare const __dirname: string;
declare const __filename: string;

declare function require(path: string): any;

declare const process: {
  env: Record<string, string | undefined>;
  cwd?: () => string;
  platform?: string;
  argv?: string[];
};
