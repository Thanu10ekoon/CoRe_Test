import 'complaint_category.dart';
import 'complaint_priority.dart';
import 'complaint_status.dart';

class Complaint {
  String complaintId;
  String title;
  String description;
  ComplaintCategory category;
  ComplaintPriority priority;
  ComplaintStatus status;
  DateTime submittedDate;
  DateTime lastUpdated;
  DateTime? resolvedDate;
  String submittedBy;
  String? assignedTo;
  List<String> attachments;

  Complaint({
    required this.complaintId,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    required this.submittedDate,
    required this.lastUpdated,
    this.resolvedDate,
    required this.submittedBy,
    this.assignedTo,
    required this.attachments,
  });

  bool updateStatus(ComplaintStatus newStatus) {
   
    return false;
  }

  bool assignTo(String userId) {
 
    return false;
  }

  bool addAttachment(String filePath) {
   
    return false;
  }
}