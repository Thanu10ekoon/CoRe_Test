import '../../enums/user_role.dart';

class User {
  String userId;
  String username;
  String email;
  String password;
  String firstName;
  String lastName;
  String phoneNumber;
  DateTime createdAt;
  DateTime updatedAt;
  UserRole role;
  bool isActive;

  User({
    required this.userId,
    required this.username,
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    required this.createdAt,
    required this.updatedAt,
    required this.role,
    required this.isActive,
  });

  bool login(String username, String password) {
   
    return false;
  }

  void logout() {
    
  }

  bool updateProfile(Map<String, dynamic> userDetails) {
   
    return false;
  }

  bool resetPassword(String email) {
    
    return false;
  }
}