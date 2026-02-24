# Figma Plugin Boilerplate

A minimal, generic Figma plugin template to get you started quickly.

## Structure

```
apps/figma-plugin-boilerplate/
├── manifest.json      # Plugin manifest (update name, id, etc.)
├── package.json       # Package metadata
├── project.json       # Nx project configuration
├── scripts/
│   └── build.mjs      # Build script using esbuild
└── src/
    ├── code.ts        # Main plugin code (runs in Figma sandbox)
    └── ui.html        # Plugin UI (runs in iframe)
```

## Getting Started

1. **Update the manifest**: Edit `manifest.json` and set your plugin name and ID
2. **Customize the code**: Modify `src/code.ts` and `src/ui.html` for your plugin logic
3. **Build**: Run `nx build figma-plugin-boilerplate`
4. **Package**: Run `nx package figma-plugin-boilerplate` to create a zip file

## Development

The boilerplate includes:
- Basic UI with a simple example (create rectangle button)
- Message passing between UI and plugin code
- Minimal styling (dark/light mode support)
- esbuild configuration for bundling

## Next Steps

- Add your plugin logic in `src/code.ts`
- Customize the UI in `src/ui.html`
- Add any additional dependencies in `package.json`
- Update the build script if you need additional loaders or configurations
