# Uploads Directory

This directory stores complaint photos uploaded by users.

## File Naming Convention
`complaint-{timestamp}-{random}.{ext}`

Example: `complaint-1729534567890-123456789.jpg`

## Access
Photos are accessible via: `https://co-re-test.vercel.app/uploads/{filename}`

## Important Notes

### For Local Development:
- Photos are stored in this directory
- Files persist between server restarts

### For Vercel Deployment:
- ⚠️ Files are stored temporarily (ephemeral filesystem)
- Files are lost on function cold starts
- **Recommended:** Use cloud storage for production:
  - AWS S3
  - Cloudinary
  - Firebase Storage
  - Azure Blob Storage

## Security

- Max file size: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF
- Files are validated on upload
- Consider implementing:
  - Virus scanning
  - Rate limiting
  - User quotas

## Cleanup

Consider implementing automated cleanup:
- Delete old files (e.g., >90 days)
- Delete photos when complaint is deleted
- Monitor disk usage

---

**Note:** Add this directory to `.gitignore` to prevent committing uploaded files to repository.
