# Expense Tracker

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment Status](#deployment-status)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Contributions](#contributions)

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
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables: Create a .env file in the root directory with the following**:
   ```env
   DB_HOST=your-db-host
   DB_USER=your-db-username
   DB_PASSWORD=your-db-password
   DB_NAME=your-database-name
   SESSION_SECRET=your-session-secret
   ```
4. **Run the application locally**:
   - **Backend**:
   ```bash
   node server.js
   ```
   - **Frontend**:
   ```bash
   npm start
   ```
5. **Access the app: Visit http://localhost:4000 (or the port configured in .env).**

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
  
## API Endpoints
### User Endpoints
  - POST `/process-signup`: Create a new user.
  - POST `/process-login`: Log in to the system.
  - POST `/logout`: Log out of the current session.
### Expense Endpoints
  - GET `/all-expenses`: Fetch all expenses for a user.
  - POST `/create-expense`: Add a new expense.
  - POST `/update-expense-name`: Update the name of an expense.
  - POST `/delete-expense`: Remove an expense.
### Category Endpoints
  - GET `/all-categories`: Fetch all categories for a user.
  - POST `/add-category`: Create a new category.
### History Endpoints
  - GET `/history`: Fetch the history of expenses by month.

## Deployment Status
### Local Deployment
The application is fully functional locally. It uses Node.js for the backend, MySQL as the database, and React for the frontend.
### AWS Deployment
The AWS deployment is currently in progress. The backend will be hosted using AWS Elastic Beanstalk, and the MySQL database will be set up on Amazon RDS. Static assets may also be delivered through AWS S3 and CloudFront.

## Future Enhancements
  - Complete AWS deployment for global accessibility.

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/J3SSY-ANDU/expense-tracker?tab=MIT-1-ov-file) file for details.

## Contributions
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/J3SSY-ANDU/expense-tracker/issues) or submit a pull request.   
