# BOT-BOT — Dashboard + API

Cette version ajoute une interface web locale au projet BOT-BOT.

## 1. Fichiers

- `src/index.js` : serveur WhatsApp + gestion des sessions + commandes + intégration API
- `src/apiServer.js` : API HTTP + serveur de fichiers + flux SSE
- `src/config.js` : port/hôte de l'API
- `public/index.html` : interface
- `public/styles.css` : design
- `public/app.js` : logique du dashboard

## 2. Dépendance

Depuis la racine du projet :

```powershell
npm install express
```

Note : la version fournie utilise le module HTTP natif de Node, donc Express n'est finalement pas requis. Tu peux donc simplement utiliser les dépendances déjà présentes.

## 3. Installation

Copie les fichiers de ce dossier dans ton projet BOT-BOT en conservant la structure.

Important : ne copie jamais `src/sessions/` dans GitHub.

## 4. Démarrage

```powershell
node --check .\src\index.js
node --check .\src\apiServer.js
npm start
```

Puis ouvre :

```text
http://127.0.0.1:3000
```

## 5. Fonctionnalités

- Dashboard
- Sessions WhatsApp en direct
- Ajout d'un numéro
- Affichage du code de liaison
- Statuts connecting / pairing / connected / reconnecting
- Flux des messages reçus
- Envoi d'un message depuis le dashboard
- Déconnexion d'une session
- Logs en direct
- Mise à jour automatique

## 6. Accès distant

Par défaut l'API écoute sur `127.0.0.1`, donc elle n'est pas exposée directement sur Internet.

Pour un VPS, configure les variables d'environnement :

```powershell
$env:BOT_API_HOST="0.0.0.0"
$env:BOT_API_PORT="3000"
$env:BOT_API_KEY="CHANGE-ME"
npm start
```

Si l'API est exposée publiquement, utilise un vrai reverse proxy HTTPS et une clé API forte.

## 7. Git

Après installation et test :

```powershell
git status
git add .
git commit -m "Add BOT-BOT web dashboard and API"
git push
```
