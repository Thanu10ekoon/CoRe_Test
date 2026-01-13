# CoreMS Kotlin Backend (Ktor)

A Kotlin (Ktor) backend mirroring the Node.js/Express API used by the CoreMS mobile app.

## Features
- REST API with `/api` base path
- User login with role/subrole
- Complaints CRUD (create + read)
- Status update tracking
- Photo uploads with 5MB limit and static serving
- MySQL database via HikariCP

## Project Structure
- `src/main/kotlin/com/corems/` — application and routes
- `src/main/resources/application.conf` — server and DB config
- `uploads/` — stored photos served at `/uploads`

## Configuration
Set environment variables or edit `application.conf`:
- `DB_URL` — JDBC URL, e.g. `jdbc:mysql://<host>:3306/corems`
- `DB_USER` — database username
- `DB_PASSWORD` — database password
- `PORT` — server port (default 5000)

## Run Locally
Requires Gradle and JDK 17.

```bash
cd backend-kotlin
gradle run
```

The server starts on `http://localhost:5000`.

## API Endpoints
- `POST /api/login` — `{ username, password }` → `{ user_id, username, role, subrole }`
- `GET /api/complaints?user_id={id}` — user complaints
- `GET /api/complaints?admin_id={id}` — admin view with subrole filtering
- `GET /api/complaints/{id}` — complaint details
- `POST /api/complaints` — create complaint `{ user_id, title, description, category, photo_url? }`
- `PUT /api/complaints/{id}/status` — update complaint status `{ status, admin_id, update_text }`
- `GET /api/complaints/{id}/status` — status history
- `POST /api/upload` — multipart upload with field `photo` → `{ url }`

## Notes
- Categories and admin subroles follow the Node backend mapping.
- CORS is open for development, align as needed for production.

Developed by Scorpion X.
