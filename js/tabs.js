function renderTabs() {
    docTabsEl.innerHTML = '';
    docs.forEach(d => {
        const t = document.createElement('button');
        t.className = 'doc-tab' + (d.id === activeDocId ? ' active' : '');
        t.innerHTML = `<span>${d.name}</span>${docs.length > 1 ? '<span class="tab-close" data-id="' + d.id + '">×</span>' : ''}`;

        t.addEventListener('click', e => {
            if (e.target.classList.contains('tab-close')) {
                closeTab(+e.target.dataset.id);
                return;
            }
            switchTab(d.id);
        });

        t.addEventListener('dblclick', () => renameTab(d.id));
        docTabsEl.appendChild(t);
    });
}

function switchTab(id) {
    activeDoc().content = editor.value;
    saveDocsToStorage();

    activeDocId = id;
    editor.value = activeDoc().content;

    renderTabs();
    render();
}

function closeTab(id) {
    if (docs.length <= 1) return;

    docs = docs.filter(d => d.id !== id);
    if (activeDocId === id) {
        activeDocId = docs[0].id;
    }

    editor.value = activeDoc().content;
    renderTabs();
    render();
    saveDocsToStorage();
}

function renameTab(id) {
    const d = docs.find(x => x.id === id);
    if (!d) return;

    const name = prompt('Rename document:', d.name);
    if (name && name.trim()) {
        d.name = name.trim();
        renderTabs();
        saveDocsToStorage();
    }
}

$('tabAdd').addEventListener('click', () => {
    activeDoc().content = editor.value;
    const newDoc = {
        id: Date.now(),
        name: 'Untitled ' + (docs.length + 1),
        content: '',
        ts: Date.now()
    };

    docs.push(newDoc);
    activeDocId = newDoc.id;
    editor.value = '';

    renderTabs();
    render();
    saveDocsToStorage();
});
