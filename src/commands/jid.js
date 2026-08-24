module.exports = {
    name: 'jid',

    async execute(sock, jid) {
        await sock.sendMessage(jid, {
            text: `🆔 JID de cette conversation :

${jid}`
        });
    }
};
