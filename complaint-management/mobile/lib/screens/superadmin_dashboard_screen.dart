import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';

class SuperAdminDashboardScreen extends StatefulWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  State<SuperAdminDashboardScreen> createState() =>
      _SuperAdminDashboardScreenState();
}

class _SuperAdminDashboardScreenState extends State<SuperAdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _complaints = [];
  List<dynamic> _categories = [];
  bool _isLoading = true;
  String? _adminId;
  final Map<int, TextEditingController> _statusControllers = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    for (var controller in _statusControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _loadData() async {
    final prefs = await SharedPreferences.getInstance();
    _adminId = prefs.getString('user_id');

    if (_adminId != null) {
      try {
        final complaints = await ApiService.getAdminComplaints(_adminId!);
        final categories = await ApiService.getCategories();
        if (mounted) {
          setState(() {
            _complaints = complaints;
            _categories = categories;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error loading data: $e')),
          );
        }
      }
    }
  }

  Future<void> _updateStatus(int complaintId) async {
    final controller = _statusControllers[complaintId];
    if (controller == null || controller.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a status update')),
      );
      return;
    }

    try {
      await ApiService.updateComplaintStatus(
        complaintId: complaintId,
        status: controller.text,
        adminId: _adminId!,
      );
      controller.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Status updated successfully'),
          backgroundColor: Colors.green,
        ),
      );
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating status: $e')),
      );
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  Widget _buildComplaintsTab() {
    if (_complaints.isEmpty) {
      return const Center(child: Text('No complaints found'));
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        itemCount: _complaints.length,
        itemBuilder: (context, index) {
          final complaint = _complaints[index];
          final complaintId = complaint['complaint_id'] as int;

          _statusControllers.putIfAbsent(
            complaintId,
            () => TextEditingController(),
          );

          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          complaint['title'] ?? '',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      Chip(
                        label: Text(complaint['category'] ?? ''),
                        backgroundColor: Theme.of(context)
                            .colorScheme
                            .primary
                            .withOpacity(0.2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Status: ${complaint['status'] ?? 'Pending'}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                  if (complaint['admin_username'] != null)
                    Text(
                      'Last updated by: ${complaint['admin_username']}',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _statusControllers[complaintId],
                          decoration: InputDecoration(
                            hintText: 'Update status...',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            isDense: true,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _updateStatus(complaintId),
                        child: const Text('Update'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed(
                        '/complaint-details',
                        arguments: complaintId,
                      );
                    },
                    child: const Text('View Details'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoriesTab() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
            child: Row(
              children: [
                Icon(
                  Icons.admin_panel_settings,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Super Admin Access - Full Control',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Expanded(
            child: _categories.isEmpty
                ? const Center(child: Text('No categories found'))
                : ListView.builder(
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final category = _categories[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(context)
                                .colorScheme
                                .primary
                                .withOpacity(0.2),
                            child: Text(
                              category['name']?[0] ?? '?',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                          ),
                          title: Text(category['name'] ?? ''),
                          subtitle:
                              Text(category['description'] ?? 'No description'),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin'),
        actions: [
          ValueListenableBuilder<ThemeMode>(
            valueListenable: ThemeService.themeMode,
            builder: (context, mode, _) {
              return IconButton(
                icon: Icon(
                  mode == ThemeMode.dark ? Icons.light_mode : Icons.dark_mode,
                ),
                onPressed: ThemeService.toggleTheme,
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              icon: const Icon(Icons.list_alt),
              text: 'Complaints (${_complaints.length})',
            ),
            Tab(
              icon: const Icon(Icons.category),
              text: 'Categories (${_categories.length})',
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildComplaintsTab(),
                _buildCategoriesTab(),
              ],
            ),
    );
  }
}
