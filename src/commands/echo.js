module.exports = {
    name: 'echo',

    async execute(sock, jid, args) {
        if (!args.length) {
            await sock.sendMessage(jid, {
                text: '❌ Utilisation : .echo <texte>'
            });
            return;
        }

        await sock.sendMessage(jid, {
            text: `🔊 ${args.join(' ')}`
        });
    }
};
