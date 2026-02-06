# 🚀 Project Nexus: Campus Super-App

> **"One App to Rule the Campus."**

Project Nexus is a unified, futuristic web platform designed to streamline the daily life of university students. It integrates academic tools, campus marketplaces, travel coordination, and emergency services into a single, immersive interface with a sci-fi/cyberpunk aesthetic.

![Project Nexus Banner](https://via.placeholder.com/1200x400/0f172a/00f3ff?text=PROJECT+NEXUS)

## 🌟 Features

### 1. 🎓 Academic Cockpit
- **Live Timetable**: Real-time class schedule with "Live" status indicators.
- **Mess Menu**: View daily breakfast, lunch, and dinner menus with voting options.
- **Mail Intel**: AI-summarized view of important university emails.

### 2. 🤝 The Exchange (Marketplace)
- **Peer-to-Peer Market**: Buy and sell items (Books, Gadgets, Cycles) within campus.
- **Admin Approval System**: All listings are verified by a Commander (Admin) before going live.
- **Lost & Found**: Report lost items and claim found ones. Admin-managed registry for improved recovery rates.

### 3. 🚗 Travel Pool
- **Ride Sharing**: Coordinate cab pools with other students to save money.
- **Route Planning**: Simple interface to view available rides out of campus.

### 4. 🧭 Campus Navigator
- **Smart Map**: Interactive map of the campus locations (Senate, Library, Hostels).
- **Route Calculation**: Get walking directions between key landmarks.

### 5. 🛠 Admin Console
- **Central Command**: Dedicated dashboard for administrators ("Commanders").
- **User Management**: Add/Remove users and assign roles.
- **Content Control**: Update mess menus, manage timetable, and broadcast announcements.
- **Moderation**: Approve/Reject marketplace listings and manage Lost & Found items.

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla CSS (Glassmorphism + Neon Design), Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **Database**: JSON-based flat-file storage (Lightweight & Portable).
- **Design**: Custom "Starship" UI with FontAwesome icons and Google Fonts (Inter/Roboto).

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/project-nexus.git
    cd project-nexus
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Server**
    ```bash
    node server.js
    ```

4.  **Launch**
    - Login Landing Page: `http://localhost:3000/landing.html`
    - Student Portal: `http://localhost:3000`
    - Admin Console: `http://localhost:3000/admin.html`

## 👤 User Roles

- **Cadet (Student)**: Access to all read features, can buy/sell items, report lost items.
- **Commander (Admin)**: Access to Admin Console, approval rights, content management.

## 🔐 Demo Credentials

To access the platform, use the following demo accounts:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin` |
| **Student** | `Jagjeet` | `1234` |

## 🧪 Testing

The project includes a verification script API testing.
To verify specific modules, use the API endpoints documented in `server.js`.

---

*Built for the Future of Campus Life.*
