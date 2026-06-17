const commands = [
    { name: 'Bold', key: 'Ctrl+B', fn: () => actions.bold() },
    { name: 'Italic', key: 'Ctrl+I', fn: () => actions.italic() },
    { name: 'Link', key: 'Ctrl+K', fn: () => actions.link() },
    { name: 'Code Block', key: 'Ctrl+Shift+C', fn: () => actions.codeblock() },
    { name: 'Heading 1', fn: () => actions.h1() },
    { name: 'Heading 2', fn: () => actions.h2() },
    { name: 'Heading 3', fn: () => actions.h3() },
    { name: 'Bullet List', fn: () => actions.ul() },
    { name: 'Numbered List', fn: () => actions.ol() },
    { name: 'Task List', fn: () => actions.checklist() },
    { name: 'Blockquote', fn: () => actions.blockquote() },
    { name: 'Horizontal Rule', fn: () => actions.hr() },
    { name: 'Insert Table', fn: () => actions.table() },
    { name: 'Insert Image', fn: () => actions.image() },
    { name: 'Strikethrough', key: 'Ctrl+Shift+X', fn: () => actions.strikethrough() },
    { name: 'Toggle Focus Mode', fn: () => toggleFocus() },
    { name: 'Toggle Zen Mode', fn: () => toggleZen() },
    { name: 'Toggle Table of Contents', fn: () => {
        tocOpen = !tocOpen;
        tocSidebar.classList.toggle('open', tocOpen);
    }},
    { name: 'Find & Replace', key: 'Ctrl+F', fn: () => toggleFind() },
    { name: 'Toggle Scroll Sync', fn: () => {
        scrollSync = !scrollSync;
        $('btnScrollSync').dataset.active = scrollSync;
        notify(scrollSync ? 'Sync on' : 'Sync off');
    }},
    { name: 'Export as Markdown', key: 'Ctrl+S', fn: () => exportMd() },
    { name: 'Export as PDF', fn: () => {
        notify('🖨️ Print...');
        setTimeout(() => window.print(), 300);
    }},
    { name: 'Export as PNG Image', fn: () => $('dlImage').click() },
    { name: 'Export as Word', fn: () => $('dlWord').click() },
    { name: 'New Document', fn: () => $('tabAdd').click() },
    { name: 'Clear Editor', fn: () => {
        if (editor.value.trim() && confirm('Clear?')) {
            editor.value = '';
            render();
        }
    }},
    { name: 'Copy Markdown', fn: () => navigator.clipboard.writeText(editor.value).then(() => notify('📋 Copied')) },
    { name: 'Version History', fn: () => showHistory() },
    { name: 'Keyboard Shortcuts', key: 'Ctrl+/', fn: () => shortcutsBackdrop.classList.toggle('show') },
    { name: 'Switch to Split View', fn: () => {
        currentView = 'split';
        workspace.dataset.view = 'split';
        document.querySelectorAll('.vm').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="split"]').classList.add('active');
    }},
    { name: 'Switch to Editor View', fn: () => {
        currentView = 'editor';
        workspace.dataset.view = 'editor';
        document.querySelectorAll('.vm').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="editor"]').classList.add('active');
    }},
    { name: 'Switch to Preview View', fn: () => {
        currentView = 'preview';
        workspace.dataset.view = 'preview';
        document.querySelectorAll('.vm').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="preview"]').classList.add('active');
    }},
    { name: 'Increase Font Size', fn: () => setFontSize(fontSize + 1) },
    { name: 'Decrease Font Size', fn: () => setFontSize(fontSize - 1) },
    { name: 'Next Theme', fn: () => {
        themeIdx = (themeIdx + 1) % THEMES.length;
        document.documentElement.dataset.theme = THEMES[themeIdx];
        localStorage.setItem('inkflow_theme', THEMES[themeIdx]);
        notify('🎨 ' + THEMES[themeIdx]);
    }},
    { name: 'Set Word Goal', fn: () => wordGoalWrap.click() }
];

let cmdIdx = 0;

function toggleCmdPalette() {
    const isOpen = cmdOverlay.classList.contains('show');
    if (isOpen) {
        cmdOverlay.classList.remove('show');
    } else {
        cmdOverlay.classList.add('show');
        cmdInput.value = '';
        cmdIdx = 0;
        renderCmdList('');
    }
    setTimeout(() => cmdInput.focus(), 50);
}

function renderCmdList(query) {
    const queryLower = query.toLowerCase();
    const filtered = query ? commands.filter(c => c.name.toLowerCase().includes(queryLower)) : commands;

    cmdList.innerHTML = '';
    cmdIdx = 0;

    filtered.forEach((c, i) => {
        const item = document.createElement('button');
        item.className = 'cmd-item' + (i === 0 ? ' active' : '');
        item.innerHTML = `<span class="cmd-icon">▸</span><span>${c.name}</span>${c.key ? '<span class="cmd-key">' + c.key + '</span>' : ''}`;

        item.addEventListener('click', () => {
            cmdOverlay.classList.remove('show');
            c.fn();
            editor.focus();
        });

        item.addEventListener('mouseenter', () => {
            cmdList.querySelectorAll('.cmd-item').forEach(x => x.classList.remove('active'));
            item.classList.add('active');
            cmdIdx = i;
        });

        cmdList.appendChild(item);
    });
}

cmdInput.addEventListener('input', () => renderCmdList(cmdInput.value));

cmdInput.addEventListener('keydown', e => {
    const items = cmdList.querySelectorAll('.cmd-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[cmdIdx]?.classList.remove('active');
        cmdIdx = (cmdIdx + 1) % items.length;
        items[cmdIdx]?.classList.add('active');
        items[cmdIdx]?.scrollIntoView({ block: 'nearest' });
    }
    else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[cmdIdx]?.classList.remove('active');
        cmdIdx = (cmdIdx - 1 + items.length) % items.length;
        items[cmdIdx]?.classList.add('active');
        items[cmdIdx]?.scrollIntoView({ block: 'nearest' });
    }
    else if (e.key === 'Enter') {
        e.preventDefault();
        items[cmdIdx]?.click();
    }
    else if (e.key === 'Escape') {
        cmdOverlay.classList.remove('show');
    }
});

cmdOverlay.addEventListener('click', e => {
    if (e.target === cmdOverlay) {
        cmdOverlay.classList.remove('show');
    }
});
