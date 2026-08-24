module.exports = {
    name: 'menu',

    async execute(sock, jid, args, context) {
        const prefix = context?.prefix || '.';

        const text = `╭───〔 🤖 BOT-BOT 〕───╮
│
│ 👑 BOT INFORMATION
│ • Nom : BOT-BOT
│ • Prefix : ${prefix}
│ • Version : 1.0.0
│
│ 📌 COMMANDES
│
│ • ${prefix}ping
│ • ${prefix}menu
│ • ${prefix}alive
│ • ${prefix}botinfo
│ • ${prefix}runtime
│ • ${prefix}jid
│ • ${prefix}say <texte>
│ • ${prefix}echo <texte>
│ • ${prefix}time
│ • ${prefix}date
│ • ${prefix}owner
│ • ${prefix}help
│
╰────────────────────╯`;

        await sock.sendMessage(jid, {
            text
        });
    }
};
