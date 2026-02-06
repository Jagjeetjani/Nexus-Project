document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH CHECK ---
    const user = JSON.parse(localStorage.getItem('nexus_user'));
    if (!user) {
        window.location.href = 'landing.html';
        return;
    }

    // --- GREETING & ROLE CHECK ---
    const greeting = document.querySelector('.greeting h1');
    if (greeting) {
        if (user.role === 'admin' || user.role === 'commander') {
            greeting.innerHTML = `Welcome, <span class="highlight" style="color: var(--neon-red) !important;">Commander ${user.username}</span>`;
        } else {
            greeting.innerHTML = `Hello, <span class="highlight">Cadet ${user.username}</span>`;
        }
    }

    initNavigation();
    initTabs();
    initClock();

    // BACKEND INTEGRATION
    fetchMenu();
    fetchTimetable();
    fetchMail();
    fetchLostFound();
    fetchMarket();
    fetchTravel();
});

// --- Navigation Logic ---
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

// --- Tab Logic ---
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Hide all within specific section
            const parentSection = btn.closest('.sector');
            parentSection.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const targetTabId = `tab-${btn.getAttribute('data-tab')}`;
            document.getElementById(targetTabId).classList.add('active');
        });
    });
}

// --- Utility: Clock ---
function initClock() {
    const timeEl = document.getElementById('clock');
    const dateEl = document.getElementById('current-date');
    if (!timeEl) return;

    function update() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    update();
    setInterval(update, 60000);
}

// --- Utility: Modal ---
window.toggleModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('active');
}

// --- SMART NAVIGATE LOGIC ---
window.calculateRoute = function () {
    const from = document.getElementById('nav-from').value;
    const to = document.getElementById('nav-to').value;
    const resultBox = document.getElementById('nav-result');
    const resultText = document.getElementById('nav-text');

    if (from === to) {
        resultBox.style.display = 'block';
        resultText.textContent = "You are already there!";
        return;
    }

    // Simple Graph Mock
    const routes = {
        "Gate-Senate": "Walk Straight 5 mins via Main Avenue.",
        "Gate-Library": "Take Right, 7 mins walk past LHC.",
        "Gate-Brahmaputra": "Take Left, 10 mins walk via Hostel Rd.",
        "Gate-LHC": "Take Right, 6 mins walk.",
        "Senate-Library": "Walk 3 mins East.",
        "Senate-LHC": "Walk 5 mins South-East.",
        "Senate-Brahmaputra": "Walk 8 mins West.",
        "Library-LHC": "Walk 2 mins South.",
        "Library-Brahmaputra": "Long walk! 12 mins via Ring Road."
    };

    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;

    const instruction = routes[key1] || routes[key2] || "Route calculating... Use Main Ring Road (15 mins).";

    resultBox.style.display = 'block';
    resultText.innerHTML = `<i class="fa-solid fa-person-walking"></i> ${instruction}`;
}


// --- API: MARKETPLACE ---
async function fetchMarket() {
    const grid = document.getElementById('main-market-grid');
    const pendingContainer = document.getElementById('admin-pending-approvals');
    const pendingGrid = document.getElementById('pending-grid');

    if (!grid) return;

    try {
        const res = await fetch('/api/market');
        const data = await res.json();
        const user = JSON.parse(localStorage.getItem('nexus_user'));
        const isAdmin = user && (user.role === 'admin' || user.role === 'commander');

        // Filter items
        const approved = data.filter(i => i.status === 'approved');
        const pending = data.filter(i => i.status === 'pending');

        // Render Approved Items
        if (approved.length > 0) {
            grid.innerHTML = approved.map(item => `
                <div class="market-card">
                    <div class="market-img" style="background-color: ${item.color || '#334155'}; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-box-open" style="font-size:2rem; color:#fff;"></i>`}
                    </div>
                    <div class="market-info">
                        <h4>${item.item}</h4>
                        <p class="price">${item.price}</p>
                        <small>Seller: ${item.seller}</small>
                        <button class="btn-sm" onclick="alert('Contact ${item.seller}!')">Buy</button>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p style="padding:10px;">No active listings.</p>';
        }

        // Render Pending Items (Admin Only)
        if (isAdmin && pendingContainer && pendingGrid) {
            if (pending.length > 0) {
                pendingContainer.style.display = 'block';
                pendingGrid.innerHTML = pending.map(item => `
                    <div class="market-card" style="border: 1px solid var(--neon-cyan);">
                        <div class="market-img" style="background-color: ${item.color || '#334155'}; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-box-open" style="font-size:2rem; color:#fff;"></i>`}
                        </div>
                        <div class="market-info">
                            <h4>${item.item} <span style="color: yellow; font-size: 0.8rem;">(PENDING)</span></h4>
                            <p class="price">${item.price}</p>
                            <small>Seller: ${item.seller}</small>
                            <div style="display: flex; gap: 5px; margin-top: 5px;">
                                <button class="btn-sm" style="background: var(--neon-green);" onclick="approveItem(${item.id})">Approve</button>
                                <button class="btn-sm" style="background: var(--neon-red);" onclick="rejectItem(${item.id})">Reject</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                pendingContainer.style.display = 'none';
            }
        }

    } catch (e) { console.error(e); }
}

window.approveItem = async function (id) {
    if (!confirm("Approve this item?")) return;
    await fetch('/api/market/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approved' })
    });
    fetchMarket(); // refresh
}

window.rejectItem = async function (id) {
    if (!confirm("DELETE this item?")) return;
    await fetch('/api/market/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' })
    });
    fetchMarket(); // refresh
}

window.postSellItem = async function () {
    const item = document.getElementById('sell-item').value;
    const price = document.getElementById('sell-price').value;
    const seller = document.getElementById('sell-seller').value;
    const image = document.getElementById('sell-image').value; // Now this element exists

    if (!item || !price) return alert("Fill details");

    await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, price, seller, image, color: '#3b82f6' })
    });

    alert("Item submitted to Admin!");
    toggleModal('modal-sell');
    // Clear inputs
    document.getElementById('sell-item').value = '';
    document.getElementById('sell-price').value = '';
    document.getElementById('sell-seller').value = '';
    document.getElementById('sell-image').value = '';
}

// --- API: TRAVEL POOL ---
async function fetchTravel() {
    const list = document.getElementById('travel-list');
    if (!list) return;
    try {
        const res = await fetch('/api/travel');
        const data = await res.json();
        if (data.length > 0) {
            list.innerHTML = data.map(t => `
                <div class="travel-card" style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:5px;">
                    <div class="route">
                        <b>${t.from}</b> <i class="fa-solid fa-arrow-right"></i> <b>${t.to}</b>
                    </div>
                    <div class="meta" style="font-size:0.8rem; color:#aaa; margin-top:5px;">
                        <span><i class="fa-solid fa-clock"></i> ${t.time}</span> | 
                        <span>Contact: ${t.contact}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { }
}

window.postTravel = async function () {
    const from = document.getElementById('travel-from').value;
    const to = document.getElementById('travel-to').value;
    const time = document.getElementById('travel-time').value;
    const contact = document.getElementById('travel-contact').value;

    if (!from || !to) return alert("Fill details");

    await fetch('/api/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, time, contact })
    });
    alert("Trip Posted!");
    fetchTravel(); // refresh
}

// --- API: LOST FOUND ---
async function fetchLostFound() {
    const listContainer = document.querySelector('#tab-lostfound .list-view');
    if (!listContainer) return;

    try {
        const response = await fetch('/api/lostfound'); // Ensure this endpoint exists
        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                listContainer.innerHTML = data.map(item => `
                    <div class="list-item" style="opacity: ${item.claimed ? '0.5' : '1'}">
                        <span class="icon warning"><i class="fa-solid fa-glasses"></i></span>
                        <div class="info">
                            <h4 style="text-decoration: ${item.claimed ? 'line-through' : 'none'}">${item.item}</h4>
                            <p>${item.description} - ${item.location}</p>
                            ${item.claimed ? '<small style="color:#0f0">Claimed!</small>' : ''}
                        </div>
                        ${!item.claimed ? `<button class="btn-text" onclick="claimItem(${item.id})">Claim</button>` : ''}
                    </div>
                `).join('');
            } else {
                listContainer.innerHTML = '<div style="padding:1rem; text-align:center; color:#888;">No lost items reported.</div>';
            }
        }
    } catch (e) { }
}

window.claimItem = async function (id) {
    if (confirm("Confirm this is yours?")) {
        await fetch('/api/lostfound/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchLostFound();
    }
}

// --- EXISTING FETCHERS ---
async function fetchMenu() {
    const container = document.querySelector('.mess-card .widget-content');
    if (!container) return;
    try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        const todaysMenu = data.find(m => m.day === today) || data[0];

        if (todaysMenu) {
            container.innerHTML = `
                <div class="food-display">
                    <div class="food-img placeholder-glow" style="background: linear-gradient(45deg, #ff6b6b, #ff8e53);"></div>
                    <div class="food-info">
                        <h3>${todaysMenu.lunch}</h3>
                        <p>${todaysMenu.breakfast} (Bkfast) • ${todaysMenu.dinner} (Dinner)</p>
                        <small><i class="fa-solid fa-clock"></i> Today's Special (${todaysMenu.day})</small>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-neon"><i class="fa-solid fa-check-to-slot"></i> Vote</button>
                    <button class="btn-text">View Weekly Menu</button>
                </div>
            `;
        }
    } catch (error) { }
}

async function fetchTimetable() {
    const listContainer = document.querySelector('.timetable-card .class-list');
    if (!listContainer) return;
    try {
        const response = await fetch('/api/timetable');
        const data = await response.json();
        if (data.length > 0) {
            listContainer.innerHTML = data.map((item, index) => `
                <li class="class-item ${index === 0 ? 'live' : ''}">
                    <span class="time">${item.time}</span>
                    <div class="details">
                        <span class="subject">${item.subject}</span>
                        <span class="location">${item.room}</span>
                    </div>
                    ${index === 0 ? '<span class="status-badge">LIVE</span>' : ''}
                </li>
            `).join('');
        } else {
            listContainer.innerHTML = '<li class="class-item">No classes today</li>';
        }
    } catch (error) { }
}

async function fetchMail() {
    const listContainer = document.querySelector('.mail-card .mail-list');
    const badge = document.querySelector('.mail-card .badge-count');
    if (!listContainer) return;
    try {
        const response = await fetch('/api/mail');
        const data = await response.json();
        if (badge) badge.textContent = data.length;
        const recentMail = data.slice(0, 3);
        listContainer.innerHTML = recentMail.map(mail => `
            <li class="mail-item">
                <div class="mail-icon"><i class="fa-solid fa-envelope"></i></div>
                <div class="mail-content">
                    <span class="sender">${mail.sender}</span>
                    <span class="subject">${mail.subject}</span>
                </div>
            </li>
        `).join('');
    } catch (error) { }
}
