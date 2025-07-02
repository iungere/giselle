// Ambient module declaration for @giselle-sdk/data-type during local development
// This enables IDE type resolution without building the package first.

declare module "@giselle-sdk/data-type" {
  const content: any;
  export = content;
}