# Prodigy InfoTech — Task-01: Secure User Authentication System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Backend-Express.js-black.svg)](https://expressjs.com/)
[![Security](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-orange.svg)](https://jwt.io/)

A full-stack, production-ready web application demonstrating **Secure User Authentication and Role-Based Access Control (RBAC)** developed for the **Prodigy InfoTech Full Stack Web Development Internship (Task-01)**.

---

## 📌 Task Overview (Task-01)

> **Objective:** Implement a user authentication system with secure login and registration functionality. Users should be able to sign up for an account, log in securely, and access protected routes only after successful authentication.  
> **Key Enhancements Implemented:** Cryptographic password hashing, stateless JSON Web Token (JWT) session management, and multi-tier Role-Based Access Control (RBAC with Standard User & Admin privileges).

---

## ✨ Key Features

### 1. 🔐 Cryptographic Password Security
- Passwords are never stored in plaintext.
- Protected using salted cryptographic hashing (`bcryptjs` / salted PBKDF2) to prevent rainbow table and brute-force attacks.
- Real-time client-side password strength meter with visual indicators and minimum requirement checks.

### 2. 🎟️ Stateless JWT Session Management
- Issue and verify standard RFC 7519 JSON Web Tokens (HMAC-SHA256 signed).
- Supports dual transmission via `Authorization: Bearer <token>` header and secure `HttpOnly` cookie.
- Token expiration handling with automatic session invalidation.

### 3. 🛡️ Role-Based Access Control (RBAC)
- Multi-tier user hierarchy: **Standard User** and **Administrator**.
- Server-side middleware checks (`requireRole('admin')`) protect sensitive administrative actions.
- Client-side navigation guards automatically prevent unauthorized UI routing.

### 4. 🚀 Protected Routes & Live Sandbox Tester
- Protected private dashboards for authenticated users.
- Interactive route-testing terminal built into the dashboard to demonstrate live HTTP status responses:
  - `GET /api/protected/dashboard` (200 OK for any authenticated session)
  - `GET /api/protected/profile` (200 OK with private profile metadata)
  - `GET /api/admin/stats` (403 Forbidden for standard users; 200 OK for administrators)

### 5. 👑 Administrator Management Console
- Restricted exclusively to users with the `admin` role.
- Real-time statistics: Total Registered Users, Admin Count, Regular Member Count.
- Full user directory management: Promote/demote user roles and delete accounts.

### 6. 🎨 Modern, Responsive & User-Friendly UI
- Clean dark-mode aesthetic with CSS variables and responsive flex/grid layouts.
- Toast notification system for clear user feedback.
- One-click demo credentials autofill for seamless evaluator testing.

---

## ⚡ Quick Demo Accounts

Pre-configured in the database for instant testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@prodigy.com` | `AdminPassword123!` | Full Access (User + Admin Panel) |
| **Standard User** | `user@prodigy.com` | `UserPassword123!` | Protected User Dashboard Only |

*(You can also register brand new accounts through the registration form and choose the role.)*

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Security & Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`
- **Database / Persistence:** File-based persistent JSON storage (`data/users.json`) with automated initialization and CRUD helpers (zero external DB installation required)
- **Frontend:** HTML5, Modern CSS3 (Grid & Flexbox), Vanilla ES6+ JavaScript (Fetch API, SPA Router)

---

## 📂 Project Structure

```text
prodigy-wd-01-auth/
├── config/
│   └── config.js              # Environment & application configurations
├── controllers/
│   ├── authController.js       # Registration, login, logout, getMe logic
│   └── adminController.js      # User management, RBAC, system statistics
├── data/
│   └── users.json             # Persistent file storage for user records
├── middleware/
│   └── authMiddleware.js      # JWT verification & RBAC authorization
├── models/
│   └── userModel.js           # Data access layer & password hashing
├── public/
│   ├── css/
│   │   └── styles.css         # Modern, responsive stylesheet
│   ├── js/
│   │   ├── api.js             # Centralized API service & JWT storage
│   │   ├── auth.js            # Form handling, validation & toast alerts
│   │   └── app.js             # SPA router, protected UI & admin operations
│   └── index.html             # Single-page application markup
├── routes/
│   ├── authRoutes.js          # /api/auth routes
│   ├── protectedRoutes.js     # /api/protected routes
│   └── adminRoutes.js         # /api/admin routes
├── .env.example               # Template for environment variables
├── .env                       # Local environment settings
├── .gitignore                 # Files excluded from git
├── package.json               # Node.js dependencies & scripts
├── README.md                  # Project documentation & GitHub instructions
└── server.js                  # Express server entry point
```

---

## 💻 How to Run in VS Code

### Prerequisites
- Install [Node.js](https://nodejs.org/) (Version 16.x or higher).
- Install [Visual Studio Code](https://code.visualstudio.com/).

### Step-by-Step Instructions

1. **Extract and Open Project:**
   - Extract the `PRODIGY_WD_01_Secure_Auth.zip` archive.
   - Open Visual Studio Code, go to `File` > `Open Folder...`, and select the extracted `prodigy-wd-01-auth` directory.

2. **Open the Integrated Terminal:**
   - Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>`</kbd> (macOS), or click `Terminal` > `New Terminal` in the top menu.

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start the Application:**
   - To start in standard mode:
     ```bash
     npm start
     ```
   - Or to start with automatic reload (if nodemon is installed):
     ```bash
     npm run dev
     ```

5. **Access the Web Application:**
   - Open your browser and navigate to:
     ```text
     http://localhost:5000
     ```
   - Use the **One-Click Demo** buttons on the home or login page to test immediately.

---

## 🚀 How to Push this Project to GitHub

Follow these steps to publish this task to your personal GitHub profile:

### Step 1: Create a Repository on GitHub
1. Go to [github.com](https://github.com/) and sign in.
2. Click the **`+`** icon in the top right corner and select **New repository**.
3. Name your repository (e.g., `PRODIGY_WD_01` or `prodigy-infotech-task-01`).
4. Keep it **Public** so evaluators can review your work.
5. Do **not** initialize with a README, `.gitignore`, or license (these are already included in this project).
6. Click **Create repository**.

### Step 2: Push from VS Code Terminal
In the VS Code terminal inside the project root folder, execute the following commands:

```bash
# 1. Initialize a new Git repository
git init

# 2. Add all project files to staging
git add .

# 3. Create your initial commit
git commit -m "feat: complete Prodigy InfoTech Task-01 secure authentication system"

# 4. Set the default branch to main
git branch -M main

# 5. Link your local repository to your remote GitHub repository
# (Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual details)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. Push the code to GitHub
git push -u origin main
```

---

## 📡 API Reference

### Public Authentication Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`fullName`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `POST` | `/api/auth/logout` | Invalidate session cookie |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile |

### Protected User Routes (Requires Valid JWT)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/protected/dashboard` | Returns private user dashboard data |
| `GET` | `/api/protected/profile` | Returns user account details and login metadata |

### Protected Administrative Routes (Requires JWT + Admin Role)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | System metrics (total users, admin count, active accounts) |
| `GET` | `/api/admin/users` | List all registered users (passwords omitted) |
| `PATCH` | `/api/admin/users/:id/role` | Update user role (`admin` <-> `user`) |
| `DELETE` | `/api/admin/users/:id` | Remove a user account |

---

## 📄 License

This project is licensed under the MIT License - feel free to use it for your internship submission and portfolio.
