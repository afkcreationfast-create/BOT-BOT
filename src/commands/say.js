module.exports = {
    name: 'say',

    async execute(sock, jid, args) {
        if (!args.length) {
            await sock.sendMessage(jid, {
                text: '❌ Utilisation : .say <texte>'
            });
            return;
        }

        await sock.sendMessage(jid, {
            text: args.join(' ')
        });
    }
};
