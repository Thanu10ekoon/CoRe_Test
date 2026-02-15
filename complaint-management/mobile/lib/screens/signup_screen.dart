import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/theme_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _specialPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _obscureSpecialPassword = true;
  String _selectedRole = 'user';
  List<dynamic> _categories = [];
  List<int> _selectedCategoryIds = [];
  bool _loadingCategories = false;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _specialPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() {
      _loadingCategories = true;
    });
    try {
      final categories = await ApiService.getCategories();
      if (mounted) {
        setState(() {
          _categories = categories;
          _loadingCategories = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadingCategories = false;
        });
      }
    }
  }

  String _getSpecialPasswordLabel() {
    switch (_selectedRole) {
      case 'admin':
        return 'Admin Password';
      case 'superadmin':
        return 'Super Admin Password';
      case 'observer':
        return 'Observer Password';
      default:
        return 'Special Password';
    }
  }

  bool _verifySpecialPassword() {
    final password = _specialPasswordController.text;
    switch (_selectedRole) {
      case 'admin':
        return password == 'RuhPass#1999';
      case 'superadmin':
        return password == 'SuperRuhPass#2024';
      case 'observer':
        return password == 'ObserverPass#2024';
      default:
        return true;
    }
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Special password verification for non-user roles
    if (_selectedRole != 'user' && !_verifySpecialPassword()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Invalid ${_selectedRole} password'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Admin must select at least one category
    if (_selectedRole == 'admin' && _selectedCategoryIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one category for admin'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await ApiService.signup(
        _usernameController.text,
        _passwordController.text,
        role: _selectedRole,
        categories: _selectedRole == 'admin' ? _selectedCategoryIds : null,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created successfully! Please login.'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.of(context).pop(); // Go back to login screen
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Signup failed: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign Up'),
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
        ],
      ),
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                Image.network(
                  'https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png',
                  width: 250,
                  errorBuilder: (context, error, stackTrace) {
                    return Column(
                      children: [
                        Icon(
                          Icons.person_add_outlined,
                          size: 80,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Create Account',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 40),
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Sign Up',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 30),
                          TextFormField(
                            controller: _usernameController,
                            decoration: InputDecoration(
                              labelText: 'Username',
                              prefixIcon: const Icon(Icons.person),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter username';
                              }
                              if (value.length < 3) {
                                return 'Username must be at least 3 characters';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter password';
                              }
                              if (value.length < 4) {
                                return 'Password must be at least 4 characters';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          TextFormField(
                            controller: _confirmPasswordController,
                            obscureText: _obscureConfirmPassword,
                            decoration: InputDecoration(
                              labelText: 'Confirm Password',
                              prefixIcon: const Icon(Icons.lock_outline),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscureConfirmPassword
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscureConfirmPassword =
                                        !_obscureConfirmPassword;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please confirm password';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 20),
                          DropdownButtonFormField<String>(
                            value: _selectedRole,
                            decoration: InputDecoration(
                              labelText: 'Role',
                              prefixIcon: const Icon(Icons.badge),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            items: const [
                              DropdownMenuItem(
                                  value: 'user', child: Text('User')),
                              DropdownMenuItem(
                                  value: 'observer', child: Text('Observer')),
                              DropdownMenuItem(
                                  value: 'admin', child: Text('Admin')),
                              DropdownMenuItem(
                                  value: 'superadmin',
                                  child: Text('Super Admin')),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _selectedRole = value!;
                                _selectedCategoryIds.clear();
                              });
                            },
                          ),
                          if (_selectedRole != 'user') ...[
                            const SizedBox(height: 20),
                            TextFormField(
                              controller: _specialPasswordController,
                              obscureText: _obscureSpecialPassword,
                              decoration: InputDecoration(
                                labelText: _getSpecialPasswordLabel(),
                                prefixIcon:
                                    const Icon(Icons.admin_panel_settings),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscureSpecialPassword
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscureSpecialPassword =
                                          !_obscureSpecialPassword;
                                    });
                                  },
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                helperText:
                                    'Contact administrator for ${_selectedRole} password',
                              ),
                            ),
                          ],
                          if (_selectedRole == 'admin') ...[
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.category,
                                          color: Colors.grey),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Select Categories',
                                        style: TextStyle(
                                          color: Colors.grey[700],
                                          fontSize: 16,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  if (_loadingCategories)
                                    const Center(
                                        child: CircularProgressIndicator())
                                  else if (_categories.isEmpty)
                                    const Text('No categories available')
                                  else
                                    Wrap(
                                      spacing: 8,
                                      children: _categories.map((category) {
                                        final categoryId =
                                            category['id'] as int;
                                        final isSelected = _selectedCategoryIds
                                            .contains(categoryId);
                                        return FilterChip(
                                          label: Text(category['name'] ?? ''),
                                          selected: isSelected,
                                          onSelected: (selected) {
                                            setState(() {
                                              if (selected) {
                                                _selectedCategoryIds
                                                    .add(categoryId);
                                              } else {
                                                _selectedCategoryIds
                                                    .remove(categoryId);
                                              }
                                            });
                                          },
                                        );
                                      }).toList(),
                                    ),
                                  if (_selectedCategoryIds.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        '${_selectedCategoryIds.length} selected',
                                        style: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .primary,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 30),
                          ElevatedButton(
                            onPressed: _isLoading ? null : _handleSignup,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  Theme.of(context).colorScheme.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                : const Text(
                                    'Sign Up',
                                    style: TextStyle(fontSize: 18),
                                  ),
                          ),
                          const SizedBox(height: 20),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                            child: Text(
                              'Already have an account? Login',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                Text(
                  'Developed by Scorpion X',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
