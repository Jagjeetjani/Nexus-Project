document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH CHECK ---
    const user = JSON.parse(localStorage.getItem('nexus_user'));
    if (!user || user.role !== 'admin') {
        alert("ACCESS DENIED: COMMANDER CLEARANCE REQUIRED");
        window.location.href = 'landing.html';
        return;
    }

    initNavigation();
    initClock();
    loadAllData();
    initThemePicker();
    setupEventListeners();
});

// --- UI LOGIC ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.sector');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(sec => sec.classList.remove('active'));
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function initClock() {
    const el = document.getElementById('admin-clock');
    if (!el) return;
    setInterval(() => {
        el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }, 1000);
}

// --- STATE MANAGEMENT ---
let messData = [];
let timetableData = [];
let userData = [];

async function loadAllData() {
    try {
        const [messRes, ttRes, userRes] = await Promise.all([
            fetch('/api/menu'),
            fetch('/api/timetable'),
            fetch('/api/users')
        ]);

        messData = await messRes.json();
        timetableData = await ttRes.json();
        userData = await userRes.json();

        if (!Array.isArray(messData)) messData = []; // guard
        if (!Array.isArray(timetableData)) timetableData = [];
        if (!Array.isArray(userData)) userData = [];

        renderMessForm(); // Defaults to Monday
        renderTimetableList();
        renderUserList();
    } catch (e) {
        console.error("Load Error", e);
        showToast("❌ Failed to load system data");
    }
}

// --- MESS MANAGER LOGIC ---
function renderMessForm() {
    const day = document.getElementById('mess-day-select').value;
    const dayData = messData.find(m => m.day === day) || { breakfast: '', lunch: '', dinner: '' };

    document.getElementById('mess-breakfast').value = dayData.breakfast || '';
    document.getElementById('mess-lunch').value = dayData.lunch || '';
    document.getElementById('mess-dinner').value = dayData.dinner || '';
}

async function saveMess() {
    const day = document.getElementById('mess-day-select').value;
    const newEntry = {
        day: day,
        breakfast: document.getElementById('mess-breakfast').value,
        lunch: document.getElementById('mess-lunch').value,
        dinner: document.getElementById('mess-dinner').value
    };

    // Update Local State
    const index = messData.findIndex(m => m.day === day);
    if (index > -1) {
        messData[index] = newEntry;
    } else {
        messData.push(newEntry);
    }

    // Sync Backend
    await sendData('/api/menu', messData, 'Menu Updated');
}

// --- TIMETABLE LOGIC ---
function renderTimetableList() {
    const tbody = document.querySelector('#timetable-list tbody');
    tbody.innerHTML = timetableData.map((item, index) => `
        <tr>
            <td>${item.time}</td>
            <td>${item.subject}</td>
            <td><button class="delete-btn" onclick="deleteTimetable(${index})">DEL</button></td>
        </tr>
    `).join('');
}

async function addTimetable() {
    const time = document.getElementById('tt-time').value;
    const subject = document.getElementById('tt-subject').value;
    const room = document.getElementById('tt-room').value;

    if (!time || !subject) return showToast("⚠️ Fill required fields");

    // Convert HH:mm to 12h format simply or keep as is. Keeping simple.
    timetableData.push({ time, subject, room });
    renderTimetableList();
    await sendData('/api/timetable', timetableData, 'Class Added');

    // Clear inputs
    document.getElementById('tt-subject').value = '';
    document.getElementById('tt-room').value = '';
}

window.deleteTimetable = async function (index) {
    if (confirm('REMOVE CLASS?')) {
        timetableData.splice(index, 1);
        renderTimetableList();
        await sendData('/api/timetable', timetableData, 'Class Removed');
    }
};

// --- USER MANAGEMENT LOGIC ---
function renderUserList() {
    const tbody = document.querySelector('#user-list tbody');
    tbody.innerHTML = userData.map((u, index) => `
        <tr>
            <td>${u.username}</td>
            <td>${u.role}</td>
            <td><button class="delete-btn" onclick="deleteUser(${index})">DEL</button></td>
        </tr>
    `).join('');
}

async function addUser() {
    const username = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;

    if (!username || !role) return showToast("⚠️ Fill required fields");

    userData.push({ id: Date.now(), username, role });
    renderUserList();


    updateStats();
    await sendData('/api/users', userData, 'User Added');

    document.getElementById('user-name').value = '';
    document.getElementById('user-role').value = '';
}

window.deleteUser = async function (index) {
    if (confirm('REVOKE ACCESS?')) {
        userData.splice(index, 1);
        renderUserList();
        updateStats();
        await sendData('/api/users', userData, 'User Removed');
    }
};

function updateStats() {
    const el = document.getElementById('user-count-display');
    if (el) el.textContent = userData.length;
}

// --- MARKETPLACE LOGIC ---
async function loadMarket() {
    try {
        const res = await fetch('/api/market');
        const data = await res.json();
        const pending = data.filter(i => i.status === 'pending');
        const tbody = document.getElementById('market-tbody');
        if (tbody) {
            tbody.innerHTML = pending.map(i => `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            ${i.image ? `<img src="${i.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">` : ''}
                            <div>
                                <strong>${i.item}</strong><br>
                                <small>${i.price}</small>
                            </div>
                        </div>
                    </td>
                    <td>${i.seller}</td>
                    <td>
                        <button class="delete-btn" style="background:#4ade80; border-color:#4ade80; color:#fff;" onclick="approveMarket(${i.id}, 'approved')">✔</button>
                        <button class="delete-btn" onclick="approveMarket(${i.id}, 'delete')">✖</button>
                    </td>
                </tr>
            `).join('');

            // Add Empty State
            if (pending.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#888;">No pending approvals</td></tr>';
            }
        }
    } catch (e) { console.error("Market Load Error", e); }
}

window.approveMarket = async function (id, action) {
    await fetch('/api/market/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
    });
    loadMarket();
    showToast(`Item ${action}`);
}

// Modify loadAllData to include Market
const originalLoad = loadAllData;
loadAllData = async function () {
    await originalLoad();
    loadMarket();
}

// --- BROADCAST LOGIC ---
async function sendBroadcast() {
    const subject = document.getElementById('mail-subject').value;
    const snippet = document.getElementById('mail-body').value;

    if (!subject || !snippet) return;

    const mailData = {
        sender: 'Admin Console',
        subject,
        snippet
    };

    // Mail endpoint expects a single object to prepend
    await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mailData)
    });

    showToast('✅ Broadcast Sent');
    document.getElementById('mail-subject').value = '';
    document.getElementById('mail-body').value = '';
}


// --- UTILITIES ---
function setupEventListeners() {
    // Mess
    document.getElementById('mess-day-select').addEventListener('change', renderMessForm);
    document.getElementById('mess-save-btn').addEventListener('click', saveMess);

    // Timetable
    document.getElementById('tt-add-btn').addEventListener('click', addTimetable);

    // Users
    document.getElementById('user-add-btn').addEventListener('click', addUser);

    // Broadcast
    document.getElementById('mail-send-btn').addEventListener('click', sendBroadcast);

    // Lost & Found
    const lfBtn = document.getElementById('lf-add-btn');
    if (lfBtn) lfBtn.addEventListener('click', addLostFound);
}

// --- LOST FOUND LOGIC ---
async function addLostFound() {
    const item = document.getElementById('lf-item').value;
    const description = document.getElementById('lf-desc').value;
    const location = document.getElementById('lf-loc').value;

    if (!item || !description || !location) return showToast("⚠️ Fill all fields");

    const payload = {
        item,
        description,
        location,
        claimed: false
    };

    await sendData('/api/lostfound', payload, 'Item Reported');

    // Clear
    document.getElementById('lf-item').value = '';
    document.getElementById('lf-desc').value = '';
    document.getElementById('lf-loc').value = '';
}

function initThemePicker() {
    const picker = document.getElementById('accent-picker');
    picker.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--accent-color', e.target.value);
        // Also update RGB shadow effect helper if needed, or simple accent override
    });
}

async function sendData(url, data, successMsg) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) showToast(`✅ ${successMsg}`);
        else showToast("❌ Server Error");
    } catch (e) {
        showToast("❌ Network Error");
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        background: #333; color: #fff; padding: 12px 20px; 
        margin-top: 10px; border-radius: 4px; border: 1px solid var(--accent-color);
        box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-family: sans-serif;
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
