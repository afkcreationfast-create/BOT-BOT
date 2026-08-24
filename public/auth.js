const BOT_AUTH_KEY = 'bot-bot-auth';

function getAuthToken() {
    return localStorage.getItem(BOT_AUTH_KEY) || '';
}

function setAuthToken(token) {
    localStorage.setItem(BOT_AUTH_KEY, token);
}

function clearAuthToken() {
    localStorage.removeItem(BOT_AUTH_KEY);
}

function showLogin() {
    let login = document.getElementById('botLogin');

    if (!login) {
        login = document.createElement('div');
        login.id = 'botLogin';

        login.innerHTML = `
            <div class="bot-login-card">
                <div class="bot-login-logo">??</div>
                <h1>BOT-BOT</h1>
                <p>Dashboard propri�taire</p>

                <form id="botLoginForm">
                    <input
                        id="botPassword"
                        type="password"
                        placeholder="Mot de passe"
                        autocomplete="current-password"
                        required
                    >

                    <button type="submit">
                        Se connecter
                    </button>

                    <div id="botLoginError"></div>
                </form>
            </div>
        `;

        const style = document.createElement('style');

        style.textContent = `
            #botLogin {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #070a0f;
            }

            #botLogin.hidden {
                display: none;
            }

            .bot-login-card {
                width: 360px;
                max-width: calc(100vw - 40px);
                padding: 35px;
                border-radius: 20px;
                background: #111923;
                color: white;
                text-align: center;
                box-shadow: 0 20px 70px rgba(0,0,0,.5);
            }

            .bot-login-logo {
                font-size: 45px;
                margin-bottom: 10px;
            }

            .bot-login-card h1 {
                margin: 0;
            }

            .bot-login-card p {
                opacity: .65;
                margin-bottom: 25px;
            }

            #botLoginForm {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }

            #botPassword {
                box-sizing: border-box;
                width: 100%;
                padding: 14px;
                border-radius: 10px;
                border: 1px solid #293444;
                background: #080d14;
                color: white;
                font-size: 16px;
                outline: none;
            }

            #botLoginForm button {
                padding: 14px;
                border: 0;
                border-radius: 10px;
                background: #20d768;
                color: #061008;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
            }

            #botLoginError {
                min-height: 20px;
                color: #ff6b6b;
                font-size: 14px;
            }

            body.bot-locked > *:not(#botLogin) {
                visibility: hidden;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(login);

        document
            .getElementById('botLoginForm')
            .addEventListener('submit', async event => {
                event.preventDefault();

                const password =
                    document.getElementById('botPassword').value;

                const error =
                    document.getElementById('botLoginError');

                error.textContent = 'V�rification...';

                try {
                    const response = await fetch('/api/health', {
                        headers: {
                            Authorization: `Bearer ${password}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Mot de passe incorrect.');
                    }

                    setAuthToken(password);

                    login.classList.add('hidden');
                    document.body.classList.remove('bot-locked');

                    window.startDashboard();
                } catch {
                    clearAuthToken();
                    error.textContent = 'Mot de passe incorrect.';
                }
            });
    }

    login.classList.remove('hidden');
    document.body.classList.add('bot-locked');
}

async function checkAuthentication() {
    const token = getAuthToken();

    if (!token) {
        showLogin();
        return false;
    }

    try {
        const response = await fetch('/api/health', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            clearAuthToken();
            showLogin();
            return false;
        }

        document.body.classList.remove('bot-locked');

        const login = document.getElementById('botLogin');
        if (login) {
            login.classList.add('hidden');
        }

        return true;
    } catch {
        showLogin();
        return false;
    }
}

