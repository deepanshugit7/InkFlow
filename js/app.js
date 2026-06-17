function render() {
    const markdownText = editor.value;
    const compiledHtml = parse(markdownText);

    preview.innerHTML = compiledHtml || '<div class="preview-empty"><p>Preview appears here</p></div>';

    stats(markdownText);
    updateLines();
    debounceSave(markdownText);
    updateToc(markdownText);
    updateGoal(markdownText);
}

function stats(text) {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCountEl.textContent = wordCount + ' words';
    charCountEl.textContent = text.length + ' chars';
    readTimeEl.textContent = Math.max(1, Math.ceil(wordCount / 200)) + ' min';
}

function updateLines() {
    const lineCount = editor.value.split('\n').length;
    const indices = [];
    for (let i = 1; i <= lineCount; i++) {
        indices.push(i);
    }
    lineNumbers.textContent = indices.join('\n');
}

function debounceSave(text) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        activeDoc().content = text;
        activeDoc().ts = Date.now();
        saveDocsToStorage();

        autosaveEl.classList.add('show');
        setTimeout(() => autosaveEl.classList.remove('show'), 1200);
    }, 500);
}

function notify(msg) {
    toast.textContent = msg;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function syncP() {
    if (!scrollSync || syncing || currentView !== 'split') return;
    syncing = true;

    const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);

    requestAnimationFrame(() => { syncing = false; });
}

function syncE() {
    if (!scrollSync || syncing || currentView !== 'split') return;
    syncing = true;

    const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight);

    requestAnimationFrame(() => { syncing = false; });
}

editor.addEventListener('input', render);

editor.addEventListener('scroll', () => {
    syncP();
    lineNumbers.scrollTop = editor.scrollTop;
});

preview.addEventListener('scroll', syncE);

document.querySelectorAll('.vm').forEach(btn => {
    btn.addEventListener('click', () => {
        const viewMode = btn.dataset.view;
        if (viewMode === currentView) return;

        currentView = viewMode;
        document.querySelectorAll('.vm').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        workspace.dataset.view = viewMode;
    });
});

$('toolbar').addEventListener('click', e => {
    const btn = e.target.closest('.tb[data-action]');
    if (btn && actions[btn.dataset.action]) {
        actions[btn.dataset.action]();
    }
});

document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl && e.key === 'p') {
        e.preventDefault();
        toggleCmdPalette();
        return;
    }
    if (ctrl && e.key === 'b') {
        e.preventDefault();
        actions.bold();
    }
    else if (ctrl && e.key === 'i') {
        e.preventDefault();
        actions.italic();
    }
    else if (ctrl && e.key === 'k') {
        e.preventDefault();
        actions.link();
    }
    else if (ctrl && e.key === 'f') {
        e.preventDefault();
        toggleFind();
    }
    else if (ctrl && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        actions.codeblock();
    }
    else if (ctrl && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        actions.strikethrough();
    }
    else if (ctrl && e.key === 's') {
        e.preventDefault();
        exportMd();
    }
    else if (ctrl && e.key === '/') {
        e.preventDefault();
        shortcutsBackdrop.classList.toggle('show');
    }
    else if (e.key === 'Escape') {
        cmdOverlay.classList.remove('show');
        shortcutsBackdrop.classList.remove('show');
        historyBackdrop.classList.remove('show');
        emojiPicker.classList.remove('show');
        if (zenMode) {
            toggleZen();
        }
    }
});

const defaultContent = `# Welcome to InkFlow ✨

A **feature-packed** Markdown editor with zero dependencies.

---

## All Features

- 📑 **Multiple document tabs** — create, switch, rename, close
- 🎨 **5 themes** — Light, Dark, Solarized, Monokai, Dracula
- ⌘ **Command Palette** — press \`Ctrl+P\` to access all commands
- 🔍 **Find & Replace** — with match count and navigation
- 📂 **Drag & Drop** — drop \`.md\` files to open them
- 🔤 **Auto-pair** — brackets, parentheses auto-close
- ⊙ **Focus Mode** — dims distractions
- ⛶ **Zen Mode** — full-screen distraction-free writing
- 📑 **Table of Contents** — auto-generated from headings
- 🎯 **Word Goal** — set a target with progress bar
- 🔠 **Font Size** — adjustable editor font size
- ⇅ **Scroll Sync** — editor and preview scroll together
- 😀 **Emoji Picker** — click or use \`:rocket:\` syntax → :rocket:
- ⟲ **Version History** — auto-snapshots every 30s
- 📥 **Export** — PDF, PNG, Word, Markdown
- 💾 **Auto-save** — everything saved to localStorage
- ↔️ **Resizable** split panes
- ⌨️ **Keyboard shortcuts** — Ctrl+B/I/K/F/S/P and more

## Try these:

**Emoji syntax:** :fire: :star: :heart: :rocket: :check:

\`\`\`javascript
const greet = (name) => {
    console.log(\\\`Hello, \\\${name}!\\\`);
};
greet("World");
\`\`\`

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

| Feature | Status |
|---------|--------|
| Tabs | ✅ |
| Themes | ✅ |
| Command Palette | ✅ |
| Find & Replace | ✅ |
| Drag & Drop | ✅ |

- [x] Build everything
- [ ] Ship it :rocket:

---

Press \`Ctrl+P\` to open the **Command Palette** and explore!
`;

const savedTheme = localStorage.getItem('inkflow_theme') || 'light';
themeIdx = THEMES.indexOf(savedTheme);
if (themeIdx < 0) themeIdx = 0;
document.documentElement.dataset.theme = THEMES[themeIdx];

fontSize = parseInt(localStorage.getItem('inkflow_fontsize')) || 14;
setFontSize(fontSize);

wordGoal = parseInt(localStorage.getItem('inkflow_goal')) || 0;

loadDocsFromStorage();

if (!activeDoc().content && docs.length === 1) {
    activeDoc().content = defaultContent;
}

editor.value = activeDoc().content;
workspace.dataset.view = currentView;

renderTabs();
render();
