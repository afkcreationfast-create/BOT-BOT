module.exports = {
    name: 'alive',

    async execute(sock, jid) {
        await sock.sendMessage(jid, {
            text: '🤖 BOT-BOT est actuellement en ligne !\n\n✅ WhatsApp connecté\n⚡ Système opérationnel'
        });
    }
};
