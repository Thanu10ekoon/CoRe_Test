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

  @override
  void dispose() {
    _searchDebounce?.cancel();
    super.dispose();
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
          if (_username.isNotEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              child: Text(
                'Welcome, $_username!',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
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
          // Filter Section
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status filters row
                Row(
                  children: [
                    Icon(Icons.flag_outlined,
                        size: 16, color: Colors.grey[600]),
                    const SizedBox(width: 8),
                    Text(
                      'Status:',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (final status in const [
                        'Pending',
                        'In Progress',
                        'Resolved',
                        'Rejected',
                      ]) ...[
                        FilterChip(
                          label: Text(status,
                              style: const TextStyle(fontSize: 12)),
                          selected:
                              _statusFilters.contains(status.toLowerCase()),
                          selectedColor: Theme.of(context)
                              .colorScheme
                              .secondary
                              .withOpacity(0.3),
                          checkmarkColor: Theme.of(context).colorScheme.primary,
                          visualDensity: VisualDensity.compact,
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
                        const SizedBox(width: 8),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                // Category filters row
                if (FilterUtils.uniqueCategories(_allComplaints)
                    .isNotEmpty) ...[
                  Row(
                    children: [
                      Icon(Icons.category_outlined,
                          size: 16, color: Colors.grey[600]),
                      const SizedBox(width: 8),
                      Text(
                        'Category:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final category in FilterUtils.uniqueCategories(
                            _allComplaints)) ...[
                          FilterChip(
                            label: Text(category,
                                style: const TextStyle(fontSize: 12)),
                            selected: _categoryFilters
                                .contains(category.toLowerCase()),
                            selectedColor: Theme.of(context)
                                .colorScheme
                                .secondary
                                .withOpacity(0.3),
                            checkmarkColor:
                                Theme.of(context).colorScheme.primary,
                            visualDensity: VisualDensity.compact,
                            onSelected: (selected) {
                              setState(() {
                                if (selected) {
                                  _categoryFilters.add(category.toLowerCase());
                                } else {
                                  _categoryFilters
                                      .remove(category.toLowerCase());
                                }
                              });
                              _applyFilters();
                            },
                          ),
                          const SizedBox(width: 8),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                // Clear filters & result count row
                if (_categoryFilters.isNotEmpty ||
                    _statusFilters.isNotEmpty ||
                    _searchQuery.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Showing ${_complaints.length} of ${_allComplaints.length} complaints',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        ActionChip(
                          label: const Text('Clear all',
                              style: TextStyle(fontSize: 12)),
                          avatar: const Icon(Icons.clear, size: 16),
                          visualDensity: VisualDensity.compact,
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
                            return _buildComplaintTile(complaint);
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
        backgroundColor: Theme.of(context).colorScheme.primary,
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
