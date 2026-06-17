function wrap(before, after) {
    const s = editor.selectionStart,
          e = editor.selectionEnd;
    const selection = editor.value.substring(s, e) || 'text';

    editor.value = editor.value.substring(0, s) + before + selection + (after || '') + editor.value.substring(e);
    editor.selectionStart = s + before.length;
    editor.selectionEnd = s + before.length + selection.length;
    editor.focus();
    render();
}

function linePrefix(prefix) {
    const s = editor.selectionStart;
    const lastNewline = editor.value.lastIndexOf('\n', s - 1) + 1;

    editor.value = editor.value.substring(0, lastNewline) + prefix + editor.value.substring(lastNewline);
    editor.selectionStart = editor.selectionEnd = lastNewline + prefix.length;
    editor.focus();
    render();
}

function insert(text) {
    const s = editor.selectionStart;
    editor.value = editor.value.substring(0, s) + text + editor.value.substring(editor.selectionEnd);
    editor.selectionStart = editor.selectionEnd = s + text.length;
    editor.focus();
    render();
}

const actions = {
    h1: () => linePrefix('# '),
    h2: () => linePrefix('## '),
    h3: () => linePrefix('### '),
    bold: () => wrap('**', '**'),
    italic: () => wrap('*', '*'),
    strikethrough: () => wrap('~~', '~~'),
    code: () => wrap('`', '`'),
    codeblock: () => {
        insert('\n```\n' + (editor.value.substring(editor.selectionStart, editor.selectionEnd) || 'code') + '\n```\n');
    },
    blockquote: () => linePrefix('> '),
    ul: () => linePrefix('- '),
    ol: () => linePrefix('1. '),
    checklist: () => linePrefix('- [ ] '),
    link: () => wrap('[', '](url)'),
    image: () => insert('![alt](image-url)'),
    table: () => insert('\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n'),
    hr: () => insert('\n---\n'),
    emoji: () => toggleEmojiPicker()
};

const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`', '*': '*', '_': '_' };

editor.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const s = editor.selectionStart;
        editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(editor.selectionEnd);
        editor.selectionStart = editor.selectionEnd = s + 4;
        render();
        return;
    }

    if (pairs[e.key] && !e.ctrlKey && !e.metaKey) {
        const s = editor.selectionStart,
              end = editor.selectionEnd;

        if (s !== end) {
            e.preventDefault();
            const selectedText = editor.value.substring(s, end);
            editor.value = editor.value.substring(0, s) + e.key + selectedText + pairs[e.key] + editor.value.substring(end);
            editor.selectionStart = s + 1;
            editor.selectionEnd = end + 1;
            render();
            return;
        }

        if ('([{'.includes(e.key)) {
            e.preventDefault();
            editor.value = editor.value.substring(0, s) + e.key + pairs[e.key] + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = s + 1;
            render();
        }
    }

    if (e.key === 'Backspace') {
        const s = editor.selectionStart;
        const charBefore = editor.value[s - 1];
        const charAfter = editor.value[s];

        if (charBefore && pairs[charBefore] === charAfter) {
            e.preventDefault();
            editor.value = editor.value.substring(0, s - 1) + editor.value.substring(s + 1);
            editor.selectionStart = editor.selectionEnd = s - 1;
            render();
        }
    }
});
