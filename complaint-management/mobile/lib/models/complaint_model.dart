class Complaint {
  final int complaintId;
  final String title;
  final String description;
  final String category;
  final String status;
  final String createdAt;
  final int? updatedByAdmin;
  final String? adminUsername;
  final String? adminSubrole;
  final String? photoUrl;

  Complaint({
    required this.complaintId,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.createdAt,
    this.updatedByAdmin,
    this.adminUsername,
    this.adminSubrole,
    this.photoUrl,
  });

  factory Complaint.fromJson(Map<String, dynamic> json) {
    return Complaint(
      complaintId: json['complaint_id'],
      title: json['title'],
      description: json['description'],
      category: json['category'] ?? '',
      status: json['status'],
      createdAt: json['created_at'],
      updatedByAdmin: json['updated_by_admin'],
      adminUsername: json['admin_username'],
      adminSubrole: json['admin_subrole'],
      photoUrl: json['photo_url'],
    );
  }
}

class StatusUpdate {
  final int updateId;
  final int complaintId;
  final int adminId;
  final String updateText;
  final String updateDate;
  final String? adminUsername;

  StatusUpdate({
    required this.updateId,
    required this.complaintId,
    required this.adminId,
    required this.updateText,
    required this.updateDate,
    this.adminUsername,
  });

  factory StatusUpdate.fromJson(Map<String, dynamic> json) {
    return StatusUpdate(
      updateId: json['update_id'],
      complaintId: json['complaint_id'],
      adminId: json['admin_id'],
      updateText: json['update_text'],
      updateDate: json['update_date'],
      adminUsername: json['admin_username'],
    );
  }
}
