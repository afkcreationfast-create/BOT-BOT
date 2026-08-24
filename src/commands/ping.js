module.exports = {
    name: 'ping',

    async execute(sock, jid) {
        await sock.sendMessage(jid, {
            text: '🏓 Pong!'
        });
    }
};
