# JSON Path Finder

A React-based JSON viewer and path finder tool with a DevTools-style interface. Paste or type JSON on the left, explore it as an interactive tree on the right, and easily copy JSONPath expressions for any node.

## Features

- **Split-panel interface**: JSON editor on the left, tree viewer on the right
- **Syntax highlighting**: Color-coded JSON in the editor
- **Interactive tree view**: Expand/collapse nodes with click
- **JSONPath generation**: Click any node to get its path
- **Path notation options**: Switch between bracket (`$['key']`) and dot (`$.key`) notation
- **Beautify & Minify**: Format or compress JSON with one click
- **Sample data**: Load example JSON to try out the tool
- **Expand/Collapse all**: Quick buttons to expand or collapse the entire tree
- **Large JSON handling**: Performance optimizations for large files with configurable thresholds
- **Configurable settings**: Adjust default expansion depth and warning thresholds
- **Responsive design**: Works on desktop and mobile
- **Copy to clipboard**: One-click copy of selected paths

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Output

Production builds are output to the `docs/` folder with relative asset paths, making it ready for GitHub Pages deployment.

## Usage

1. **Paste JSON** into the left panel, or click "Sample" to load example data
2. **Click "Beautify"** to format the JSON with proper indentation
3. **Explore the tree** on the right panel - click arrows to expand/collapse nodes
4. **Click any node** to select it and see its path in the Path field
5. **Choose notation** using the dropdown (bracket or dot notation)
6. **Copy the path** using the Copy button

## Settings

Click the gear icon in the top-right corner to configure:

- **Default Expansion Depth**: How many levels to auto-expand (0 = all collapsed, higher = more expanded)
- **Large JSON Warning Threshold**: Node count that triggers the "large JSON" warning banner

Settings are persisted in localStorage.

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Project Structure

```
src/
├── components/
│   ├── JsonEditor.jsx      # Left panel - JSON input editor
│   ├── JsonTreeViewer.jsx  # Right panel - Interactive tree view
│   └── SettingsModal.jsx   # Settings configuration modal
├── hooks/
│   └── useDebounce.js      # Debounce hook for performance
├── App.jsx                 # Main application component
├── main.jsx                # Entry point
└── index.css               # Global styles with Tailwind
```

## License

MIT
