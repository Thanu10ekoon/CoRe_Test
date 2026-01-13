# Complaint Management System

A comprehensive Dart implementation of a complaint management system based on the provided class diagram.

## Architecture

This project implements a clean architecture with the following structure:

### Directory Structure
```
lib/
├── enums/                  # Enumeration types
│   ├── user_role.dart
│   ├── notification_type.dart
│   └── report_type.dart
├── models/
│   ├── user/              # User management classes
│   │   ├── user.dart      # Base User class
│   │   ├── student.dart   # Student class (extends User)
│   │   ├── administrator.dart # Administrator class (extends User)
│   │   └── network_manager.dart # NetworkManager class (extends User)
│   ├── complaint/         # Complaint management classes
│   │   ├── complaint.dart
│   │   ├── complaint_category.dart
│   │   ├── complaint_priority.dart
│   │   └── complaint_status.dart
│   └── system/           # System management classes
│       ├── dashboard.dart
│       ├── notification.dart
│       ├── notification_service.dart
│       └── report.dart
└── complaint_management_system.dart # Main export file
```

## Key Classes Implemented

### User Management
- **User**: Base class with common user properties and authentication methods
- **Student**: Extends User, can submit and track complaints
- **Administrator**: Extends User, can manage and assign complaints
- **NetworkManager**: Extends User, has full system access and reporting capabilities

### Complaint Management
- **Complaint**: Core complaint entity with status tracking
- **ComplaintCategory**: Categorization system for complaints
- **ComplaintPriority**: Priority levels with resolution timeframes
- **ComplaintStatus**: Status tracking for complaint lifecycle

### System Management
- **Dashboard**: Statistics and overview functionality
- **NotificationService**: Handles all notification operations
- **Notification**: Individual notification entity
- **Report**: Reporting and analytics functionality

## Enumerations
- **UserRole**: STUDENT, ADMINISTRATOR, NETWORK_MANAGER, SUPER_ADMIN
- **NotificationType**: STATUS_UPDATE, ASSIGNMENT, REMINDER, RESOLUTION, NEW_COMPLAINT
- **ReportType**: COMPLAINT_SUMMARY, DEPARTMENT_WISE, CATEGORY_WISE, USER_ACTIVITY

## Usage

```dart
import 'lib/complaint_management_system.dart';

// Create a student
final student = Student(
  userId: 'U001',
  username: 'john_doe',
  // ... other properties
);

// Create and submit a complaint
final complaint = Complaint(
  complaintId: 'COM001',
  title: 'Network Issue',
  // ... other properties
);
```

## Running the Application

```bash
dart run
```

This will execute the example implementation showing how all classes work together.
