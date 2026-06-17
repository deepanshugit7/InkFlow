const $ = id => document.getElementById(id);

const editor = $('editor'),
      preview = $('preview'),
      workspace = $('workspace'),
      gutter = $('gutter'),
      editorPane = $('editorPane'),
      previewPane = $('previewPane'),
      lineNumbers = $('lineNumbers'),
      toast = $('toast'),
      autosaveEl = $('autosave'),
      cmdOverlay = $('cmdOverlay'),
      cmdInput = $('cmdInput'),
      cmdList = $('cmdList'),
      findBar = $('findBar'),
      findInput = $('findInput'),
      replaceInput = $('replaceInput'),
      findCountEl = $('findCount'),
      tocSidebar = $('toc-sidebar') || $('tocSidebar'),
      tocList = $('tocList'),
      emojiPicker = $('emojiPicker'),
      emojiGrid = $('emojiGrid'),
      dropOverlay = $('dropOverlay'),
      wordCountEl = $('wordCount'),
      charCountEl = $('charCount'),
      readTimeEl = $('readTime'),
      goalFill = $('goalFill'),
      goalText = $('goalText'),
      wordGoalWrap = $('wordGoalWrap'),
      fontLabel = $('fontLabel'),
      downloadDropdown = $('downloadDropdown'),
      historyBackdrop = $('historyBackdrop'),
      historyList = $('historyList'),
      shortcutsBackdrop = $('shortcutsBackdrop'),
      docTabsEl = $('docTabs');

const THEMES = ['light', 'dark', 'solarized', 'monokai', 'dracula'];
let themeIdx = 0,
    currentView = 'split',
    scrollSync = true,
    syncing = false,
    isResizing = false,
    focusMode = false,
    zenMode = false,
    tocOpen = false,
    findOpen = false,
    toastTimer = null,
    saveTimer = null,
    fontSize = 14,
    wordGoal = 0,
    findMatches = [],
    findIdx = -1;

let docs = [{ id: Date.now(), name: 'Untitled', content: '', ts: Date.now() }];
let activeDocId = docs[0].id;

function activeDoc() {
    return docs.find(d => d.id === activeDocId);
}

function saveDocsToStorage() {
    try {
        localStorage.setItem('inkflow_docs', JSON.stringify(docs));
    } catch (e) {}
}

function loadDocsFromStorage() {
    try {
        const d = localStorage.getItem('inkflow_docs');
        if (d) {
            docs = JSON.parse(d);
            if (!docs.length) {
                docs = [{ id: Date.now(), name: 'Untitled', content: '', ts: Date.now() }];
            }
            activeDocId = docs[0].id;
        }
    } catch (e) {}
}
