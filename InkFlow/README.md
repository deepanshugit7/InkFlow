 InkFlow — Real-Time Markdown Editor

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

I've always found Markdown editors to be either too minimal (plain textarea, nothing else) or way too bloated (Electron apps, gigantic dependencies, subscription paywalls). I wanted something in between — a proper editor that feels polished and fast, runs entirely in the browser, and doesn't need a single npm package to work.

So I built InkFlow from scratch. It's a real-time Markdown editor with a live split-pane preview, a custom Markdown parser I wrote myself, multi-tab document support, a command palette, find & replace, version history, and four export formats. No frameworks. No build step. Just a browser tab.

## What it does

Open the app and you're immediately in a split-pane workspace — raw Markdown on the left, beautiful rendered output on the right, updating live as you type.

### The Editor
- **Line numbers** alongside your text so you always know where you are
- **Syntax-aware toolbar** for headings (H1/H2/H3), bold, italic, strikethrough, inline code, code blocks, blockquotes, bullet lists, numbered lists, task checklists, links, images, tables, horizontal rules, and emojis
- **All the keyboard shortcuts** you'd expect: `Ctrl+B` for bold, `Ctrl+I` for italic, `Ctrl+K` for links, `Ctrl+F` for find & replace, `Ctrl+P` for the command palette — it feels like a real editor
- **Adjustable font size** (A- / A+ buttons) so you can make the text as comfortable as you want
- **Drag & drop** — just drop a `.md` file anywhere on the page to open it instantly

### The Preview
- Renders your Markdown **as you type**, with full support for headings, bold, italic, strikethrough, inline code, code blocks, blockquotes, tables with alignment, task lists (with working checkboxes), links, and images
- **Scroll sync** — as you scroll the editor, the preview follows along automatically (toggle it off if you prefer)
- Clean, readable typography that makes your content look good

### Multi-Tab Documents
Work on multiple documents at the same time. Each tab maintains its own content, cursor position, scroll position, and version history independently. Add as many tabs as you need, rename or close them freely.

### Find & Replace
Hit `Ctrl+F` to slide open the find bar. Type to highlight all matches in real time (with a live count), jump between them with the arrow buttons, or replace one at a time — or all at once.

### Version History
Every time you make meaningful changes and pause, a snapshot is saved automatically. Open the version history modal to browse your past versions and restore any of them with one click. It's a lightweight safety net so you never lose work.

### Command Palette
Hit `Ctrl+P` to open the command palette. Type anything — "dark mode", "zen", "export PDF", "find" — and run it instantly. It's faster than hunting through menus.

### Focus Modes
- **Focus Mode** — dims everything except the paragraph you're currently typing in, so your attention stays on the words
- **Zen Mode** — hides the entire UI and goes full-screen. Just you and the blank page. Hit `Esc` to come back

### Live Stats
The navbar shows your current **word count**, **character count**, and **estimated reading time**, updating live. You can also set a **word goal** — a small progress bar appears showing how close you are to your target.

### Export
Click the Export button to download your document in four formats:
- **PDF** — print-ready, rendered as your preview looks
- **PNG** — a screenshot of your rendered preview
- **Word (.doc)** — opens in Microsoft Word
- **Markdown (.md)** — the raw source file

### Themes
Cycle through **Light**, **Dark**, and **Sepia** themes with the sun button in the navbar. Your preference is saved automatically.

### Auto-Save
Every change is saved to `localStorage` automatically. Close the tab, come back later — everything is exactly where you left it.

---

## Running it locally

Just open `index.html` in your browser. That's it.

No `npm install`. No build tools. No server required (unlike ES Module projects, this one uses classic `<script>` tags so it works straight from the filesystem).

```
# Double-click index.html, or:
# Drag index.html into any browser window
```

---

## Project structure

```
InkFlow/
├── index.html          # App shell — all the HTML markup and modal templates
├── style.css           # Full design system — light/dark/sepia themes, layout, components
├── favicon.svg         # Custom SVG logo
└── js/
    ├── state.js        # Central state — documents, active tab, settings
    ├── parser.js       # Custom Markdown → HTML parser (built from scratch)
    ├── tabs.js         # Multi-tab document management
    ├── toolbar.js      # Toolbar button actions and keyboard shortcut bindings
    ├── find.js         # Find & replace engine with live match highlighting
    ├── export.js       # PDF, PNG, Word, and .md export logic
    ├── history.js      # Auto-snapshot version history
    ├── ui.js           # Focus mode, Zen mode, TOC, scroll sync, themes, stats
    ├── commands.js     # Command palette — fuzzy search over all app actions
    └── app.js          # Entry point — wires everything together, handles drag & drop
```

I kept each concern in its own file. The `parser.js` is probably the most interesting one — writing a Markdown parser from scratch meant handling edge cases that libraries abstract away, and it gave me a much deeper appreciation for how text rendering actually works.

---

## Tech stack

| What | Why |
|---|---|
| HTML5 + Vanilla CSS | Full design control, zero overhead |
| Vanilla JavaScript | No framework needed for a well-organized app |
| Custom Markdown Parser | Built from scratch — no marked.js, no showdown |
| html2canvas | The only external library — used for PNG export |
| Inter + JetBrains Mono | Google Fonts — clean UI text and monospace code |
| localStorage | Auto-save and settings persistence, no backend |

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + P` | Command Palette |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + K` | Insert Link |
| `Ctrl + F` | Find & Replace |
| `Ctrl + S` | Export as .md |
| `Ctrl + Shift + C` | Code Block |
| `Ctrl + /` | Keyboard shortcuts reference |
| `Esc` | Exit Zen / Close modal |
| `Tab` | Indent (4 spaces) |

---

## Things I might add later

- Markdown file import via file picker (drag & drop works, button would be nice)
- Custom CSS themes / user-defined accent color
- Word-wrap toggle
- Vim keybindings mode
- Collaborative editing (WebRTC or websockets)

---

*Built by Deepanshu — because writing tools should feel as good as what you write in them.*
