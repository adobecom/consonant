# Adobe Clean Display Font

The Product Lockup component requires the **Adobe Clean Display** font (Black weight, 900) to match the Figma design specifications.

## Font Files Required

Place the following font files in this directory:

- `AdobeCleanDisplay-Black.woff2` (primary format)
- `AdobeCleanDisplay-Black.woff` (fallback format)

## Obtaining the Font

Adobe Clean Display is a restricted corporate font. Here are the ways to obtain it:

### ⚠️ Important: Adobe Clean Display is NOT Available Publicly

**Adobe Clean Display is NOT available on the public Adobe Fonts website.**

It is a **restricted corporate font** only available to:

- **Adobe employees** (through internal resources)
- Organizations with special enterprise licensing

**Current Solution**: The component uses **Inter** (loaded via Google Fonts) as a fallback, which is visually similar and freely available.

### Option 0: Internal Adobe Resources (If You're an Adobe Employee)

If you're an Adobe employee and have `ADOBE_FONTS_API` in your `.env`:

1. **Check internal design system repositories** (like [Milo](https://github.com/adobecom/milo))
   - Milo and other Adobe projects typically load fonts via Typekit embed codes
   - Look for `use.typekit.net` references in HTML/CSS files
   - Check for internal Typekit kit IDs used by Adobe projects

2. **Contact your design system team** for:
   - Internal Typekit kit ID (commonly used across Adobe projects)
   - Font file distribution
   - Internal font CDN URLs

3. **Check existing Adobe projects** for font loading patterns:
   - Search for `use.typekit.net` in Milo or other Adobe repos
   - Look for common Typekit kit IDs used internally
   - Check HTML head sections for font embed codes

4. **Add internal font to `.storybook/preview.js`**:
   ```javascript
   import "https://use.typekit.net/[INTERNAL_KIT_ID].css";
   ```

### Option 1: Adobe Fonts (Creative Cloud)

1. **Log into Adobe Fonts**:
   - Go to [fonts.adobe.com](https://fonts.adobe.com)
   - Sign in with your Adobe account
   - Search for "Adobe Clean Display"

2. **If available**:
   - Add it to your web project
   - Use the provided embed code (if web font license is available)
   - Or download for desktop use if licensed

### Option 2: Creative Cloud Desktop App

1. **Open Creative Cloud Desktop App**
2. **Go to Fonts section**
3. **Search for "Adobe Clean Display"**
4. **If available, click "Install Family"** to install to your system
5. **Convert installed font to WOFF2** (see conversion instructions below)

### Option 3: Internal Adobe Resources

1. **If you're an Adobe employee**:
   - Check internal design system repositories
   - Contact your design system team
   - Check internal font distribution channels (e.g., Adobe Fonts internal library)

2. **If you have an Adobe enterprise license**:
   - Contact your Adobe representative
   - Check your enterprise font library
   - Request web font files from Adobe support

### Option 4: Convert from Installed Font

If you have Adobe Clean Display installed on your system (TTF/OTF), you can convert it to WOFF2:

1. **Find the font file**:

   ```bash
   # macOS
   /Library/Fonts/AdobeCleanDisplay-Black.otf
   # or
   ~/Library/Fonts/AdobeCleanDisplay-Black.otf
   ```

2. **Convert to WOFF2** using online tools or command line:
   - Use [CloudConvert](https://cloudconvert.com/otf-to-woff2) or similar
   - Or use `woff2_compress` tool if installed:
     ```bash
     woff2_compress AdobeCleanDisplay-Black.otf
     ```

3. **Place converted files** in this directory

## Font Loading

The font is loaded via `@font-face` in `product-lockup.css`. Once you place the font files in this directory, uncomment the `@font-face` declaration in `product-lockup.css` (lines 76-85).

If the font files are not present, the component will gracefully fall back to system fonts (Inter, SF Pro Display, or system sans-serif).
