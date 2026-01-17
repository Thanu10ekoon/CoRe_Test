// Admin Dashboard screen to view complaints, update statuses, and open details.
import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/theme_service.dart';
import '../services/api_service.dart';
import '../models/complaint_model.dart';
import '../utils/filter_utils.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  List<Complaint> _allComplaints = [];
  List<Complaint> _complaints = [];
  bool _isLoading = true;
  String _username = '';
  String _subrole = '';
  final Map<int, TextEditingController> _statusControllers = {};
  // Search & filter state
  String _searchQuery = '';
  final Set<String> _statusFilters = {};
  final Set<String> _categoryFilters = {};
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _loadComplaints();
  }

  @override
  void dispose() {
    for (var controller in _statusControllers.values) {
      controller.dispose();
    }
    _searchDebounce?.cancel();
    super.dispose();
  }

  Future<void> _loadComplaints() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final adminId = prefs.getString('user_id') ?? '';
      _username = prefs.getString('username') ?? '';
      _subrole = prefs.getString('subrole') ?? '';

      final complaintsData = await ApiService.getAdminComplaints(adminId);
      final list =
          complaintsData.map((json) => Complaint.fromJson(json)).toList();
      setState(() {
        _allComplaints = list;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading complaints: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
          // Status filters
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                for (final status in const [
                  'Pending',
                  'In Progress',
                  'Resolved',
                  'Rejected',
                ])
                  FilterChip(
                    label: Text(status),
                    selected: _statusFilters.contains(status.toLowerCase()),
                    selectedColor: Colors.blue[100],
                    checkmarkColor: Colors.blue[900],
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _statusFilters.add(status.toLowerCase());
                        } else {
                          _statusFilters.remove(status.toLowerCase());
                        }
                      });
                      _applyFilters();
                    },
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
        );
      }
    }
  }

  void _applyFilters() {
    List<Complaint> filtered = List.of(_allComplaints);

    // Search
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase();
      filtered = filtered.where((c) {
        return c.title.toLowerCase().contains(q) ||
            c.description.toLowerCase().contains(q) ||
            c.category.toLowerCase().contains(q) ||
            c.status.toLowerCase().contains(q) ||
            c.complaintId.toString().contains(q);
      }).toList();
    }

    // Status filters
    if (_statusFilters.isNotEmpty) {
      filtered = filtered.where((c) {
        final s = FilterUtils.normalizeStatus(c.status);
        return _statusFilters.any((f) => s == f.toLowerCase());
      }).toList();
    }

    // Category filters
    if (_categoryFilters.isNotEmpty) {
      filtered = filtered.where((c) {
        final cat = c.category.toLowerCase();
        return _categoryFilters.any((f) => cat == f.toLowerCase());
      }).toList();
    }

    setState(() {
      _complaints = filtered;
    });
  }

  Future<void> _updateStatus(int complaintId) async {
    final controller = _statusControllers[complaintId];
    if (controller == null || controller.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a status update'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      final adminId = prefs.getString('user_id') ?? '';

      await ApiService.updateComplaintStatus(
        complaintId: complaintId,
        status: controller.text.trim(),
        adminId: adminId,
      );

      controller.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Status updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }
      _loadComplaints();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update status: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          ValueListenableBuilder<ThemeMode>(
            valueListenable: ThemeService.themeMode,
            builder: (context, mode, _) {
              return IconButton(
                icon: Icon(
                  mode == ThemeMode.dark ? Icons.light_mode : Icons.dark_mode,
                ),
                onPressed: ThemeService.toggleTheme,
                tooltip: mode == ThemeMode.dark ? 'Light mode' : 'Dark mode',
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Colors.blue[50],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, $_username!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                  ),
                ),
                if (_subrole.isNotEmpty)
                  Text(
                    'Role: $_subrole',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.blue[700],
                    ),
                  ),
              ],
            ),
          ),
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search complaints (title, ID, status, category)',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                _searchQuery = value;
                _searchDebounce?.cancel();
                _searchDebounce = Timer(const Duration(milliseconds: 250), () {
                  _applyFilters();
                });
              },
            ),
          ),
          // Category filters
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                for (final category
                    in FilterUtils.uniqueCategories(_allComplaints))
                  FilterChip(
                    label: Text(category),
                    selected: _categoryFilters.contains(category.toLowerCase()),
                    selectedColor: Colors.purple[100],
                    checkmarkColor: Colors.purple[900],
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _categoryFilters.add(category.toLowerCase());
                        } else {
                          _categoryFilters.remove(category.toLowerCase());
                        }
                      });
                      _applyFilters();
                    },
                  ),
                if (_categoryFilters.isNotEmpty ||
                    _statusFilters.isNotEmpty ||
                    _searchQuery.isNotEmpty)
                  ActionChip(
                    label: const Text('Clear filters'),
                    avatar: const Icon(Icons.clear),
                    onPressed: () {
                      setState(() {
                        _searchQuery = '';
                        _statusFilters.clear();
                        _categoryFilters.clear();
                      });
                      _applyFilters();
                    },
                  ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _complaints.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inbox_outlined,
                              size: 80,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty &&
                                      _statusFilters.isEmpty &&
                                      _categoryFilters.isEmpty
                                  ? 'No complaints found'
                                  : 'No results match current search/filters',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadComplaints,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _complaints.length,
                          itemBuilder: (context, index) {
                            final complaint = _complaints[index];
                            _statusControllers.putIfAbsent(
                              complaint.complaintId,
                              () => TextEditingController(),
                            );
                            if (index == 0) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Showing ${_complaints.length} of ${_allComplaints.length}',
                                    style: TextStyle(
                                      color: Colors.grey[700],
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  _buildAdminComplaintCard(complaint),
                                ],
                              );
                            }
                            return _buildAdminComplaintCard(complaint);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildAdminComplaintCard(Complaint complaint) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    complaint.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  '#${complaint.complaintId}',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.purple[100],
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    complaint.category,
                    style: TextStyle(
                      color: Colors.purple[900],
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(complaint.status),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    complaint.status,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            if (complaint.updatedByAdmin != null) ...[
              const SizedBox(height: 8),
              Text(
                'Updated by: ${complaint.adminSubrole ?? complaint.adminUsername ?? "Admin ID: ${complaint.updatedByAdmin}"}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pushNamed(
                  '/complaint-details',
                  arguments: complaint.complaintId,
                );
              },
              icon: const Icon(Icons.visibility),
              label: const Text('View Details'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 40),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _statusControllers[complaint.complaintId],
                    decoration: InputDecoration(
                      hintText: 'Update status',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () => _updateStatus(complaint.complaintId),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  child: const Text('Update'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'in progress':
      case 'in-progress':
        return Colors.blue;
      case 'resolved':
      case 'completed':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
