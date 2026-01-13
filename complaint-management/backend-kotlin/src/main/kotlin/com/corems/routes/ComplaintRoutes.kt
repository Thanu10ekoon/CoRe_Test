package com.corems.routes

import com.corems.db.Database
import com.corems.models.Complaint
import com.corems.models.ComplaintCreateRequest
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

private val categoryMap = mapOf(
    "Warden" to "Hostel",
    "AR" to "Documentation",
    "CanteenCordinator" to "Canteen",
    "AcademicCordinator" to "Academic",
    "SportCordinator" to "Sports",
    "MaintainanceCordinator" to "Maintainance",
    "Librarian" to "Library",
    "SecurityCordinator" to "Security",
    "Dean" to "ALL",
    "ComplaintsManager" to "ALL",
)

fun Route.complaintRoutes() {
    get("/complaints") {
        val userId = call.request.queryParameters["user_id"]?.toIntOrNull()
        val adminId = call.request.queryParameters["admin_id"]?.toIntOrNull()
        val complaints = mutableListOf<Complaint>()
        Database.connection().use { conn ->
            var query = "SELECT complaint_id, user_id, title, description, category, photo_url, status, created_at, updated_by_admin FROM CoReMScomplaints"
            var whereClause = ""
            when {
                userId != null -> {
                    whereClause = " WHERE user_id = ?"
                }
                adminId != null -> {
                    val adminStmt = conn.prepareStatement("SELECT subrole FROM CoReMSusers WHERE user_id = ? LIMIT 1")
                    adminStmt.setInt(1, adminId)
                    val ars = adminStmt.executeQuery()
                    var subrole: String? = null
                    if (ars.next()) subrole = ars.getString("subrole")
                    if (subrole == null) {
                        whereClause = " WHERE 1=0"
                    } else {
                        val category = categoryMap[subrole] ?: "NONE"
                        if (category == "ALL") {
                            whereClause = ""
                        } else {
                            whereClause = " WHERE category = ?"
                        }
                    }
                }
            }
            val stmt = conn.prepareStatement(query + whereClause + " ORDER BY complaint_id DESC")
            var idx = 1
            if (userId != null) {
                stmt.setInt(idx++, userId)
            } else if (adminId != null) {
                val adminStmt2 = conn.prepareStatement("SELECT subrole FROM CoReMSusers WHERE user_id = ? LIMIT 1")
                adminStmt2.setInt(1, adminId)
                val ars2 = adminStmt2.executeQuery()
                var subrole2: String? = null
                if (ars2.next()) subrole2 = ars2.getString("subrole")
                val category = categoryMap[subrole2] ?: "NONE"
                if (category != "ALL" && category != "NONE") {
                    stmt.setString(idx++, category)
                }
            }
            val rs = stmt.executeQuery()
            while (rs.next()) {
                complaints.add(
                    Complaint(
                        complaint_id = rs.getInt("complaint_id"),
                        user_id = rs.getInt("user_id"),
                        title = rs.getString("title"),
                        description = rs.getString("description"),
                        category = rs.getString("category"),
                        photo_url = rs.getString("photo_url"),
                        status = rs.getString("status"),
                        created_at = rs.getString("created_at"),
                        updated_by_admin = rs.getInt("updated_by_admin").let { if (rs.wasNull()) null else it }
                    )
                )
            }
        }
        call.respond(complaints)
    }

    post("/complaints") {
        val req = call.receive<ComplaintCreateRequest>()
        if (req.category.isBlank()) {
            call.respond(mapOf("message" to "Category is required"))
            return@post
        }
        Database.connection().use { conn ->
            val stmt = conn.prepareStatement(
                "INSERT INTO CoReMScomplaints (user_id, title, description, category, photo_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
                java.sql.Statement.RETURN_GENERATED_KEYS
            )
            stmt.setInt(1, req.user_id)
            stmt.setString(2, req.title)
            stmt.setString(3, req.description)
            stmt.setString(4, req.category)
            stmt.setString(5, req.photo_url)
            stmt.setString(6, "Pending")
            stmt.executeUpdate()
            val keys = stmt.generatedKeys
            var id = 0
            if (keys.next()) id = keys.getInt(1)
            call.respond(mapOf("message" to "Complaint added successfully", "complaint_id" to id))
        }
    }

    get("/complaints/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(mapOf("message" to "Invalid complaint id"))
            return@get
        }
        Database.connection().use { conn ->
            val stmt = conn.prepareStatement(
                "SELECT complaint_id, user_id, title, description, category, photo_url, status, created_at, updated_by_admin FROM CoReMScomplaints WHERE complaint_id = ?"
            )
            stmt.setInt(1, id)
            val rs = stmt.executeQuery()
            if (rs.next()) {
                val complaint = Complaint(
                    complaint_id = rs.getInt("complaint_id"),
                    user_id = rs.getInt("user_id"),
                    title = rs.getString("title"),
                    description = rs.getString("description"),
                    category = rs.getString("category"),
                    photo_url = rs.getString("photo_url"),
                    status = rs.getString("status"),
                    created_at = rs.getString("created_at"),
                    updated_by_admin = rs.getInt("updated_by_admin").let { if (rs.wasNull()) null else it }
                )
                call.respond(complaint)
            } else {
                call.respond(mapOf("message" to "Complaint not found"))
            }
        }
    }
}
