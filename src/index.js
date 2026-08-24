const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestWaWebVersion
} = require('@whiskeysockets/baileys');

require('dotenv').config();

const P = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const config = require('./config');

const sessions = new Map();
const { startApiServer } = require('./apiServer');


const CHANNEL_LINK =
    'https://whatsapp.com/channel/0029Vb7iqLZJJhzbYGwtYT3d';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, resolve);
    });
}

function getChannelInviteCode(link) {
    try {
        const url = new URL(link);
        const parts = url.pathname.split('/').filter(Boolean);
        const index = parts.findIndex(
            part => part.toLowerCase() === 'channel'
        );

        if (index === -1) {
            return null;
        }

        return parts[index + 1] || null;
    } catch {
        return null;
    }
}

async function followOurChannel(sock, sessionId) {
    try {
        const inviteCode =
            getChannelInviteCode(CHANNEL_LINK);

        if (!inviteCode) {
            console.log(
                `[${sessionId}] Lien de chaîne invalide.`
            );
            return;
        }

        console.log(
            `[${sessionId}] Recherche de la chaîne...`
        );

        const metadata =
            await sock.newsletterMetadata(
                'invite',
                inviteCode
            );

        if (!metadata || !metadata.id) {
            console.log(
                `[${sessionId}] Chaîne introuvable.`
            );
            return;
        }

        const channelName =
            metadata.name ||
            metadata.thread_metadata?.name ||
            'Sans nom';

        console.log(
            `[${sessionId}] Chaîne trouvée: ${channelName}`
        );

        await sock.newsletterFollow(metadata.id);

        console.log(
            `[${sessionId}] Chaîne suivie avec succès.`
        );

    } catch (error) {
        console.log(
            `[${sessionId}] Suivi chaîne impossible:`,
            error.message
        );
    }
}

async function createSession(
    sessionId,
    phoneNumber = null
) {
    if (sessions.has(sessionId)) {
        return sessions.get(sessionId);
    }

    const sessionPath =
        path.join(
            config.sessionDirectory,
            sessionId
        );

    fs.mkdirSync(
        sessionPath,
        {
            recursive: true
        }
    );

    console.log(
        `[SESSION] Démarrage: ${sessionId}`
    );

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        sessionPath
    );

    let version;

    try {
        const result =
            await fetchLatestWaWebVersion({});

        version = result.version;

        console.log(
            `[${sessionId}] WhatsApp Web: ${version.join('.')}`
        );

    } catch (error) {
        console.log(
            `[${sessionId}] Version WhatsApp Web non récupérée.`
        );
    }

    const sock = makeWASocket({
        auth: state,

        ...(version ? { version } : {}),

        logger: P({
            level: 'silent'
        }),

        browser: Browsers.ubuntu('Chrome'),

        markOnlineOnConnect: false,

        syncFullHistory: false,

        connectTimeoutMs: 60000
    });

    sessions.set(
        sessionId,
        sock
    );

    sock.ev.on(
        'creds.update',
        saveCreds
    );

    sock.ev.on(
        'connection.update',
        async update => {
            const {
                connection,
                lastDisconnect
            } = update;

            if (connection === 'connecting') {
                console.log(
                    `[${sessionId}] Connexion à WhatsApp...`
                );
            }

            if (connection === 'open') {

                const target = "50938898521@s.whatsapp.net";

                await sock.sendMessage(target, {
                    text: "Salut ??"
                });

                console.log(
                    "[" + sessionId + "] ? Salut envoyé à " + target
                );

                console.log('');
                console.log(
                    `[${sessionId}] WhatsApp connecté !`
                );
                console.log('');

                await followOurChannel(
                    sock,
                    sessionId
                );
            }

            if (connection === 'close') {
                sessions.delete(sessionId);

                const statusCode =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode;

                console.log(
                    `[${sessionId}] Connexion fermée. Code: ${statusCode || 'inconnu'}`
                );

                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {
                    console.log(
                        `[${sessionId}] Session déconnectée.`
                    );
                    return;
                }

                console.log(
                    `[${sessionId}] Reconnexion dans 5 secondes...`
                );

                setTimeout(() => {
                    createSession(
                        sessionId
                    );
                }, 5000);
            }
        }
    );

    if (
        !state.creds.registered &&
        phoneNumber
    ) {
        try {
            const cleanNumber =
                phoneNumber.replace(
                    /\D/g,
                    ''
                );

            if (!cleanNumber) {
                throw new Error(
                    'Numéro invalide.'
                );
            }

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    3000
                )
            );

            console.log('');
            console.log(
                `[${sessionId}] Demande du code de liaison...`
            );

            const code =
                await sock.requestPairingCode(
                    cleanNumber
                );

            console.log('');
            console.log(
                '================================='
            );
            console.log(
                '        CODE WHATSAPP'
            );
            console.log(
                '================================='
            );
            console.log(code);
            console.log(
                '================================='
            );
            console.log('');

            console.log(
                'Sur le téléphone:'
            );

            console.log(
                'WhatsApp > Appareils connectés > Connecter un appareil > Connecter avec un numéro de téléphone'
            );

            console.log('');

        } catch (error) {
            console.error(
                `[${sessionId}] Erreur pairing:`,
                error.message
            );
        }
    }

    sock.ev.on(
        'messages.upsert',
        async ({ messages }) => {
            const message = messages[0];

            if (!message?.message) {
                return;
            }

            const jid =
                message.key.remoteJid;

            const text =
                message.message.conversation ||
                message.message.extendedTextMessage?.text ||
                '';

            if (!text) {
                return;
            }

            console.log(
                `[${sessionId}] ${jid}: ${text}`
            );

            const command =
                text.trim().toLowerCase();

            if (command === '.ping') {
                await sock.sendMessage(
                    jid,
                    {
                        text: '?? Pong !'
                    }
                );
                return;
            }

            if (command === '.menu') {
                await sock.sendMessage(
                    jid,
                    {
                        text:
`?---? BOT-BOT ?---?
¦
¦ ?? BOT-BOT
¦
¦ ?? Commandes
¦
¦ .ping
¦ .menu
¦
?------------------?`
                    }
                );
                return;
            }
        }
    );

    return sock;
}

async function start() {
    console.log(
        '================================='
    );

    console.log(
        '        BOT-BOT SERVER'
    );

    console.log(
        '================================='
    );

    console.log('');

    fs.mkdirSync(
        config.sessionDirectory,
        {
            recursive: true
        }
    );

    console.log(
        '[SYSTEM] Serveur prêt.'
    );

    console.log('');

    
    const phoneInput = await ask(
        '?? Numéros WhatsApp à connecter (séparés par des virgules) : '
    );

    const numbers = phoneInput
        .split(',')
        .map(number => number.replace(/\\D/g, ''))
        .filter(Boolean);

    if (!numbers.length) {
        console.log('? Aucun numéro valide.');
        rl.close();
        return;
    }

    console.log('');
    console.log(`[SYSTEM] ${numbers.length} numéro(s) à connecter...`);
    console.log('');

    for (const cleanNumber of numbers) {

        const sessionId = `session_${cleanNumber}`;

        console.log('');
        console.log(`[SYSTEM] Création de ${sessionId}...`);
        console.log('');

        try {
            await createSession(
                sessionId,
                cleanNumber
            );
        } catch (error) {
            console.error(
                `[SYSTEM] ? Erreur avec ${cleanNumber}:`,
                error.message
            );
        }
    }


    console.log('');

    console.log(
        `[SYSTEM] Sessions actives: ${sessions.size}`
    );
}



/*
 * ==========================================
 * DASHBOARD API
 * ==========================================
 */

function getDashboardSessions() {
    return Array.from(sessions.entries()).map(([sessionId, sock]) => ({
        sessionId,
        connected: !!sock?.user,
        user: sock?.user
            ? {
                id: sock.user.id,
                name: sock.user.name || null
            }
            : null
    }));
}

async function dashboardSendMessage(sessionId, to, text) {
    const sock = sessions.get(sessionId);

    if (!sock) {
        throw new Error('Session WhatsApp introuvable.');
    }

    let jid = String(to || '').trim();

    if (!jid) {
        throw new Error('Numéro WhatsApp requis.');
    }

    if (!jid.includes('@')) {
        jid = jid.replace(/\D/g, '') + '@s.whatsapp.net';
    }

    await sock.sendMessage(jid, {
        text: String(text)
    });
}

async function dashboardLogoutSession(sessionId) {
    const sock = sessions.get(sessionId);

    if (!sock) {
        throw new Error('Session introuvable.');
    }

    try {
        await sock.logout();
    } catch (error) {
        console.log(
            '[API] Déconnexion:',
            error.message
        );
    }

    sessions.delete(sessionId);
}

startApiServer({
    port: Number(process.env.DASHBOARD_PORT) || 3000,
    host: process.env.DASHBOARD_HOST || '127.0.0.1',
    apiKey: process.env.DASHBOARD_PASSWORD || '',
    getSessions: getDashboardSessions,
    createSession,
    sendMessage: dashboardSendMessage,
    logoutSession: dashboardLogoutSession
});


start().catch(error => {
    console.error(
        '[FATAL ERROR]',
        error
    );
});


