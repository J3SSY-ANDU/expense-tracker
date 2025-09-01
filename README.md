# Expense Tracker

A self-hosted, full-featured expense tracker web application.

- **Frontend:** React + TypeScript (Create React App, Material-UI)
- **Backend:** Node.js (JavaScript, Express)
- **Database:** MySQL

---

## 🚀 Features

- User authentication (JWT)
- Expense and budget management
- Category-based tracking
- Data visualization (charts)
- Email notifications
- Modern, responsive UI
- Self-hostable (local or cloud)

---

## 🗂️ Project Structure

The repository is organized as follows:

```
EXPENSE-TRACKER/
│
├── backend/                # Node.js backend with Express & MySQL
│   ├── database/           # Database access and models (budgets, users, etc.)
│   ├── node_modules/
│   ├── .env.development
│   ├── .env.production
│   ├── emails.js
│   ├── package.json
│   ├── server.js
│   └── yarn.lock
│
├── frontend/               # React + TypeScript frontend (Create React App)
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/            # API service wrappers
│   │   ├── components/     # React components
│   │   ├── styles/
│   │   ├── types/          # TypeScript types and declarations
│   │   ├── ...
│   │   ├── App.tsx, etc.
│   │
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── yarn.lock
│
├── .gitignore
├── LICENSE
├── package.json            # (If present in root, for scripts or monorepo management)
├── README.md
└── yarn.lock
```

- **backend/** contains all server-side code, database handling, and environment files for the API and email service.
- **frontend/** contains all client-side React code, organized by feature (API, components, types, styles).

Feel free to refer to the codebase for more details on each folder’s purpose.

---

## 🖥️ Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Yarn](https://classic.yarnpkg.com/)
- [MySQL](https://www.mysql.com/downloads/) (v8+ recommended)

---

## 📦 Installation & Self-Hosting

### 1. **Clone the Repository**

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. **Install Dependencies**

```bash
# Install backend dependencies
cd backend
yarn install

# Install frontend dependencies
cd ../frontend
yarn install
```

### 3. **Set Up the MySQL Database**

- Create your database:
  ```sql
  CREATE DATABASE expense_tracker;
  ```
- Create a MySQL user and grant access (or use root for local testing).
- Update your `.env.development` and `.env.production` files in `/backend` with your credentials.

### 4. **Configure Environment Variables**

#### **Backend (`/backend`)**

- Create two files:  
  - `.env.development` for local/dev
  - `.env.production` for production

**Example `.env.development`:**
```
PORT=4000
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=expense-tracker
AUTH_SECRET=your_auth_secret
EMAIL_SECRET=your_email_secret
EMAIL=youremail@gmail.com
EMAIL_PASSWORD=your_app_password
API_URL=http://localhost:4000
CLIENT_URL=http://localhost:3000
```

**Example `.env.production`:**
```
NODE_ENV=production
MYSQL_HOST=your-production-host
MYSQL_PORT=3306
MYSQL_USER=your-prod-user
MYSQL_PASSWORD=your-prod-password
MYSQL_DB=your-prod-db
AUTH_SECRET=your_prod_auth_secret
TOKEN_SECRET=your_prod_token_secret
EMAIL=youremail@gmail.com
EMAIL_PASSWORD=your_app_password
API_URL=https://your-prod-api
CLIENT_URL=https://your-prod-client
```

#### **Frontend (`/frontend`)**

- Create two files:  
  - `.env.development` for local/dev
  - `.env.production` for production

**Example `.env.development`:**
```
REACT_APP_API_URL=http://localhost:4000
```

**Example `.env.production`:**
```
REACT_APP_API_URL=https://your-production-api-url
```

- Your React app will use `REACT_APP_API_URL` to connect to the backend.

---

## 🏃 Running the Application

### **In Development**

**Backend:**

```bash
cd backend
yarn server
# or
yarn dev
```
- By default, runs at `http://localhost:4000`

**Frontend:**

```bash
cd frontend
yarn start
```
- By default, runs at `http://localhost:3000`

---

### **In Production**

1. Set up your `.env.production` in both `/backend` and `/frontend`.
2. **Build the frontend**:
    ```bash
    cd frontend
    yarn build
    ```
    - Static files will be output to `/frontend/build`.
3. **Run the backend**:
    ```bash
    cd ../backend
    yarn start
    ```
    - Or use a process manager like [pm2](https://pm2.keymetrics.io/):
      ```bash
      pm2 start server.js --name expense-tracker-backend
      ```

4. **Serve the frontend**:
    - You can serve the `/frontend/build` directory with [serve](https://www.npmjs.com/package/serve), Nginx, or set up your backend to serve static files.

---

## ✉️ Email & Notifications

- Requires a valid email account and app password (for Gmail or similar).
- Set `EMAIL` and `EMAIL_PASSWORD` in your `/backend/.env` file.
- Email notifications will work automatically if credentials are valid.

---

## 🛠️ Environment Variables Reference

**Backend**

| Name            | Description                       |
|-----------------|-----------------------------------|
| PORT            | Backend server port               |
| NODE_ENV        | `development` or `production`     |
| MYSQL_HOST      | MySQL host                        |
| MYSQL_PORT      | MySQL port                        |
| MYSQL_USER      | MySQL user                        |
| MYSQL_PASSWORD  | MySQL password                    |
| MYSQL_DB        | MySQL database name               |
| AUTH_SECRET     | JWT secret                        |
| EMAIL_SECRET    | Email-related secret              |
| TOKEN_SECRET    | (Production) Token secret         |
| EMAIL           | Sender email address              |
| EMAIL_PASSWORD  | App password for email            |
| API_URL         | Backend API URL                   |
| CLIENT_URL      | Frontend client URL               |

**Frontend**

| Name                 | Description            |
|----------------------|------------------------|
| REACT_APP_API_URL    | Backend API base URL   |

---

## ❓ Troubleshooting

- **CORS errors:** Ensure `API_URL` and `CLIENT_URL` settings match and CORS is enabled on backend.
- **Emails not sending:** Use a valid app password and check your provider’s settings.
- **Database errors:** Verify MySQL is running, credentials are correct, and host/port are accessible.

---

## 🙌 Contributing

Pull requests and issues are welcome!

---

## 📄 License

MIT

---

## 👤 Credits

Created by [J3SSY-ANDU](https://github.com/J3SSY-ANDU)
