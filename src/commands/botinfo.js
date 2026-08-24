module.exports = {
    name: 'botinfo',

    async execute(sock, jid) {
        await sock.sendMessage(jid, {
            text: `╭───〔 BOT-BOT INFO 〕───╮
│
│ 🤖 Nom : BOT-BOT
│ 📦 Version : 1.0.0
│ ⚙️ Prefix : .
│ 🟢 Status : Online
│
╰──────────────────────╯`
        });
    }
};
