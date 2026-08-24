module.exports = {
    name: 'time',

    async execute(sock, jid) {
        const now = new Date();

        await sock.sendMessage(jid, {
            text: `🕐 Heure actuelle :

${now.toLocaleTimeString('fr-FR')}`
        });
    }
};
