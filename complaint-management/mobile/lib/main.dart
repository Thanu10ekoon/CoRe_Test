import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/theme_service.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/user_dashboard_screen.dart';
import 'screens/admin_dashboard_screen.dart';
import 'screens/new_complaint_screen.dart';
import 'screens/complaint_details_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ThemeService.init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: ThemeService.themeMode,
      builder: (context, mode, _) {
        return MaterialApp(
          title: 'CoreMS',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
            useMaterial3: true,
            appBarTheme: AppBarTheme(
              backgroundColor: Colors.blue[700],
              foregroundColor: Colors.white,
              elevation: 2,
            ),
          ),
          darkTheme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: Colors.blue,
              brightness: Brightness.dark,
            ),
            useMaterial3: true,
            appBarTheme: const AppBarTheme(
              backgroundColor: Color(0xFF121212),
              foregroundColor: Colors.white,
              elevation: 2,
            ),
          ),
          themeMode: mode,
          initialRoute: '/',
          routes: {
            '/': (context) => const SplashScreen(),
            '/login': (context) => const LoginScreen(),
            '/signup': (context) => const SignupScreen(),
            '/user-dashboard': (context) => const UserDashboardScreen(),
            '/admin-dashboard': (context) => const AdminDashboardScreen(),
            '/new-complaint': (context) => const NewComplaintScreen(),
          },
          onGenerateRoute: (settings) {
            if (settings.name == '/complaint-details') {
              final complaintId = settings.arguments as int;
              return MaterialPageRoute(
                builder: (context) =>
                    ComplaintDetailsScreen(complaintId: complaintId),
              );
            }
            return null;
          },
        );
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    final role = prefs.getString('role');

    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    if (userId != null && role != null) {
      if (role.toLowerCase() == 'admin') {
        Navigator.of(context).pushReplacementNamed('/admin-dashboard');
      } else {
        Navigator.of(context).pushReplacementNamed('/user-dashboard');
      }
    } else {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.report_problem_outlined,
              size: 100,
              color: Colors.blue[700],
            ),
            const SizedBox(height: 20),
            Image.network(
              'https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png',
              width: 250,
              errorBuilder: (context, error, stackTrace) {
                return Column(
                  children: [
                    Text(
                      'CoreMS',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Complaint Management System',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 40),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
