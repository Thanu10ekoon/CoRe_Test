package com.corems.routes

import com.corems.db.Database
import com.corems.models.LoginRequest
import com.corems.models.User
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.authRoutes() {
    post("/login") {
        val req = call.receive<LoginRequest>()
        Database.connection().use { conn ->
            val stmt = conn.prepareStatement(
                "SELECT user_id, username, role, subrole FROM CoReMSusers WHERE username = ? AND password = ? LIMIT 1"
            )
            stmt.setString(1, req.username)
            stmt.setString(2, req.password)
            val rs = stmt.executeQuery()
            if (rs.next()) {
                val user = User(
                    user_id = rs.getInt("user_id"),
                    username = rs.getString("username"),
                    role = rs.getString("role"),
                    subrole = rs.getString("subrole")
                )
                call.respond(user)
            } else {
                call.respond(mapOf("message" to "Invalid credentials"))
            }
        }
    }
}
