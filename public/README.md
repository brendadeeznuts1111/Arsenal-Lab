# Arsenal Lab - Standalone HTML Preview

This directory contains static HTML previews of Arsenal Lab components.

## Files

- **`arsenal-lab.html`** - Complete standalone HTML preview of Arsenal Lab
  - GitHub-style dark theme
  - Overview of all arsenal features
  - Navigation to full interactive experience
  - No Bun installation required

- **`build-config-vanilla.html`** - Vanilla JavaScript implementation of Build Configuration Arsenal
  - Interactive bundler configuration
  - Code generation and copying
  - Dark/light theme toggle

## Usage

### Quick Preview
```bash
# Open directly in browser (no server needed)
open arsenal-lab.html
```

### With Local Server
```bash
# If you want to serve these files
python -m http.server 8000
# Visit http://localhost:8000/arsenal-lab.html
```

## Features

### Arsenal Lab HTML Preview
- **Complete UI** - Header, navigation, content areas
- **All Arsenal Tabs** - Performance, Testing, Database, Build Config, etc.
- **GitHub Integration** - Direct links to repository, docs, issues
- **Responsive Design** - Works on desktop and mobile
- **Dark Theme** - GitHub-style professional appearance

### Build Config Vanilla
- **Full Functionality** - All Bun bundler options
- **Interactive Controls** - Checkboxes, dropdowns, inputs
- **Code Generation** - Live Bun.build() code updates
- **Copy to Clipboard** - Easy code sharing
- **Theme Toggle** - Light/dark mode switching

## Integration

These HTML files serve as:
- **Quick previews** for users without Bun installed
- **Documentation examples** showing UI/UX
- **Fallback demos** when runtime isn't available
- **Marketing materials** for the project

## Development

To update these HTML files:
1. Make changes to the React components in `../components/`
2. Export HTML from the running application
3. Update links and styling as needed
4. Test in multiple browsers

---

**For the full interactive experience with live performance monitoring:**
```bash
cd ..
bun run dev
```

Visit [http://localhost:3655](http://localhost:3655) for the complete Arsenal Lab experience! 🚀
