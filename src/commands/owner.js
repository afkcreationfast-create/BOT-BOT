module.exports = {
    name: 'owner',

    async execute(sock, jid) {
        await sock.sendMessage(jid, {
            text: `👑 BOT OWNER

🤖 BOT-BOT
👤 Owner : Ange Thedlyn`
        });
    }
};
