function saveSnapshot() {
    try {
        const snaps = JSON.parse(localStorage.getItem('inkflow_history') || '[]');

        snaps.unshift({
            ts: Date.now(),
            content: editor.value,
            preview: editor.value.substring(0, 80)
        });

        if (snaps.length > 20) {
            snaps.length = 20;
        }

        localStorage.setItem('inkflow_history', JSON.stringify(snaps));
    } catch (e) {}
}

function showHistory() {
    historyBackdrop.classList.add('show');
    const snaps = JSON.parse(localStorage.getItem('inkflow_history') || '[]');

    if (!snaps.length) {
        historyList.innerHTML = '<p style="color:var(--textM); font-size:12px; padding:12px 0">No snapshots yet. Versions are saved every 30 seconds.</p>';
        return;
    }

    historyList.innerHTML = '';

    snaps.forEach(s => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const dateObj = new Date(s.ts);
        const formattedTime = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;

        item.innerHTML = `
            <div class="hi-info">
                <div class="hi-time">${formattedTime}</div>
                <div class="hi-preview">${esc(s.preview)}...</div>
            </div>
            <button class="hi-btn">Restore</button>
        `;

        item.querySelector('.hi-btn').addEventListener('click', () => {
            editor.value = s.content;
            render();
            historyBackdrop.classList.remove('show');
            notify('⟲ Restored version');
        });

        historyList.appendChild(item);
    });
}

$('btnHistory').addEventListener('click', showHistory);

$('historyClose').addEventListener('click', () => historyBackdrop.classList.remove('show'));

historyBackdrop.addEventListener('click', e => {
    if (e.target === historyBackdrop) {
        historyBackdrop.classList.remove('show');
    }
});

setInterval(saveSnapshot, 30000);
