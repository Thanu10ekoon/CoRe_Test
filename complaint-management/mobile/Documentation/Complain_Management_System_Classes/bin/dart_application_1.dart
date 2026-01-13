import '../lib/complaint_management_system.dart';

void main() {
  print('Complaint Management System Classes Implemented');
  print('==============================================');
  
  // Example usage of the classes
  
  // Create a student
  final student = Student(
    userId: 'U001',
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    createdAt: DateTime.now(),
    updatedAt: DateTime.now(),
    role: UserRole.student,
    isActive: true,
    studentId: 'S001',
    department: 'Computer Science',
    year: '2024',
    program: 'Bachelor of Technology',
  );
  
  print('Student created: ${student.firstName} ${student.lastName}');
  
  // Create complaint category
  final category = ComplaintCategory(
    categoryId: 'CAT001',
    categoryName: 'Network Issues',
    description: 'Issues related to network connectivity',
    isActive: true,
    departmentResponsible: 'IT Department',
  );
  
  // Create complaint priority
  final priority = ComplaintPriority(
    priorityId: 'PRI001',
    priorityName: 'High',
    level: 1,
    description: 'High priority issues',
    maxResolutionDays: 3,
  );
  
  // Create complaint status
  final status = ComplaintStatus(
    statusId: 'STA001',
    statusName: 'Open',
    description: 'Complaint is open and pending review',
    isFinal: false,
  );
  
  // Create a complaint
  final complaint = Complaint(
    complaintId: 'COM001',
    title: 'Internet connectivity issue',
    description: 'Unable to connect to campus WiFi',
    category: category,
    priority: priority,
    status: status,
    submittedDate: DateTime.now(),
    lastUpdated: DateTime.now(),
    submittedBy: student.userId,
    attachments: [],
  );
  
  print('Complaint created: ${complaint.title}');
  
  // Create notification
  final notification = Notification(
    notificationId: 'NOT001',
    userId: student.userId,
    title: 'Complaint Submitted',
    message: 'Your complaint has been submitted successfully',
    type: NotificationType.newComplaint,
    createdAt: DateTime.now(),
    isRead: false,
    relatedComplaintId: complaint.complaintId,
  );
  
  print('Notification created: ${notification.title}');
  
 
}
