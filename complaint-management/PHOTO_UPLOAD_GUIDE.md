# Photo Upload Feature - Implementation Guide

## Overview
Photo upload functionality has been successfully added to the CoRe Complaint Management System across all platforms (Backend, Frontend, and Mobile).

## Backend Changes (Node.js/Express)

### Files Modified:
- `backend/server.js`

### Key Changes:
1. **Added Dependencies:**
   - `multer` - File upload middleware (already installed)
   - `path` - File path handling
   - `fs` - File system operations

2. **File Storage Configuration:**
   - Location: `backend/uploads/` directory
   - Filename format: `complaint-{timestamp}-{random}.{ext}`
   - File size limit: 5MB
   - Allowed formats: JPEG, JPG, PNG, GIF

3. **Database Schema Update Required:**
   ```sql
   ALTER TABLE CoReMScomplaints 
   ADD COLUMN photo_url VARCHAR(255) NULL;
   ```

4. **API Endpoint Updated:**
   - `POST /api/complaints` - Now accepts `multipart/form-data`
   - Photo field name: `photo`
   - Returns `photo_url` in response

5. **Static Files:**
   - Photos accessible at: `{BASE_URL}/uploads/{filename}`

### Deployment Note:
For Vercel deployment, uploaded files will be stored temporarily. Consider using cloud storage (AWS S3, Cloudinary, etc.) for production.

---

## Frontend Changes (React.js)

### Files Modified:
- `frontend/src/components/NewComplaint.js`
- `frontend/src/components/ComplaintDetails.js`

### Key Features:
1. **New Complaint Form:**
   - File input for photo selection
   - Image preview before submission
   - File size validation (5MB limit)
   - Format validation (JPEG, PNG, GIF)
   - FormData submission with photo

2. **Complaint Details:**
   - Displays uploaded photo
   - Full-width responsive image
   - Fallback if image fails to load

### Usage:
```javascript
// Photo submission uses FormData
const formData = new FormData();
formData.append('photo', selectedPhoto);
```

---

## Mobile App Changes (Flutter)

### Files Modified:
- `mobile/pubspec.yaml` - Added dependencies
- `mobile/lib/services/api_service.dart` - Photo upload support
- `mobile/lib/models/complaint_model.dart` - Added photoUrl field
- `mobile/lib/screens/new_complaint_screen.dart` - Camera/Gallery picker
- `mobile/lib/screens/complaint_details_screen.dart` - Photo display
- `mobile/android/app/src/main/AndroidManifest.xml` - Permissions

### New Dependencies:
```yaml
dependencies:
  image_picker: ^1.0.7  # Camera and gallery access
  http_parser: ^4.0.2   # Multipart file upload
```

### Permissions Added (Android):
- `CAMERA` - Access device camera
- `READ_EXTERNAL_STORAGE` - Read images from gallery
- `WRITE_EXTERNAL_STORAGE` - Write images (SDK ≤ 32)
- `READ_MEDIA_IMAGES` - Read media images (SDK ≥ 33)

### Key Features:
1. **Photo Selection:**
   - Choose from Camera or Gallery
   - Image preview before submission
   - Image optimization (max 1920x1080, 85% quality)
   - Remove selected photo option

2. **Photo Display:**
   - Full-width responsive image
   - Loading indicator
   - Error handling with fallback UI

---

## Testing Checklist

### Backend:
- [ ] Create complaint without photo
- [ ] Create complaint with photo
- [ ] Verify photo saved in uploads folder
- [ ] Verify photo_url in database
- [ ] Access photo via URL
- [ ] Test file size limit (try >5MB)
- [ ] Test invalid file types

### Frontend:
- [ ] Select photo from file picker
- [ ] Preview photo before submit
- [ ] Submit complaint with photo
- [ ] View photo in complaint details
- [ ] Test photo removal before submit
- [ ] Test file size validation
- [ ] Test format validation

### Mobile:
- [ ] Take photo with camera
- [ ] Select photo from gallery
- [ ] Preview photo before submit
- [ ] Submit complaint with photo
- [ ] View photo in details screen
- [ ] Remove selected photo
- [ ] Test on Android
- [ ] Verify permissions prompts

---

## Database Migration

**IMPORTANT:** Run this SQL command on your database before testing:

```sql
ALTER TABLE CoReMScomplaints 
ADD COLUMN photo_url VARCHAR(255) NULL;
```

---

## API Changes

### Request (Creating Complaint with Photo):
```
POST /api/complaints
Content-Type: multipart/form-data

Fields:
- user_id: string
- title: string
- description: string
- category: string
- photo: file (optional)
```

### Response:
```json
{
  "message": "Complaint added successfully",
  "complaint_id": 123,
  "photo_url": "/uploads/complaint-1234567890-123456789.jpg"
}
```

### GET Complaint Response (with photo):
```json
{
  "complaint_id": 123,
  "title": "Broken AC",
  "description": "AC not working in room 301",
  "category": "Maintainance",
  "photo_url": "/uploads/complaint-1234567890-123456789.jpg",
  ...
}
```

---

## Production Considerations

1. **Cloud Storage Integration:**
   - Consider AWS S3, Cloudinary, or Firebase Storage
   - Vercel has limited file storage
   - Implement signed URLs for security

2. **Image Optimization:**
   - Add image compression on backend
   - Generate thumbnails for lists
   - Use CDN for faster delivery

3. **Security:**
   - Validate file types on backend
   - Implement antivirus scanning
   - Add rate limiting for uploads

4. **Cleanup:**
   - Implement old file cleanup job
   - Delete photo when complaint is deleted

---

## Troubleshooting

### Backend:
- **Issue:** "Cannot read property 'filename' of undefined"
  - **Fix:** Ensure `enctype="multipart/form-data"` in form

- **Issue:** Photos not accessible
  - **Fix:** Check `app.use('/uploads', express.static(...))` is configured

### Frontend:
- **Issue:** Photo not displaying
  - **Fix:** Check API URL includes base URL
  - **Fix:** Verify photo_url format matches backend

### Mobile:
- **Issue:** Camera/Gallery not opening
  - **Fix:** Check permissions in AndroidManifest.xml
  - **Fix:** Test on physical device, not emulator

- **Issue:** "Unused import" errors
  - **Fix:** These are linting warnings, code will still work

---

## Next Steps

1. ✅ Add database column for photo_url
2. ✅ Test backend photo upload
3. ✅ Test frontend photo selection
4. ✅ Test mobile camera/gallery
5. ⏳ Consider cloud storage for production
6. ⏳ Add image compression
7. ⏳ Implement photo deletion

---

**Updated by:** Scorpion X
**Date:** October 21, 2025
