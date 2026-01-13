package com.corems.routes

import com.corems.db.Database
import com.corems.models.StatusUpdateRequest
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.statusRoutes() {
    put("/complaints/{id}/status") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(mapOf("message" to "Invalid complaint id"))
            return@put
        }
        val req = call.receive<StatusUpdateRequest>()
        Database.connection().use { conn ->
            val up = conn.prepareStatement("UPDATE CoReMScomplaints SET status = ?, updated_by_admin = ? WHERE complaint_id = ?")
            up.setString(1, req.status)
            up.setInt(2, req.admin_id)
            up.setInt(3, id)
            up.executeUpdate()

            val ins = conn.prepareStatement("INSERT INTO CoReMSstatus (complaint_id, admin_id, update_text, update_date) VALUES (?, ?, ?, NOW())")
            ins.setInt(1, id)
            ins.setInt(2, req.admin_id)
            ins.setString(3, req.update_text)
            ins.executeUpdate()

            call.respond(mapOf("message" to "Status updated successfully"))
        }
    }

    get("/complaints/{id}/status") {
        val id = call.parameters["id"]?.toIntOrNull()
        if (id == null) {
            call.respond(emptyList<Map<String, Any>>())
            return@get
        }
        Database.connection().use { conn ->
            val stmt = conn.prepareStatement(
                "SELECT update_id, complaint_id, admin_id, update_text, update_date FROM CoReMSstatus WHERE complaint_id = ? ORDER BY update_date DESC"
            )
            stmt.setInt(1, id)
            val rs = stmt.executeQuery()
            val updates = mutableListOf<Map<String, Any>>()
            while (rs.next()) {
                updates.add(
                    mapOf(
                        "update_id" to rs.getInt("update_id"),
                        "complaint_id" to rs.getInt("complaint_id"),
                        "admin_id" to rs.getInt("admin_id"),
                        "update_text" to rs.getString("update_text"),
                        "update_date" to rs.getString("update_date")
                    )
                )
            }
            call.respond(updates)
        }
    }
}
