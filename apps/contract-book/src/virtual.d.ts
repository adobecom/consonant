// The repo, bundled by vite-plugin-s2a-data.mjs. Shape is whatever is on disk;
// the engine modules are untyped .mjs, so `any` here is honest rather than lazy.
declare module "virtual:s2a-data" {
  interface S2AComponent {
    slug: string;
    name: string;
    contracted: boolean;
    defs: any;
    figma: any;
    code: any;
    contract: any;
    hasCode: boolean;
    /** Which design system the component belongs to ("s2a", "spectrum"), and its label. */
    system?: string;
    systemLabel?: string;
    /** Set on a component registered from a Figma extraction and not (yet) on disk. */
    draft?: boolean;
  }
  const data: {
    components: S2AComponent[];
    tokenFiles: Record<string, Record<string, string>>;
    tokenFilesBySystem?: Record<string, Record<string, Record<string, string>>>;
    tokenNsBySystem?: Record<string, string>;
    /** Storybook's title for each system's stories ("Generated", "Spectrum"). */
    storybookTitleBySystem?: Record<string, string>;
    assets: Record<string, any>;
    schemas: { defs: any; contract: any };
    capturedAt: string;
  };
  export default data;
}

/** True in the GitHub Pages build: data baked in, no dev-server endpoints. Set in vite.config.ts. */
declare const __BOOK_STATIC__: boolean;
