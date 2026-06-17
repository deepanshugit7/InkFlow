function toggleFind() {
    findOpen = !findOpen;
    findBar.classList.toggle('open', findOpen);

    if (findOpen) {
        findInput.focus();
    } else {
        findMatches = [];
        findIdx = -1;
        findCountEl.textContent = '0 results';
    }
}

function doFind() {
    const query = findInput.value;
    if (!query) {
        findMatches = [];
        findIdx = -1;
        findCountEl.textContent = '0 results';
        return;
    }

    findMatches = [];
    let index = 0;
    const editorValLower = editor.value.toLowerCase();
    const queryLower = query.toLowerCase();

    while ((index = editorValLower.indexOf(queryLower, index)) !== -1) {
        findMatches.push(index);
        index += queryLower.length;
    }

    findIdx = findMatches.length ? 0 : -1;
    findCountEl.textContent = findMatches.length + ' results';

    if (findIdx >= 0) {
        highlightMatch();
    }
}

function highlightMatch() {
    if (findIdx < 0 || !findMatches.length) return;

    const pos = findMatches[findIdx];
    const len = findInput.value.length;

    editor.focus();
    editor.setSelectionRange(pos, pos + len);

    const lineIndex = editor.value.substring(0, pos).split('\n').length;
    const totalLines = editor.value.split('\n').length;
    const lineScrollHeight = (lineIndex / totalLines) * editor.scrollHeight;

    editor.scrollTop = lineScrollHeight - 80;
}

findInput.addEventListener('input', doFind);

$('findNext').addEventListener('click', () => {
    if (findMatches.length) {
        findIdx = (findIdx + 1) % findMatches.length;
        highlightMatch();
    }
});

$('findPrev').addEventListener('click', () => {
    if (findMatches.length) {
        findIdx = (findIdx - 1 + findMatches.length) % findMatches.length;
        highlightMatch();
    }
});

$('replaceOne').addEventListener('click', () => {
    if (findIdx >= 0) {
        const query = findInput.value;
        const replaceText = replaceInput.value;
        const pos = findMatches[findIdx];

        editor.value = editor.value.substring(0, pos) + replaceText + editor.value.substring(pos + query.length);
        render();
        doFind();
    }
});

$('replaceAll').addEventListener('click', () => {
    const query = findInput.value;
    const replaceText = replaceInput.value;
    if (!query) return;

    editor.value = editor.value.split(query).join(replaceText);
    render();
    doFind();
    notify('Replaced all');
});

$('findClose').addEventListener('click', toggleFind);

$('btnFind').addEventListener('click', toggleFind);
