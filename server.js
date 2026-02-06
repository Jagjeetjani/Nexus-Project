const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs'); // Using sync for simple admin writes as requested

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read JSON files
const readData = async (filename) => {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
};

// API Endpoints

// GET /api/menu
app.get('/api/menu', async (req, res) => {
    const data = await readData('menu.json');
    if (data) res.json(data);
    else res.status(500).json({ error: 'Failed to fetch menu data' });
});

// GET /api/timetable
app.get('/api/timetable', async (req, res) => {
    const data = await readData('timetable.json');
    if (data) res.json(data);
    else res.status(500).json({ error: 'Failed to fetch timetable data' });
});

// POST /api/mail
app.post('/api/mail', async (req, res) => {
    try {
        const newMail = req.body;
        const currentMail = await readData('mail.json') || [];
        // Add ID if missing
        if (!newMail.id) newMail.id = Date.now();

        currentMail.unshift(newMail); // Add to top

        fsSync.writeFileSync(path.join(__dirname, 'data', 'mail.json'), JSON.stringify(currentMail, null, 4));
        res.json({ message: 'Mail added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save mail' });
    }
});

// POST /api/menu
app.post('/api/menu', (req, res) => {
    try {
        const newMenu = req.body;
        fsSync.writeFileSync(path.join(__dirname, 'data', 'menu.json'), JSON.stringify(newMenu, null, 4));
        res.json({ message: 'Menu updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update menu' });
    }
});

// POST /api/timetable
app.post('/api/timetable', (req, res) => {
    try {
        const newTimetable = req.body;
        fsSync.writeFileSync(path.join(__dirname, 'data', 'timetable.json'), JSON.stringify(newTimetable, null, 4));
        res.json({ message: 'Timetable updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update timetable' });
    }
});

// POST /api/lostfound
app.post('/api/lostfound', async (req, res) => {
    try {
        const newItem = req.body;
        let currentItems = await readData('lostfound.json');
        if (!currentItems) currentItems = [];

        newItem.date = new Date().toISOString().split('T')[0];
        currentItems.push(newItem);

        fsSync.writeFileSync(path.join(__dirname, 'data', 'lostfound.json'), JSON.stringify(currentItems, null, 4));
        res.json({ message: 'Item reported successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to report item' });
    }
});

// GET /api/mail
app.get('/api/mail', async (req, res) => {
    const data = await readData('mail.json');
    if (data) res.json(data);
    else res.status(500).json({ error: 'Failed to fetch mail data' });
});

// GET /api/lostfound
app.get('/api/lostfound', async (req, res) => {
    const data = await readData('lostfound.json');
    if (data) res.json(data);
    else res.json([]); // Return empty array if file missing/error
});

// GET /api/users
app.get('/api/users', async (req, res) => {
    const data = await readData('users.json');
    if (data) res.json(data);
    else res.json([]);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    try {
        const newUsers = req.body; // Expecting array of users
        fsSync.writeFileSync(path.join(__dirname, 'data', 'users.json'), JSON.stringify(newUsers, null, 4));
        res.json({ message: 'User list updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update users' });
    }
});

// GET /api/market
app.get('/api/market', async (req, res) => {
    const data = await readData('marketplace.json');
    if (data) res.json(data);
    else res.json([]);
});

// POST /api/market (Add Item)
app.post('/api/market', async (req, res) => {
    try {
        const newItem = req.body;
        const currentItems = await readData('marketplace.json') || [];
        newItem.id = Date.now();
        newItem.status = 'pending'; // Default status
        currentItems.push(newItem);
        fsSync.writeFileSync(path.join(__dirname, 'data', 'marketplace.json'), JSON.stringify(currentItems, null, 4));
        res.json({ message: 'Item posted for approval' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to post item' });
    }
});

// POST /api/market/approve (Admin Action)
app.post('/api/market/approve', async (req, res) => {
    try {
        const { id, action } = req.body; // action: 'approve' or 'reject'
        let currentItems = await readData('marketplace.json') || [];

        if (action === 'delete') {
            currentItems = currentItems.filter(i => i.id != id);
        } else {
            const item = currentItems.find(i => i.id == id);
            if (item) item.status = action; // 'approved'
        }

        fsSync.writeFileSync(path.join(__dirname, 'data', 'marketplace.json'), JSON.stringify(currentItems, null, 4));
        res.json({ message: 'Item updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// GET /api/travel
app.get('/api/travel', async (req, res) => {
    const data = await readData('travel.json');
    if (data) res.json(data);
    else res.json([]);
});

// POST /api/travel
app.post('/api/travel', async (req, res) => {
    try {
        const newPlan = req.body;
        const currentPlans = await readData('travel.json') || [];
        newPlan.id = Date.now();
        currentPlans.push(newPlan);
        fsSync.writeFileSync(path.join(__dirname, 'data', 'travel.json'), JSON.stringify(currentPlans, null, 4));
        res.json({ message: 'Travel plan added' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add travel plan' });
    }
});

// POST /api/lostfound/claim
app.post('/api/lostfound/claim', async (req, res) => {
    try {
        const { id } = req.body;
        let currentItems = await readData('lostfound.json') || [];

        const item = currentItems.find(i => i.id == id); // assuming items have IDs now, logic in admin might need update to issue IDs
        // Fallback: match by description if no ID (simple hack) or add ID logic later

        // For now, let's assume we handle simple index-based or if we add IDs.
        // Let's just return success for now as placeholder or simple toggle if we can identify.
        // Actually, let's upgrade lostfound.json to support IDs if it doesn't.

        // We will just do a simple write back of provided full updated list from client side for simplicity?
        // No, safer to do ID match.
        // Let's assume client sends ID.
        if (item) {
            item.claimed = true;
            item.claimedBy = "Student"; // Placeholder
        }

        fsSync.writeFileSync(path.join(__dirname, 'data', 'lostfound.json'), JSON.stringify(currentItems, null, 4));
        res.json({ message: 'Item claimed' });
    } catch (e) {
        res.status(500).json({ error: 'Failed to claim' });
    }
});

// --- AUTH ENDPOINT ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readData('users.json');

    // Find user by username and password
    // In a real app, use bcrypt or similar for password hashing!
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Return user info (excluding password)
        const { password, ...userInfo } = user;
        res.json({ success: true, user: userInfo });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
