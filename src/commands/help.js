module.exports = {
    name: 'help',

    async execute(sock, jid, args, context) {
        const prefix = context?.prefix || '.';

        await sock.sendMessage(jid, {
            text: `╭───〔 HELP 〕───╮
│
│ ${prefix}ping
│ ${prefix}menu
│ ${prefix}alive
│ ${prefix}botinfo
│ ${prefix}runtime
│ ${prefix}jid
│ ${prefix}say <texte>
│ ${prefix}echo <texte>
│ ${prefix}time
│ ${prefix}date
│ ${prefix}owner
│ ${prefix}help
│
╰────────────────╯`
        });
    }
};
