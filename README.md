# CS1710 Final Project: Unicode Data Story

This repository contains an interactive, scroll-driven data story exploring ASCII, Unicode, global scripts, and emoji usage over time. The project is built with HTML, CSS, JavaScript, and D3.js, supported by multiple datasets stored locally.

## 1. Visualization Summary:
- ASCII typing simulator
- Encoding timeline
- ASCII frequency visualization
- Unicode Sankey diagram
- Emoji popularity explorer
- Script universe explorer
- Unicode distribution charts
- Team + resources page
- Dot indicators on the right side
    + Click dots to jump to sections
    + Scroll with mouse wheel to navigate between sections
    + Smooth scroll-snap behavior

## 2. How to Run the Project
(No build tools or backend server are required.)
### a. Option 1 — Run locally by opening the file
- Clone or download this repository.
- Open index.html in any modern browser (Chrome, Firefox, Edge, Safari).
- Make sure the folder structure stays exactly the same:
```
cs-1710-unicode/
│
├── index.html
├── css/
├── js/
├── data/
└── fonts/
```
Important: Do not move files between folders.
All data is loaded using relative paths (e.g., /data/...csv, /css/styles.css).

### b. Option 2 — Serve with a lightweight local server (recommended for Chrome)
- Chrome blocks some local file access for security. If some datasets do not load, run:
    + Python 3
    + python3 -m http.server 8000
- Then visit:
http://localhost:8000
- Node (http-server)
```
npx http-server
```
- VS Code Live Server
    + Install the Live Server extension
    + Right-click index.html → Open with Live Server

## 3. Project Structure
```
cs-1710-unicode/
│
├── ABOUT_DATA.md         # Dataset documentation
│
├── index.html            # Main page containing all section structure
│
├── css/
│   └── styles.css        # Full UI system, layout, animations, and component styling
│
├── js/
│   └── main.js           # All interactive logic + D3 visualizations
│
├── data/                 # CSV/JSON datasets used throughout the story
│   ├── ascii_freq.json
│   ├── emoji_all.csv
│   ├── emoji_us.csv
│   ├── emoji_uk.csv
│   ├── unicode_growth.csv
│   ├── unicode_languages.csv
│   ├── unicode_version.csv
│   └── unicode_character_info.csv
│
└── fonts/
    └── GeneralSans-Variable.ttf
```

## 4. External Libraries Used
All libraries are loaded via CDN in index.html:
### D3.js (v7):
- For all visualizations (bar chart, timeline, force layout, treemaps, sunburst, etc.)
<script src="https://d3js.org/d3.v7.min.js"></script>

### D3-Sankey:
- For the Unicode growth Sankey diagram:
<script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>

### TopoJSON
- Used to render the world map for script geographic regions:
<script src="https://unpkg.com/topojson-client@3"></script>

### Custom Fonts
- Stored in /fonts and loaded in styles.css using @font-face.

## 5. Data Sources
- ASCII character frequencies
- Emoji usage across regions (Global, US, UK)
- Unicode version history (1991–2025)
- Unicode script metadata (languages, categories, counts)
- Full Unicode character database (~150k entries)
- CSV/JSON files are read using d3.csv() and d3.json() inside main.js.

## 6. Main JavaScript Responsibilities (js/main.js)
- Loader animation (ASCII Yang)
- Scroll-snap navigation + dot indicators
- Quiz logic (ASCII & Emoji quizzes)
- ASCII typing simulator
- D3 ASCII frequency bar chart
- Timeline generation & card switching
- Unicode Sankey diagram + slider
- Emoji force-layout visualization + tooltips
- Unicode Universe script explorer (search, maps, character samples)
- Treemap / bar chart / sunburst switching
- Responsive layout adjustments

## 7. Browser Compatibility
Supported: Chrome, Firefox, Safari, Edge
If data fails to load in Chrome, run via a small local server (see top).

## 8. Customization
To change the theme colors, edit the CSS variables in `css/styles.css`:
```css
:root {
    --bg-color: #3d4549;  /* Main background */
    --text-color: #a3b1b9; /* Secondary text */
    --text-bright: #ffffff; /* Primary text */
    /* ... other colors */
```

## 9. Authors
- Chi Le — Harvard College ’28
- Rain YeYang — Harvard College ’27
<br>
Built for CS171: Visualization, Fall 2025.