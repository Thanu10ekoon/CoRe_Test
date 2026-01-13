# CoRe MS
## Complaints & Requests Management System
<p align="left"><img src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png" width = "300px"></p>


## Overview
The Complaint Management System is a comprehensive multi-platform application that allows users to submit complaints and track their status. The system includes a web interface, mobile application, and role-based authentication, where users can submit and view complaints, while admins can manage and update complaint statuses.

## ⚙️ Tech Stack

- **Web Frontend:** React.js  
- **Mobile App:** Flutter (Dart)  
- **Backend:** Node.js with Express.js  
- **Database:** MySQL (Clever Cloud)  
- **Cloud Infrastructure:** Oracle Cloud Infrastructure (OCI)  
- **AI Chatbot:** `node-nlp` (nlp.js)

---

## ✨ Features

### 👤 User Features:
- Submit a new complaint with a title and description via **web or mobile app**.
- **Upload photos** with complaints for better documentation (mobile app).
- View a list of previously submitted complaints with status and update history.
- View **complete status history** for each complaint.
- Get assistance from **Ms. CoRe**, the AI chatbot, for complaint submission and tracking.
- Complaints are categorized (e.g., hostel, academic) and auto-directed to the relevant admin type.
- **Cross-platform access** - Web, Android mobile app, and more.

### 🛡️ Admin Features:
- Role and subrole-based admin dashboard (e.g., Dean, Warden).
- View all complaints assigned to their domain.
- Update the complaint status with **custom-defined** steps.
- Status updates are time-stamped and linked to the specific admin who made the update.
- Full visibility into **status update history** for all complaints.

### 🔐 Authentication:
- **Pre-registered** users only; registration is handled outside the app.
- On login:
  - Users are redirected to the **User Dashboard**.
  - Admins are redirected to the **Admin Dashboard** based on their subrole.
- **No password hashing** or **email verification** is currently implemented.

---

<!-- ## 🧠 Ms. CoRe - AI Chatbot Assistant
<p align="left"><img src="https://i.ibb.co/hR7WRM5j/MSCoRe.png" width = "100px"></p>
Meet **Ms. CoRe**, your intelligent assistant built with `node-nlp`.  
She can:
- Understand user intent via Natural Language Processing (NLP).
- Help lodge complaints interactively using conversational form.
- Retrieve current complaint status when given a complaint ID.
- Clarify confusion about complaint categories, steps, and admin roles.

> Ms. CoRe is powered by **NLPManager from node-nlp**, trained with domain-specific intents, and works as a smart frontend-side assistant. -->

---

## 🗃️ Database Schema

### `users` Table
| Column   | Data Type      | Description |
|----------|----------------|-------------|
| id       | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique user ID |
| username | VARCHAR(255)   | Unique username |
| role     | ENUM('user', 'admin') | Role of the user |
| subrole  | VARCHAR(255)   | Admin category (Dean, Warden, etc.) |

### `complaints` Table
| Column       | Data Type    | Description |
|--------------|--------------|-------------|
| id           | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique complaint ID |
| user_id      | INT (FOREIGN KEY) | FK to `users.id` |
| title        | VARCHAR(255) | Complaint title |
| description  | TEXT         | Complaint details |
| category     | VARCHAR(255) | Complaint category |
| status       | VARCHAR(255) | Default: 'Pending' |
| date         | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Date of complaint submission |
| updated_by_admin | INT (FOREIGN KEY) | Admin who last updated status |

### `status_updates` Table
| Column       | Data Type    | Description |
|--------------|--------------|-------------|
| id           | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique status update ID |
| complaint_id | INT (FOREIGN KEY) | Associated complaint |
| admin_id     | INT (FOREIGN KEY) | Admin who made the update |
| status       | VARCHAR(255) | Status step (e.g., "Informed to technician") |
| date         | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Timestamp of update |

---

## � Deployment & Infrastructure

### Backend Hosting
- **Platform:** Oracle Cloud Infrastructure (OCI)
- **Server IP:** `54.220.183.213`
- **Status:** Backend services are actively running on OCI
- **API Endpoint:** `http://54.220.183.213:5000`

### Mobile Application
- **Framework:** Flutter
- **Platform Support:** Android (primary), Web, Windows
- **Key Features:** 
  - Cross-platform complaint submission
  - Photo upload functionality
  - Real-time status tracking
  - Offline capability with local storage

---

## �🔧 Usage Guide

- **Login:** Use pre-registered credentials.
- **Users:** Can submit categorized complaints, track status, view full history, or ask **Ms. CoRe** for help.
- **Admins:** Can view complaints under their subrole, and submit **uneditable**, timestamped status updates.
- **AI Assistant:** Type natural phrases like:
  - _"I want to complain about my leaking tap in hostel"_
  - _"What’s the status of my complaint 103?"_

---

## 🔒 Notes

- Users and admins are manually registered via the database.
- Status updates are **immutable** after being recorded.
- No filters or sorting implemented (as per spec).
- No password hashing or email verification.

---

## 📜 License  
All rights reserved.

---

## 🙌 Credits  
- Developed by Scorpion X 
- Integrated AI with ❤️ using **node-nlp**  
- Special thanks to the **University of Ruhuna - Faculty of Engineering**

---
