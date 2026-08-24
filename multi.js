const fs = require('fs');

const path = './src/index.js';
let s = fs.readFileSync(path, 'utf8');

const oldBlock = /const phoneNumber\s*=\s*await ask\([\s\S]*?await createSession\(\s*sessionId,\s*cleanNumber\s*\);/;

const newBlock = `
    const phoneInput = await ask(
        '📱 Numéros WhatsApp à connecter (séparés par des virgules) : '
    );

    const numbers = phoneInput
        .split(',')
        .map(number => number.replace(/\\\\D/g, ''))
        .filter(Boolean);

    if (!numbers.length) {
        console.log('❌ Aucun numéro valide.');
        rl.close();
        return;
    }

    console.log('');
    console.log(\`[SYSTEM] \${numbers.length} numéro(s) à connecter...\`);
    console.log('');

    for (const cleanNumber of numbers) {

        const sessionId = \`session_\${cleanNumber}\`;

        console.log('');
        console.log(\`[SYSTEM] Création de \${sessionId}...\`);
        console.log('');

        try {
            await createSession(
                sessionId,
                cleanNumber
            );
        } catch (error) {
            console.error(
                \`[SYSTEM] ❌ Erreur avec \${cleanNumber}:\`,
                error.message
            );
        }
    }
`;

if (!oldBlock.test(s)) {
    console.log('❌ Bloc de démarrage introuvable.');
    process.exit(1);
}

s = s.replace(oldBlock, newBlock);

fs.writeFileSync(path, s, 'utf8');

console.log('✅ src/index.js modifié pour plusieurs WhatsApp.');
