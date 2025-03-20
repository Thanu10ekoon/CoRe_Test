# CoRe MS
## Complaints & Requests Management System
<p align="left"><img src="https://i.ibb.co/0Vrf3tqx/Black-White-Minimalist-Initials-Monogram-Jewelry-Logo-2.png" width = "300px"></p>


## Overview
The Complaint Management System is a web application that allows users to submit complaints and track their status. The system includes role-based authentication, where users can submit and view complaints, while admins can manage and update complaint statuses.

## Tech Stack
- **Frontend:** React.js  
- **Backend:** Node.js with Express.js  
- **Database:** MySQL  

## Features
### User Features:
- Submit a new complaint with a title and description.
- View a list of past complaints with their status and admin updates.
- See the history of status changes for each complaint.

### Admin Features:
- View all complaints submitted by users.
- Update the status of complaints with a custom status.
- Record which admin updated the complaint status.

### Authentication:
- Pre-registered users log in and are redirected based on their role.
- **Users** are redirected to the user dashboard.
- **Admins** are redirected to the admin dashboard.

## Database Schema
### `complaints` Table
| Column       | Data Type    | Description |
|-------------|-------------|-------------|
| id          | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique complaint ID |
| title       | VARCHAR(255) | Complaint title |
| description | TEXT        | Detailed complaint description |
| status      | VARCHAR(255) (DEFAULT 'Pending') | Current complaint status |
| date        | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Date and time of complaint submission |

### `users` Table
| Column   | Data Type      | Description |
|----------|--------------|-------------|
| id       | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique user ID |
| username | VARCHAR(255) | Unique username |
| role     | ENUM('user', 'admin') | Role of the user |

### `status_updates` Table
| Column       | Data Type    | Description |
|-------------|-------------|-------------|
| id          | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique status update ID |
| complaint_id | INT (FOREIGN KEY) | Associated complaint ID |
| admin_id    | INT (FOREIGN KEY) | Admin who updated the status |
| status      | VARCHAR(255) | Updated status |
| date        | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Time of status update |

## Usage
- Login: Users log in with pre-registered accounts.
- Users: Can submit complaints and track their status.
- Admins: Can view and update complaint statuses.
- Status History: Users and admins can see past updates for each complaint.

## Notes
- New users are not allowed to register through the system; they must be pre-added.
- Status updates cannot be edited after submission.
- No email verification or password hashing is implemented.
