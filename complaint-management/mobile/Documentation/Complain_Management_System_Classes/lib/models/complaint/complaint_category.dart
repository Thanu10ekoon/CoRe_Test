class ComplaintCategory {
  String categoryId;
  String categoryName;
  String description;
  bool isActive;
  String departmentResponsible;

  ComplaintCategory({
    required this.categoryId,
    required this.categoryName,
    required this.description,
    required this.isActive,
    required this.departmentResponsible,
  });
}