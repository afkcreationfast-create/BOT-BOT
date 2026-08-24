const fs = require('fs');
const path = require('path');

const commands = new Map();

const commandsPath = path.join(
    __dirname,
    '..',
    'commands'
);

if (fs.existsSync(commandsPath)) {
    const files = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith('.js'));

    for (const file of files) {
        try {
            const command = require(
                path.join(commandsPath, file)
            );

            if (command?.name && typeof command.execute === 'function') {
                commands.set(command.name.toLowerCase(), command);
            }
        } catch (error) {
            console.error(
                `[COMMAND] Erreur avec ${file}:`,
                error.message
            );
        }
    }
}

console.log(
    `[COMMAND] ${commands.size} commandes chargées.`
);

async function handleMessage(sock, message) {
    if (!message?.message) return;

    const jid = message.key.remoteJid;

    if (!jid) return;

    const text =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        '';

    if (!text) return;

    const prefix = '.';

    if (!text.startsWith(prefix)) return;

    const input = text.slice(prefix.length).trim();

    if (!input) return;

    const parts = input.split(/\s+/);

    const commandName =
        parts.shift().toLowerCase();

    const args = parts;

    const command =
        commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(
            sock,
            jid,
            args,
            {
                prefix,
                message,
                commandName
            }
        );
    } catch (error) {
        console.error(
            `[COMMAND] ${commandName}:`,
            error.message
        );

        await sock.sendMessage(jid, {
            text: '❌ Une erreur est survenue pendant l’exécution de la commande.'
        });
    }
}

module.exports = {
    handleMessage,
    commands
};
