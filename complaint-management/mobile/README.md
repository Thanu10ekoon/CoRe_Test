# CoreMS - Complaint Management Mobile App

A Flutter mobile application for the CoreMS (CoRe Complaint Management System).

## Features

- User Login
- View Complaints (User & Admin)
- Create New Complaints
- Update Complaint Status (Admin)
- View Complaint Details
- View Status Update History

## Setup

1. Install Flutter SDK: https://flutter.dev/docs/get-started/install
2. Run `flutter pub get` to install dependencies
3. Run `flutter run` to start the app

## Backend

This app connects to the existing backend hosted at:
`https://co-re-test.vercel.app/`

## User Roles

- **User**: Can create and view their own complaints
- **Admin**: Can view all complaints (based on subrole) and update status

## Complaint Categories

- Hostel (Warden)
- Canteen (CanteenCordinator)
- Academic (AcademicCordinator)
- Sports (SportCordinator)
- Maintainance (MaintainanceCordinator)
- Library (Librarian)
- Security (SecurityCordinator)
- Documentation (AR)

## Development

Developed by Scorpion X
