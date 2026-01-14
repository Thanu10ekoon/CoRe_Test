/// Report types available in the complaint management system, used to generate different analytics views.
enum ReportType {
  /// Aggregated overview of complaints (counts, statuses, trends).
  complaintSummary,

  /// Complaints grouped by the responsible department.
  departmentWise,

  /// Complaints grouped by category/type.
  categoryWise,

  /// Reports focused on user actions and interactions (create, update, close).
  userActivity,
}