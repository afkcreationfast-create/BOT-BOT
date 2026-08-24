module.exports = {
    name: 'date',

    async execute(sock, jid) {
        const now = new Date();

        await sock.sendMessage(jid, {
            text: `📅 Date actuelle :

${now.toLocaleDateString('fr-FR')}`
        });
    }
};
