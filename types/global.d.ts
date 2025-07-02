// Re-export zod as zod/v4 (some packages use this import path)
declare module "zod/v4" {
  export * from "zod";
}

declare module "zod" {
  // Minimal stub of zod types to satisfy TypeScript when the real library is not installed.
  // Replace with actual types by installing `zod` if full type safety is required.
  export type ZodType<T = unknown> = any;
  export const z: any;
  export default z;
}

// Provide minimal stubs so the root package names resolve during local builds
// before each package is compiled to its declaration output. The actual types
// are resolved through the `paths` mapping added in tsconfig.