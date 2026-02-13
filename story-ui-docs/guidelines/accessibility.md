# Accessibility Guidelines

- All stories must pass Storybook a11y checks (`expect(canvasElement).toBeAccessible()`).
- Maintain 3:1 contrast for disabled controls (even disabled buttons use semantic tokens that meet contrast).
- Ensure buttons use our `Button` component so focus states/ARIA props are consistent.
