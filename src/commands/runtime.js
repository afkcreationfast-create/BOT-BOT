const startedAt = Date.now();

module.exports = {
    name: 'runtime',

    async execute(sock, jid) {
        const seconds = Math.floor(
            (Date.now() - startedAt) / 1000
        );

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        await sock.sendMessage(jid, {
            text: `⏱️ BOT-BOT RUNTIME

📅 ${days} jour(s)
🕐 ${hours} heure(s)
⏳ ${minutes} minute(s)
⚡ ${secs} seconde(s)`
        });
    }
};
