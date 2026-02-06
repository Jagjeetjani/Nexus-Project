// --- Login Page Logic ---
let currentRole = null;

window.expandSide = function (side) {
    const left = document.querySelector('.side-left');
    const right = document.querySelector('.side-right');

    if (side === 'left') {
        right.classList.add('dimmed');
    } else {
        left.classList.add('dimmed');
    }
};

window.resetSides = function () {
    document.querySelector('.side-left').classList.remove('dimmed');
    document.querySelector('.side-right').classList.remove('dimmed');
};

window.openLoginModal = function (role) {
    currentRole = role;
    const modal = document.getElementById('auth-modal');
    const card = modal.querySelector('.auth-card');
    const title = document.getElementById('auth-title');
    const icon = document.getElementById('auth-icon');
    const userDisplay = document.getElementById('login-user');

    // Reset Themes
    card.classList.remove('theme-cadet', 'theme-commander');
    // Hide error
    document.getElementById('login-error').style.display = 'none';

    if (role === 'cadet') {
        card.classList.add('theme-cadet');
        title.textContent = "CADET VERIFICATION";
        icon.className = "fa-solid fa-user-astronaut";
        userDisplay.placeholder = "Student ID / Name";
    } else {
        card.classList.add('theme-commander');
        title.textContent = "COMMAND OVERRIDE";
        icon.className = "fa-solid fa-user-shield";
        userDisplay.placeholder = "Admin ID";
    }

    modal.classList.add('active');
};

window.closeLoginModal = function () {
    document.getElementById('auth-modal').classList.remove('active');
};

window.handleLogin = function (e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-submit');
    const errorMsg = document.getElementById('login-error');
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    btn.textContent = "AUTHENTICATING...";
    btn.disabled = true;
    errorMsg.style.display = 'none';

    // --- DIRECT MOCK LOGIN ---
    setTimeout(() => {
        let valid = false;
        let role = '';

        if (currentRole === 'commander') {
            if (username === 'admin' && password === 'admin') {
                valid = true;
                role = 'admin';
            }
        } else {
            // Accept any student login with '1234'
            if (password === '1234') {
                valid = true;
                role = 'student';
            }
        }

        if (valid) {
            const user = { username, role, id: Date.now() };
            localStorage.setItem('nexus_user', JSON.stringify(user));

            btn.textContent = "ACCESS GRANTED";
            btn.style.background = "#4ade80";

            setTimeout(() => {
                window.location.href = (role === 'admin') ? 'admin.html' : 'index.html';
            }, 800);
        } else {
            btn.textContent = "AUTH FAILED";
            btn.disabled = false;
            errorMsg.textContent = "❌ Invalid Credentials";
            errorMsg.style.display = 'block';
            setTimeout(() => btn.textContent = "CONFIRM IDENTITY", 2000);
        }
    }, 1000);
};
