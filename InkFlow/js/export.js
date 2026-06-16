$('btnExportToggle').addEventListener('click', e => {
    e.stopPropagation();
    downloadDropdown.classList.toggle('open');
});

document.addEventListener('click', e => {
    if (!downloadDropdown.contains(e.target)) {
        downloadDropdown.classList.remove('open');
    }
});

function exportMd() {
    if (!editor.value.trim()) {
        notify('Nothing to export');
        return;
    }

    const blob = new Blob([editor.value], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (activeDoc().name || 'document') + '.md';
    a.click();

    URL.revokeObjectURL(a.href);
    notify('📥 Exported .md');
}

$('dlMarkdown').addEventListener('click', () => {
    downloadDropdown.classList.remove('open');
    exportMd();
});

$('dlPdf').addEventListener('click', () => {
    downloadDropdown.classList.remove('open');
    if (!editor.value.trim()) {
        notify('Nothing');
        return;
    }
    notify('🖨️ Print dialog...');
    setTimeout(() => window.print(), 300);
});

$('dlImage').addEventListener('click', async () => {
    downloadDropdown.classList.remove('open');
    if (!editor.value.trim()) {
        notify('Nothing');
        return;
    }
    notify('📸 Generating...');
    try {
        const offscreen = document.createElement('div');
        offscreen.className = 'markdown-body';
        offscreen.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 800px;
            padding: 40px 48px;
            background: #fff;
            color: #1a1a1a;
            font-family: Inter, sans-serif;
            font-size: 15px;
            line-height: 1.8;
        `;

        offscreen.innerHTML = parse(editor.value);
        document.body.appendChild(offscreen);

        const canvas = await html2canvas(offscreen, {
            backgroundColor: '#fff',
            scale: 2,
            useCORS: true,
            logging: false
        });

        document.body.removeChild(offscreen);

        canvas.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'document.png';
            a.click();
            URL.revokeObjectURL(a.href);
            notify('🖼️ Exported .png');
        }, 'image/png');

    } catch (err) {
        notify('❌ Image export failed');
    }
});

$('dlWord').addEventListener('click', () => {
    downloadDropdown.classList.remove('open');
    if (!editor.value.trim()) {
        notify('Nothing');
        return;
    }

    const htmlBody = parse(editor.value);

    const docHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; padding: 20px; }
                h1 { font-size: 20pt; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
                h2 { font-size: 16pt; }
                h3 { font-size: 13pt; }
                code { font-family: Consolas, monospace; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; }
                pre { background: #f5f5f5; padding: 12px; border-radius: 4px; border: 1px solid #e0e0e0; }
                pre code { background: none; padding: 0; }
                blockquote { border-left: 3px solid #fa5320; padding: 6px 14px; background: #fef6f3; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 6px 10px; }
                th { background: #f0f0f0; }
                a { color: #0066cc; }
                hr { border: none; border-top: 1px solid #ddd; }
            </style>
        </head>
        <body>
            ${htmlBody}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (activeDoc().name || 'document') + '.doc';
    a.click();

    URL.revokeObjectURL(a.href);
    notify('📝 Exported .doc');
});
