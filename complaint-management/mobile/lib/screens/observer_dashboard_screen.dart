import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';

class ObserverDashboardScreen extends StatefulWidget {
  const ObserverDashboardScreen({super.key});

  @override
  State<ObserverDashboardScreen> createState() =>
      _ObserverDashboardScreenState();
}

class _ObserverDashboardScreenState extends State<ObserverDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _myComplaints = [];
  List<dynamic> _allComplaints = [];
  bool _isLoading = true;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadComplaints();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadComplaints() async {
    final prefs = await SharedPreferences.getInstance();
    _userId = prefs.getString('user_id');

    if (_userId != null) {
      try {
        final myComplaints = await ApiService.getUserComplaints(_userId!);
        final allComplaints = await ApiService.getAdminComplaints(_userId!);
        if (mounted) {
          setState(() {
            _myComplaints = myComplaints;
            _allComplaints = allComplaints;
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error loading complaints: $e')),
          );
        }
      }
    }
  }

  Future<void> _logout() async {
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
        title: const Text('Observer Dashboard'),
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
            Tab(text: 'My Complaints (${_myComplaints.length})'),
            Tab(text: 'All Complaints (${_allComplaints.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                // My Complaints Tab
                RefreshIndicator(
                  onRefresh: _loadComplaints,
                  child: _myComplaints.isEmpty
                      ? const Center(child: Text('No complaints found'))
                      : ListView.builder(
                          itemCount: _myComplaints.length,
                          itemBuilder: (context, index) {
                            final complaint = _myComplaints[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              child: ListTile(
                                title: Text(complaint['title'] ?? ''),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Chip(
                                      label: Text(complaint['category'] ?? ''),
                                      backgroundColor: Theme.of(context)
                                          .colorScheme
                                          .secondary
                                          .withOpacity(0.3),
                                    ),
                                    Text(
                                        'Status: ${complaint['status'] ?? 'Pending'}'),
                                  ],
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {
                                  Navigator.of(context).pushNamed(
                                    '/complaint-details',
                                    arguments: complaint['complaint_id'],
                                  );
                                },
                              ),
                            );
                          },
                        ),
                ),
                // All Complaints Tab (Read-Only)
                RefreshIndicator(
                  onRefresh: _loadComplaints,
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        color: Theme.of(context)
                            .colorScheme
                            .secondary
                            .withOpacity(0.2),
                        child: const Row(
                          children: [
                            Icon(Icons.info_outline),
                            SizedBox(width: 8),
                            Text('Read-only access to all complaints'),
                          ],
                        ),
                      ),
                      Expanded(
                        child: _allComplaints.isEmpty
                            ? const Center(child: Text('No complaints found'))
                            : ListView.builder(
                                itemCount: _allComplaints.length,
                                itemBuilder: (context, index) {
                                  final complaint = _allComplaints[index];
                                  return Card(
                                    margin: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                    child: ListTile(
                                      title: Text(complaint['title'] ?? ''),
                                      subtitle: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Chip(
                                            label: Text(
                                                complaint['category'] ?? ''),
                                            backgroundColor: Theme.of(context)
                                                .colorScheme
                                                .primary
                                                .withOpacity(0.2),
                                          ),
                                          Text(
                                              'Status: ${complaint['status'] ?? 'Pending'}'),
                                          if (complaint['admin_username'] !=
                                              null)
                                            Text(
                                              'Updated by: ${complaint['admin_username']}',
                                              style: TextStyle(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .secondary,
                                              ),
                                            ),
                                        ],
                                      ),
                                      trailing: const Icon(Icons.chevron_right),
                                      onTap: () {
                                        Navigator.of(context).pushNamed(
                                          '/complaint-details',
                                          arguments: complaint['complaint_id'],
                                        );
                                      },
                                    ),
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).pushNamed('/new-complaint');
          _loadComplaints();
        },
        icon: const Icon(Icons.add),
        label: const Text('New Complaint'),
      ),
    );
  }
}
