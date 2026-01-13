import '../user/user.dart';
import '../complaint/complaint.dart';
import '../system/report.dart';

class NetworkManager extends User {
  String netadminId;
  List<String> permissions;

  NetworkManager({
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
    required this.netadminId,
    required this.permissions,
  });

  List<Complaint> viewAllComplaints() {
  
    return [];
  }

  Report generateReports() {
    
    throw UnimplementedError();
  }

  bool manageUsers() {
    
    return false;
  }
}