import '../../enums/report_type.dart';

class Report {
  String reportId;
  String title;
  ReportType type;
  DateTime generatedDate;
  String generatedBy;
  Map<String, Object> data;
  DateTime fromDate;
  DateTime toDate;

  Report({
    required this.reportId,
    required this.title,
    required this.type,
    required this.generatedDate,
    required this.generatedBy,
    required this.data,
    required this.fromDate,
    required this.toDate,
  });

  String generateComplaintSummary() {
    // Implementation for generating complaint summary
    return '';
  }

  String exportToPDF() {
    // Implementation for exporting to PDF
    return '';
  }

  String exportToExcel() {
   
    return '';
  }
}