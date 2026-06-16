function toggleFocus() {
    focusMode = !focusMode;
    document.body.classList.toggle('focus-mode', focusMode);
    $('btnFocus').dataset.active = focusMode;
    notify(focusMode ? '⊙ Focus mode on' : 'Focus mode off');
}
$('btnFocus').addEventListener('click', toggleFocus);

function toggleZen() {
    zenMode = !zenMode;
    document.body.classList.toggle('zen-mode', zenMode);
    if ($('btnZen')) {
        $('btnZen').dataset.active = zenMode;
    }
    notify(zenMode ? '⛶ Zen mode — press Esc to exit' : 'Zen mode off');
}
$('btnZen').addEventListener('click', toggleZen);

function updateToc(md) {
    if (!tocList) return;
    const lines = md.split('\n');
    tocList.innerHTML = '';

    lines.forEach((l, idx) => {
        const match = l.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const btn = document.createElement('button');
            btn.className = 'toc-item h' + match[1].length;
            btn.textContent = match[2].replace(/[*_~`]/g, '');

            btn.addEventListener('click', () => {
                const linePosition = editor.value.split('\n').slice(0, idx).join('\n').length;
                editor.focus();
                editor.setSelectionRange(linePosition, linePosition);

                const lineScrollHeight = (idx / lines.length) * editor.scrollHeight;
                editor.scrollTop = lineScrollHeight - 50;
            });
            tocList.appendChild(btn);
        }
    });
}

$('btnToc').addEventListener('click', () => {
    tocOpen = !tocOpen;
    tocSidebar.classList.toggle('open', tocOpen);
    $('btnToc').dataset.active = tocOpen;
});

function updateGoal(md) {
    if (!wordGoal) {
        wordGoalWrap.classList.add('hidden');
        return;
    }
    wordGoalWrap.classList.remove('hidden');
    const wordCount = md.trim() ? md.trim().split(/\s+/).length : 0;
    const percentage = Math.min(100, Math.round((wordCount / wordGoal) * 100));

    goalFill.style.width = percentage + '%';
    goalText.textContent = wordCount + '/' + wordGoal;

    if (percentage >= 100) {
        goalFill.style.background = 'var(--green)';
    } else {
        goalFill.style.background = 'var(--accent)';
    }
}

wordGoalWrap.addEventListener('click', () => {
    const goalVal = prompt('Set word goal (0 to disable):', wordGoal || '');
    if (goalVal !== null) {
        wordGoal = Math.max(0, parseInt(goalVal) || 0);
        localStorage.setItem('inkflow_goal', wordGoal);
        updateGoal(editor.value);
    }
});

function setFontSize(size) {
    fontSize = Math.max(10, Math.min(22, size));
    document.documentElement.style.setProperty('--fontSize', fontSize + 'px');
    fontLabel.textContent = fontSize;
    localStorage.setItem('inkflow_fontsize', fontSize);
}
$('fontInc').addEventListener('click', () => setFontSize(fontSize + 1));
$('fontDec').addEventListener('click', () => setFontSize(fontSize - 1));

$('btnTheme').addEventListener('click', () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    document.documentElement.dataset.theme = THEMES[themeIdx];
    localStorage.setItem('inkflow_theme', THEMES[themeIdx]);
    notify('🎨 ' + THEMES[themeIdx].charAt(0).toUpperCase() + THEMES[themeIdx].slice(1) + ' theme');
});

$('btnScrollSync').addEventListener('click', () => {
    scrollSync = !scrollSync;
    $('btnScrollSync').dataset.active = scrollSync;
    notify(scrollSync ? '⇅ Scroll sync on' : 'Scroll sync off');
});

$('btnCopyMd').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.value).then(() => notify('📋 Copied'));
});

$('btnClear').addEventListener('click', () => {
    if (!editor.value.trim()) return;
    if (confirm('Clear all content?')) {
        editor.value = '';
        render();
        notify('🗑️ Cleared');
        editor.focus();
    }
});

const emojis = [
    '😀','😂','😍','🥰','😎','🤔','😢','😱','🤯','🥳',
    '👍','👎','👏','🙌','🔥','⭐','❤️','💔','✅','❌',
    '⚡','💡','🎉','🎨','🚀','💻','📌','📝','🔗','🔒',
    '🔑','☕','🍕','🌟','🏆','🎯','🎮','🎵','📊','📈',
    '🗑️','✏','⚙️','🛡️','🪄','🧪','📜','🎲','💎','👑'
];

emojis.forEach(em => {
    const btn = document.createElement('button');
    btn.textContent = em;
    btn.addEventListener('click', () => {
        insert(em);
        emojiPicker.classList.remove('show');
    });
    emojiGrid.appendChild(btn);
});

function toggleEmojiPicker() {
    emojiPicker.classList.toggle('show');
    if (emojiPicker.classList.contains('show')) {
        const rect = editor.getBoundingClientRect();
        emojiPicker.style.top = (rect.top + 40) + 'px';
        emojiPicker.style.left = (rect.left + 20) + 'px';
    }
}

document.addEventListener('click', e => {
    if (!emojiPicker.contains(e.target) && e.target.dataset?.action !== 'emoji') {
        emojiPicker.classList.remove('show');
    }
});

let dragCounter = 0;

document.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    dropOverlay.classList.add('show');
});

document.addEventListener('dragleave', e => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        dropOverlay.classList.remove('show');
        dragCounter = 0;
    }
});

document.addEventListener('dragover', e => e.preventDefault());

document.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    dropOverlay.classList.remove('show');

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt') && !file.name.endsWith('.markdown')) {
        notify('⚠️ Only .md files supported');
        return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
        activeDoc().content = ev.target.result;
        activeDoc().name = file.name.replace(/\.(md|txt|markdown)$/, '');
        editor.value = ev.target.result;
        renderTabs();
        render();
        notify('📄 Loaded ' + file.name);
    };
    reader.readAsText(file);
});

gutter.addEventListener('mousedown', e => {
    isResizing = true;
    gutter.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
});

document.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const rect = workspace.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedPct = Math.max(20, Math.min(80, pct));

    editorPane.style.flex = `0 0 ${clampedPct}%`;
    previewPane.style.flex = `0 0 ${100 - clampedPct}%`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        gutter.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});
