import '../user/user.dart';
import '../complaint/complaint.dart';
import '../system/report.dart';

class Administrator extends User {
  String adminId;
  String department;
  List<String> permissions;

  Administrator({
    required super.userId,
    required super.username,
    required super.email,
    required super.password,
    required super.firstName,
    required super.lastName,
    required super.phoneNumber,
    required super.createdAt,
    required super.updatedAt,
    required super.role,
    required super.isActive,
    required this.adminId,
    required this.department,
    required this.permissions,
  });

  List<Complaint> viewAssignedComplaints() {
    
    return [];
  }

  bool assignComplaint(String complaintId, String assigneeId) {
  
    return false;
  }

  bool updateComplaintStatus(String complaintId, String status) {
 
    return false;
  }
}