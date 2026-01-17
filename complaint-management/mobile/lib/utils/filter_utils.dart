import '../models/complaint_model.dart';

class FilterUtils {
  static List<String> uniqueCategories(List<Complaint> complaints) {
    final set = <String>{};
    for (final c in complaints) {
      if (c.category.trim().isNotEmpty) {
        set.add(c.category);
      }
    }
    final list = set.toList();
    list.sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
    return list;
  }

  static String normalizeStatus(String status) {
    final s = status.toLowerCase().trim();
    switch (s) {
      case 'in-progress':
        return 'in progress';
      case 'completed':
        return 'resolved';
      default:
        return s;
    }
  }
}
