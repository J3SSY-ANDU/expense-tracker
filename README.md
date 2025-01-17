# Expense Tracker

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
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
- **Scalable Backend**: Deployed using AWS Elastic Beanstalk for robust performance.

---

## Technologies Used
### Frontend
- **React**: For building a responsive and dynamic user interface.
- **MUI (Material-UI)**: For styled components and consistent design.

### Backend
- **Node.js**: Server runtime environment.
- **Express.js**: Web framework for API routing.
- **MySQL**: Relational database for storing user and expense data.
- **bcrypt**: For password hashing.
- 
- **dotenv**: For environment variable management.

### Deployment
- **AWS Elastic Beanstalk**: Hosting the backend.
- **Amazon RDS**: Hosting the MySQL database.
- **AWS S3**: Storing application files.
- **AWS CloudFront**: Content delivery for static assets.

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
