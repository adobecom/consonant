# Finding Font Sources in Milo

Based on the [Milo repository](https://github.com/adobecom/milo), fonts are **not** listed in `package.json`, which means they're loaded via:

## Where to Look in Milo

### 1. HTML Templates / Head Sections
Search for Typekit embed codes:
```bash
# In Milo repo
grep -r "use.typekit.net" .
grep -r "typekit" .
grep -r "fonts.adobe.com" .
```

### 2. CSS Files
Look for `@font-face` or `@import` statements:
```bash
grep -r "@font-face" .
grep -r "@import.*typekit" .
grep -r "Adobe Clean" .
```

### 3. Common Locations
- `libs/styles/*.css` - Main stylesheets
- `libs/blocks/**/*.css` - Block-specific styles
- HTML templates or base layouts
- Build scripts that inject font links

### 4. Typical Pattern
Milo likely uses a Typekit embed code like:
```html
<link rel="stylesheet" href="https://use.typekit.net/[KIT_ID].css">
```

Or in CSS:
```css
@import url("https://use.typekit.net/[KIT_ID].css");
```

## Next Steps

1. **Clone or browse Milo repo**:
   ```bash
   git clone https://github.com/adobecom/milo.git
   cd milo
   ```

2. **Search for Typekit references**:
   ```bash
   grep -r "use.typekit.net" . --include="*.html" --include="*.css" --include="*.js"
   ```

3. **Check for common Adobe Typekit kit IDs** used internally

4. **Once you find the kit ID**, add it to `.storybook/preview.js`:
   ```javascript
   import "https://use.typekit.net/[FOUND_KIT_ID].css";
   ```

## Alternative: Check Browser DevTools

If you have access to a Milo site:
1. Open browser DevTools → Network tab
2. Filter by "Font" or "CSS"
3. Look for requests to `use.typekit.net` or `fonts.adobe.com`
4. The kit ID will be in the URL
