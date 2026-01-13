import '../complaint/complaint.dart';

class DashboardStats {

  Map<String, dynamic> stats;

  DashboardStats({required this.stats});
}

class Action {
 
  String actionId;
  String description;
  DateTime dueDate;

  Action({
    required this.actionId,
    required this.description,
    required this.dueDate,
  });
}

class Dashboard {
  String userId;

  Dashboard({
    required this.userId,
  });

  DashboardStats generateOverviewStats() {
    
    return DashboardStats(stats: {});
  }

  List<Complaint> getRecentComplaints(int limit) {
   
    return [];
  }

  List<Action> getPendingActions() {
   
    return [];
  }

  List<Complaint> filterComplaints(Map<String, dynamic> filterCriteria) {
  
    return [];
  }
}