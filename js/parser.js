const emojiMap = {
    smile: '😄', heart: '❤️', fire: '🔥', rocket: '🚀', star: '⭐',
    check: '✅', x: '❌', warning: '⚠️', info: 'ℹ️', bulb: '💡',
    thumbsup: '👍', thumbsdown: '👎', clap: '👏', eyes: '👀', thinking: '🤔',
    cry: '😢', laugh: '😂', cool: '😎', wave: '👋', sparkles: '✨',
    zap: '⚡', bug: '🐛', gear: '⚙️', lock: '🔒', key: '🔑',
    link: '🔗', pin: '📌', memo: '📝', book: '📖', clock: '🕐',
    calendar: '📅', mail: '📧', phone: '📱', laptop: '💻', coffee: '☕',
    pizza: '🍕', party: '🎉', trophy: '🏆', medal: '🥇', flag: '🏁',
    globe: '🌍', sun: '☀️', moon: '🌙', cloud: '☁️', rain: '🌧️',
    snow: '❄️', tree: '🌳', flower: '🌸', dog: '🐕', cat: '🐱',
    music: '🎵', art: '🎨', film: '🎬', game: '🎮', dice: '🎲',
    gift: '🎁', balloon: '🎈', ribbon: '🎀', crown: '👑', gem: '💎',
    money: '💰', chart: '📊', graph: '📈', folder: '📁', trash: '🗑️',
    edit: '✏️', scissors: '✂️', hammer: '🔨', wrench: '🔧', shield: '🛡️',
    sword: '⚔️', bow: '🏹', magic: '🪄', potion: '🧪', scroll: '📜',
    map: '🗺️'
};

function parse(md) {
    if (!md || !md.trim()) return '';
    const lines = md.split('\n');
    let html = '', i = 0;

    while (i < lines.length) {
        const line = lines[i];

        const fence = line.match(/^(`{3,}|~{3,})(.*?)$/);
        if (fence) {
            const marker = fence[1];
            const lang = fence[2].trim();
            const codeContent = [];
            i++;
            while (i < lines.length && !lines[i].startsWith(marker)) {
                codeContent.push(lines[i]);
                i++;
            }
            i++;
            const langTag = lang ? `<span class="code-lang">${esc(lang)}</span>` : '';
            html += `<pre>${langTag}<code>${esc(codeContent.join('\n'))}</code></pre>\n`;
            continue;
        }

        if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
            html += '<hr>\n';
            i++;
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            html += `<h${level}>${inl(headingMatch[2])}</h${level}>\n`;
            i++;
            continue;
        }

        if (line.startsWith('>')) {
            const quoteContent = [];
            while (i < lines.length && lines[i].startsWith('>')) {
                quoteContent.push(lines[i].replace(/^>\s?/, ''));
                i++;
            }
            html += `<blockquote>${parse(quoteContent.join('\n'))}</blockquote>\n`;
            continue;
        }

        if (i + 1 < lines.length && /^\|(.+)\|$/.test(line.trim()) && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
            html += tbl(lines, i);
            i += 2;
            while (i < lines.length && /^\|(.+)\|$/.test(lines[i].trim())) {
                i++;
            }
            continue;
        }

        if (/^(\s*)([-*+])\s+/.test(line)) {
            const result = lst(lines, i, 'ul');
            html += result.h;
            i = result.n;
            continue;
        }

        if (/^(\s*)\d+\.\s+/.test(line)) {
            const result = lst(lines, i, 'ol');
            html += result.h;
            i = result.n;
            continue;
        }

        if (!line.trim()) {
            i++;
            continue;
        }

        const paraContent = [];
        while (i < lines.length && lines[i].trim() &&
               !/^#{1,6}\s/.test(lines[i]) &&
               !/^[-*+]\s/.test(lines[i]) &&
               !/^\d+\.\s/.test(lines[i]) &&
               !/^>/.test(lines[i]) &&
               !/^[`~]{3}/.test(lines[i]) &&
               !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim()) &&
               !/^\|(.+)\|$/.test(lines[i].trim())) {
            paraContent.push(lines[i]);
            i++;
        }
        if (paraContent.length) {
            html += `<p>${inl(paraContent.join('\n'))}</p>\n`;
        }
    }
    return html;
}

function inl(t) {
    return t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del>$1</del>')
        .replace(/:([a-z]+):/g, (match, name) => emojiMap[name] || match)
        .replace(/\n/g, '<br>');
}

function lst(lines, start, tag) {
    const items = [];
    let i = start;
    const baseIndent = (lines[i].match(/^(\s*)/) || ['', ''])[1].length;

    while (i < lines.length) {
        const ln = lines[i];

        if (!ln.trim()) {
            if (i + 1 < lines.length) {
                const nextIndent = (lines[i + 1].match(/^(\s*)/) || ['', ''])[1].length;
                if (nextIndent >= baseIndent && (/^\s*[-*+]\s/.test(lines[i + 1]) || /^\s*\d+\.\s/.test(lines[i + 1]))) {
                    i++;
                    continue;
                }
            }
            break;
        }

        const indent = (ln.match(/^(\s*)/) || ['', ''])[1].length;
        if (indent < baseIndent) break;

        if (indent > baseIndent) {
            const subTag = /^\s*[-*+]\s/.test(ln) ? 'ul' : 'ol';
            const subList = lst(lines, i, subTag);
            if (items.length) {
                items[items.length - 1].sub = subList.h;
            }
            i = subList.n;
            continue;
        }

        if (!/^\s*[-*+]\s/.test(ln) && !/^\s*\d+\.\s/.test(ln)) break;

        let content = /^\s*[-*+]\s/.test(ln) ? ln.replace(/^\s*[-*+]\s+/, '') : ln.replace(/^\s*\d+\.\s+/, '');

        let task = false, checked = false;
        const taskMatch = content.match(/^\[([ xX])\]\s*(.*)$/);
        if (taskMatch) {
            task = true;
            checked = taskMatch[1] !== ' ';
            content = taskMatch[2];
        }

        items.push({ content, task, checked, sub: '' });
        i++;
    }

    let h = `<${tag}>\n`;
    items.forEach(it => {
        const cls = it.task ? ' class="task-item"' : '';
        const checkbox = it.task ? `<input type="checkbox"${it.checked ? ' checked' : ''} disabled> ` : '';
        h += `<li${cls}>${checkbox}${inl(it.content)}${it.sub}</li>\n`;
    });
    h += `</${tag}>\n`;

    return { h, n: i };
}

function tbl(lines, s) {
    const hdr = lines[s].trim().split('|').filter(c => c.trim()).map(c => c.trim());
    const sep = lines[s + 1].trim().split('|').filter(c => c.trim());

    const align = sep.map(c => {
        const t = c.trim();
        return t[0] === ':' && t.slice(-1) === ':' ? 'center' : t.slice(-1) === ':' ? 'right' : 'left';
    });

    let h = '<table><thead><tr>';
    hdr.forEach((c, j) => {
        h += `<th style="text-align:${align[j] || 'left'}">${inl(c)}</th>`;
    });
    h += '</tr></thead><tbody>';

    let i = s + 2;
    while (i < lines.length && /^\|(.+)\|$/.test(lines[i].trim())) {
        const cells = lines[i].trim().split('|').filter(c => c.trim()).map(c => c.trim());
        h += '<tr>';
        cells.forEach((c, j) => {
            h += `<td style="text-align:${align[j] || 'left'}">${inl(c)}</td>`;
        });
        h += '</tr>';
        i++;
    }
    h += '</tbody></table>\n';
    return h;
}

function esc(t) {
    return t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
