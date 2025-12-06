import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class ApiService {
  static const String baseUrl = 'http://140.245.253.253/api';
  static const String imageBaseUrl = 'http://140.245.253.253'; // For loading images

  // Login
  static Future<Map<String, dynamic>> login(
      String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Invalid credentials');
    }
  }

  // Get user's complaints
  static Future<List<dynamic>> getUserComplaints(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/complaints/user/$userId'),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load complaints');
    }
  }

  // Get all complaints for admin
  static Future<List<dynamic>> getAdminComplaints(String adminId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/complaints?admin_id=$adminId'),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load complaints');
    }
  }

  // Get complaint details
  static Future<Map<String, dynamic>> getComplaintDetails(
      int complaintId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/complaints/$complaintId'),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load complaint details');
    }
  }

  // Get status updates
  static Future<List<dynamic>> getStatusUpdates(int complaintId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/statusupdates/$complaintId'),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load status updates');
    }
  }

  // Create new complaint with optional photo
  static Future<Map<String, dynamic>> createComplaint({
    required String userId,
    required String title,
    required String description,
    required String category,
    File? photoFile,
  }) async {
    try {
      print('Creating complaint with photo: ${photoFile != null}');
      print('API URL: $baseUrl/complaints');

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/complaints'),
      );

      // Add text fields
      request.fields['user_id'] = userId;
      request.fields['title'] = title;
      request.fields['description'] = description;
      request.fields['category'] = category;

      print('Request fields: ${request.fields}');

      // Add photo if provided
      if (photoFile != null) {
        print('Photo file path: ${photoFile.path}');
        print('Photo exists: ${await photoFile.exists()}');

        if (await photoFile.exists()) {
          var length = await photoFile.length();
          print('Photo size: $length bytes');

          var stream = http.ByteStream(photoFile.openRead());
          var multipartFile = http.MultipartFile(
            'photo',
            stream,
            length,
            filename: photoFile.path.split('/').last,
            contentType: MediaType('image', 'jpeg'),
          );
          request.files.add(multipartFile);
          print('Photo added to request');
        } else {
          print('ERROR: Photo file does not exist!');
        }
      }

      print('Sending request...');
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception(
            'Failed to create complaint: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('ERROR in createComplaint: $e');
      rethrow;
    }
  }

  // Update complaint status
  static Future<Map<String, dynamic>> updateComplaintStatus({
    required int complaintId,
    required String status,
    required String adminId,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/complaints/$complaintId/status'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'status': status,
        'admin_id': adminId,
      }),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to update status');
    }
  }
}
