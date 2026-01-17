import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/complaint_model.dart';
import '../services/theme_service.dart';
import '../utils/filter_utils.dart';

class UserDashboardScreen extends StatefulWidget {
  const UserDashboardScreen({super.key});

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  // Full dataset and filtered view
  List<Complaint> _allComplaints = [];
  List<Complaint> _complaints = [];
  bool _isLoading = true;
  String _username = '';
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

  Future<void> _loadComplaints() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id') ?? '';
      _username = prefs.getString('username') ?? '';

      final complaintsData = await ApiService.getUserComplaints(userId);
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
        );
      }
    }
  }

  void _applyFilters() {
    List<Complaint> filtered = List.of(_allComplaints);

    // Apply search
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

    // Apply status filters (OR across selected statuses, normalized)
    if (_statusFilters.isNotEmpty) {
      filtered = filtered.where((c) {
        final s = FilterUtils.normalizeStatus(c.status);
        return _statusFilters.any((f) => s == f.toLowerCase());
      }).toList();
    }

    // Apply category filters (OR across selected categories)
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
        title: const Text('Your Complaints'),
        actions: [
          ValueListenableBuilder<ThemeMode>(
            valueListenable: ThemeService.themeMode,
            builder: (context, mode, _) {
              return IconButton(
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
          // Category filters (derived from data)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                for (final category in
                    FilterUtils.uniqueCategories(_allComplaints))
                  FilterChip(
                    label: Text(category),
                    selected: _categoryFilters
                        .contains(category.toLowerCase()),
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
                icon: Icon(
                  mode == ThemeMode.dark
                      ? Icons.light_mode
                      : Icons.dark_mode,
                ),
                onPressed: ThemeService.toggleTheme,
                tooltip:
                    mode == ThemeMode.dark ? 'Light mode' : 'Dark mode',
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
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
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: Colors.blue[50],
              child: Text(
                'Welcome, $_username!',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[900],
                            // Result count header (first item)
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
                                  _buildComplaintTile(complaint),
                                ],
                              );
                            }
                            return _buildComplaintTile(complaint);
                ),
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
                              'No complaints found',
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
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: _buildComplaintContent(complaint),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result =
              await Navigator.of(context).pushNamed('/new-complaint');
          if (result == true) {
            _loadComplaints();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('New Complaint'),
        backgroundColor: Colors.blue[700],
      ),
    );
  }

  Widget _buildComplaintTile(Complaint complaint) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: _buildComplaintContent(complaint),
    );
  }

  Widget _buildComplaintContent(Complaint complaint) {
    return ListTile(
      contentPadding: const EdgeInsets.all(16),
      title: Text(
        complaint.title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text(
            'ID: ${complaint.complaintId}',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 4),
          Text(
            DateFormat('MMM dd, yyyy - HH:mm')
                .format(DateTime.parse(complaint.createdAt)),
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
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
      trailing: const Icon(Icons.arrow_forward_ios),
      onTap: () {
        Navigator.of(context).pushNamed(
          '/complaint-details',
          arguments: complaint.complaintId,
        );
      },
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
