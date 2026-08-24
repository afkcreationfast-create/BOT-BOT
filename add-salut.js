const fs = require("fs");

const file = "./src/index.js";
let s = fs.readFileSync(file, "utf8");

const marker = "if (connection === 'open') {";
const pos = s.indexOf(marker);

if (pos === -1) {
    console.log("❌ Bloc connection === open introuvable.");
    process.exit(1);
}

const end = pos + marker.length;

const code = `

                const target = "50938898521@s.whatsapp.net";

                await sock.sendMessage(target, {
                    text: "Salut 👋"
                });

                console.log(
                    "[" + sessionId + "] ✅ Salut envoyé à " + target
                );
`;

s = s.slice(0, end) + code + s.slice(end);

fs.writeFileSync(file, s, "utf8");

console.log("✅ Envoi automatique de Salut ajouté.");
