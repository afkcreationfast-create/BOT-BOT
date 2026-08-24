const state = {
    sessions: [],
    messages: [],
    logs: []
};

const $ = selector => document.querySelector(selector);

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2600);
}

function statusLabel(status) {
    const labels = {
        connected: 'Connecté',
        pairing: 'Code requis',
        connecting: 'Connexion',
        reconnecting: 'Reconnexion',
        error: 'Erreur',
        logged_out: 'Déconnecté',
        offline: 'Hors ligne'
    };
    return labels[status] || status;
}

function formatUptime(seconds) {
    seconds = Math.floor(Number(seconds) || 0);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
}

async function api(path, options = {}) {
    const response = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
}

function renderStats() {
    $('#totalSessions').textContent = state.sessions.length;
    $('#connectedSessions').textContent =
        state.sessions.filter(s => s.status === 'connected').length;
    $('#pairingSessions').textContent =
        state.sessions.filter(s => s.status === 'pairing').length;
}

function renderSessions() {
    const grid = $('#sessionsGrid');

    if (!state.sessions.length) {
        grid.innerHTML = '<div class="empty">Aucune session WhatsApp.</div>';
    } else {
        grid.innerHTML = state.sessions.map(session => {
            const phone = session.phoneNumber || 'Numéro inconnu';
            const user = session.user?.name || session.user?.id || '—';
            const pairing = session.pairingCode
                ? `<div class="pairing"><span>CODE</span><strong>${escapeHtml(session.pairingCode)}</strong><small>Entre ce code dans WhatsApp.</small></div>`
                : '';

            return `
                <article class="session-card">
                    <div class="session-head">
                        <div class="session-id">${escapeHtml(session.sessionId)}</div>
                        <span class="badge ${escapeHtml(session.status)}">${escapeHtml(statusLabel(session.status))}</span>
                    </div>

                    <div class="session-meta">
                        <div>Numéro : <strong>${escapeHtml(phone)}</strong></div>
                        <div>Compte : <strong>${escapeHtml(user)}</strong></div>
                        <div>Dernier message : <strong>${escapeHtml(session.lastMessage?.text || '—')}</strong></div>
                    </div>

                    ${pairing}

                    <div class="session-actions">
                        <button class="ghost-button" data-send-session="${escapeHtml(session.sessionId)}">Envoyer</button>
                        <button class="danger-button" data-delete-session="${escapeHtml(session.sessionId)}">Déconnecter</button>
                    </div>
                </article>
            `;
        }).join('');
    }

    const select = $('#sendSession');
    const current = select.value;

    select.innerHTML =
        '<option value="">Choisir une session</option>' +
        state.sessions.map(s =>
            `<option value="${escapeHtml(s.sessionId)}">${escapeHtml(s.sessionId)} — ${escapeHtml(statusLabel(s.status))}</option>`
        ).join('');

    if (state.sessions.some(s => s.sessionId === current)) {
        select.value = current;
    }

    renderStats();
}

function renderMessages() {
    const list = $('#messageList');

    if (!state.messages.length) {
        list.innerHTML = '<div class="empty">Aucun message reçu.</div>';
        return;
    }

    list.innerHTML = state.messages.slice(-100).reverse().map(item => `
        <div class="message-item">
            <div><strong>${escapeHtml(item.jid)}</strong> — ${escapeHtml(item.sessionId)}</div>
            <div>${escapeHtml(item.text)}</div>
            <small>${escapeHtml(new Date(item.at).toLocaleString())}</small>
        </div>
    `).join('');
}

function addActivity(text) {
    const list = $('#activityList');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `<div>${escapeHtml(text)}</div><small>${new Date().toLocaleTimeString()}</small>`;

    if (list.querySelector('.empty')) list.innerHTML = '';
    list.prepend(item);

    while (list.children.length > 30) {
        list.lastElementChild.remove();
    }
}

function addLog(text) {
    state.logs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
    if (state.logs.length > 300) state.logs.shift();
    $('#logOutput').textContent = state.logs.join('\n');
}

function applySession(session) {
    const index = state.sessions.findIndex(s => s.sessionId === session.sessionId);

    if (index === -1) {
        state.sessions.push(session);
    } else {
        state.sessions[index] = {
            ...state.sessions[index],
            ...session
        };
    }

    renderSessions();
}

async function refresh() {
    try {
        const [health, sessions] = await Promise.all([
            api('/api/health'),
            api('/api/sessions')
        ]);

        $('#apiDot').classList.add('ok');
        $('#apiStatus').textContent = 'API connectée';
        $('#uptime').textContent = formatUptime(health.uptime);

        state.sessions = sessions.sessions || [];
        renderSessions();
        addLog('Données du dashboard actualisées.');
    } catch (error) {
        $('#apiDot').classList.remove('ok');
        $('#apiStatus').textContent = 'API indisponible';
        addLog(`Erreur API : ${error.message}`);
    }
}

function connectEvents() {
    const events = new EventSource('/events');

    events.addEventListener('session', event => {
        const session = JSON.parse(event.data);
        applySession(session);
        addActivity(`${session.sessionId} → ${statusLabel(session.status)}`);
        addLog(`${session.sessionId} → ${statusLabel(session.status)}`);
    });

    events.addEventListener('session_removed', event => {
        const { sessionId } = JSON.parse(event.data);
        state.sessions = state.sessions.filter(s => s.sessionId !== sessionId);
        renderSessions();
        addActivity(`${sessionId} → session supprimée`);
        addLog(`${sessionId} → session supprimée`);
    });

    events.addEventListener('pairing', event => {
        const data = JSON.parse(event.data);
        applySession({
            sessionId: data.sessionId,
            phoneNumber: data.phoneNumber,
            status: 'pairing',
            pairingCode: data.code
        });

        $('#pairingCode').textContent = data.code;
        $('#pairingResult').classList.remove('hidden');

        addActivity(`${data.sessionId} → code de liaison reçu`);
        addLog(`${data.sessionId} → code de liaison : ${data.code}`);
        toast('Code de liaison reçu.');
    });

    events.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        state.messages.push(data);
        renderMessages();
        addActivity(`${data.sessionId} ← ${data.jid} : ${data.text}`);
        addLog(`${data.sessionId} ← ${data.jid} : ${data.text}`);
    });

    events.addEventListener('message_sent', event => {
        const data = JSON.parse(event.data);
        addActivity(`${data.sessionId} → ${data.jid} : message envoyé`);
        addLog(`${data.sessionId} → ${data.jid} : message envoyé`);
    });

    events.addEventListener('log', event => {
        const data = JSON.parse(event.data);
        addLog(data.message);
    });

    events.onerror = () => {
        $('#apiStatus').textContent = 'Reconnexion API...';
        $('#apiDot').classList.remove('ok');
    };

    events.onopen = () => {
        $('#apiStatus').textContent = 'API connectée';
        $('#apiDot').classList.add('ok');
    };
}

document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

        button.classList.add('active');
        const section = $('#' + button.dataset.section);
        section.classList.add('active');
        $('#pageTitle').textContent =
            button.querySelector('span')?.textContent || 'Dashboard';
    });
});

$('#refreshButton').addEventListener('click', refresh);

$('#addSessionForm').addEventListener('submit', async event => {
    event.preventDefault();

    const phoneNumber = $('#phoneNumber').value.trim();

    try {
        const data = await api('/api/sessions', {
            method: 'POST',
            body: JSON.stringify({ phoneNumber })
        });

        if (data.session) {
            applySession(data.session);
        }

        $('#phoneNumber').value = '';
        toast('Session créée. Attends le code de liaison.');
    } catch (error) {
        toast(error.message);
    }
});

$('#sendMessageForm').addEventListener('submit', async event => {
    event.preventDefault();

    const sessionId = $('#sendSession').value;
    const to = $('#sendTo').value.trim();
    const text = $('#sendText').value.trim();

    if (!sessionId) {
        return toast('Choisis une session.');
    }

    try {
        await api(`/api/sessions/${encodeURIComponent(sessionId)}/send`, {
            method: 'POST',
            body: JSON.stringify({ to, text })
        });

        $('#sendText').value = '';
        toast('Message envoyé.');
    } catch (error) {
        toast(error.message);
    }
});

$('#sessionsGrid').addEventListener('click', async event => {
    const sendButton = event.target.closest('[data-send-session]');
    const deleteButton = event.target.closest('[data-delete-session]');

    if (sendButton) {
        document.querySelector('[data-section="messages"]').click();
        $('#sendSession').value = sendButton.dataset.sendSession;
        return;
    }

    if (deleteButton) {
        const sessionId = deleteButton.dataset.deleteSession;

        try {
            await api(`/api/sessions/${encodeURIComponent(sessionId)}`, {
                method: 'DELETE'
            });
            toast('Session déconnectée.');
        } catch (error) {
            toast(error.message);
        }
    }
});

$('#clearLogs').addEventListener('click', () => {
    state.logs = [];
    $('#logOutput').textContent = '';
});

connectEvents();
refresh();
setInterval(refresh, 10000);
