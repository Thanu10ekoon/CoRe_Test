class ComplaintPriority {
  String priorityId;
  String priorityName;
  int level;
  String description;
  int maxResolutionDays;

  ComplaintPriority({
    required this.priorityId,
    required this.priorityName,
    required this.level,
    required this.description,
    required this.maxResolutionDays,
  });
}