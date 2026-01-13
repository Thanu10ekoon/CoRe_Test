# Uploads Directory

This folder stores uploaded complaint photos. The Ktor server serves files from this directory at `/uploads/{filename}`.

- Allowed formats: JPEG, JPG, PNG, GIF
- Max size: 5MB per file
- Field name: `photo` in multipart/form-data
