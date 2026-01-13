import '../../enums/notification_type.dart';

class Notification {
  String notificationId;
  String userId;
  String title;
  String message;
  NotificationType type;
  DateTime createdAt;
  bool isRead;
  String? relatedComplaintId;

  Notification({
    required this.notificationId,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.createdAt,
    required this.isRead,
    this.relatedComplaintId,
  });

  bool markAsRead() {
    // Implementation for marking notification as read
    return false;
  }
}