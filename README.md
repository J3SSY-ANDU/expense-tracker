# Expense Tracker

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment Status](#deployment-status)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Overview
Expense Tracker is a **full-stack web application** designed to help users manage their personal finances. It provides a clean and intuitive interface to organize expenses into categories, track monthly spending, and gain insights into financial habits.

---

## Features
- **User Authentication**: Secure login and registration with email verification.
- **Expense Management**:
  - Add, update, delete expenses.
  - Categorize expenses.
  - Track monthly expense summaries.
- **Category Management**: Organize spending into custom categories.
- **Monthly History**: View expenses grouped by month for detailed analysis.
- **Responsive Design**: Works seamlessly on desktops and mobile devices.

---

## Technologies Used

### Frontend
- **React**: For building a responsive and dynamic user interface.
- **MUI (Material-UI)**: For styled components and consistent design.

### Backend
- **Node.js**: Server runtime environment.
- **Express.js**: Web framework for API routing.
- **MySQL**: Relational database for storing user and expense data.
- **jsonwebtoken**: For secure user authentication and session management.
- **bcrypt**: For password hashing.
- **dotenv**: For environment variable management.

---

## Installation

Follow these steps to set up the project locally:

### Prerequisites
- **Node.js** (v18 or later)
- **MySQL** database

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```
2. **Install dependencies (both frontend and backend)**:
   ```bash
   cd backend
   yarn install
   ```
   ```bash
   cd frontend
   yarn install
   ```
3. **Set up environment variables:**
   
   Create a .env file in the `backend` directory with the following:
   ```env
   PORT=4000
   NODE_ENV=development
   MYSQL_HOST=your-db-host
   MYSQL_PORT=your-db-port
   MYSQL_USER=your-db-username
   MYSQL_PASSWORD=your-db-password
   MYSQL_DB=your-db-name
   AUTH_SECRET=your-auth-secret
   EMAIL_SECRET=your-email-token-secret
   EMAIL=your-email
   EMAIL_PASSWORD=your-email-password
   API_URL=http://localhost:4000
   CLIENT_URL=http://localhost:3000
   ```
   Create a .env file in the `frontend` directory with the following:
    ```env
    REACT_APP_API_URL=http://localhost:4000
    ```
5. **Run the application locally**:
   
   **Backend**:
   ```bash
   yarn dev
   ```
   **Frontend**:
   ```bash
   yarn start
   ```
7. **Access the app: Visit http://localhost:3000 for the frontend and http://localhost:4000 for backend APIs.**

## Usage
1. **Sign Up**:
   - Register a new account with email verification.
2. **Log In**:
   - Access your dashboard to manage expenses.
3. **Manage Expenses**:
   - Add, edit, or delete expenses by category.
4. **View History**:
   - Explore monthly transaction summaries.
5. **Track Categories**:
   - Organize and monitor total spending by category.

## Deployment Status
- **Frontend**: Deployed via [Vercel](https://vercel.com)
- **Backend**: Deployed via [Render](https://render.com)
- **Database**: Hosted on [Railway](https://railway.app)

## Future Enhancements
- Improve dashboard analytics with charts.
- Add budgeting tools.

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/J3SSY-ANDU/expense-tracker?tab=MIT-1-ov-file) file for details.
