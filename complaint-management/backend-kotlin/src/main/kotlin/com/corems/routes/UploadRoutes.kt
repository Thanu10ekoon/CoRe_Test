package com.corems.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.content.*
import java.io.File
import java.util.UUID

private val allowedExtensions = setOf("jpg", "jpeg", "png", "gif")
private const val MAX_SIZE_BYTES: Long = 5L * 1024 * 1024 // 5MB

fun Route.uploadRoutes() {
    post("/upload") {
        val multipart = call.receiveMultipart()
        var fileUrl: String? = null
        var totalSize = 0L

        multipart.forEachPart { part ->
            if (part is PartData.FileItem && part.name == "photo") {
                val filename = part.originalFileName ?: "upload_${UUID.randomUUID()}"
                val ext = filename.substringAfterLast('.', "").lowercase()
                if (ext !in allowedExtensions) {
                    part.dispose()
                    call.respond(HttpStatusCode.BadRequest, mapOf("message" to "Invalid file type"))
                    return@post
                }
                val uploadsDir = File("uploads")
                uploadsDir.mkdirs()
                val storedName = "${UUID.randomUUID()}.$ext"
                val file = File(uploadsDir, storedName)

                val bytes = part.streamProvider().readBytes()
                totalSize += bytes.size
                if (totalSize > MAX_SIZE_BYTES) {
                    part.dispose()
                    call.respond(HttpStatusCode.BadRequest, mapOf("message" to "File too large (max 5MB)"))
                    return@post
                }
                file.writeBytes(bytes)

                val origin = call.request.origin
                val baseUrl = "${origin.scheme}://${origin.host}${if (origin.port != 80 && origin.port != 443) ":${origin.port}" else ""}"
                fileUrl = "$baseUrl/uploads/$storedName"
            }
            part.dispose()
        }

        if (fileUrl == null) {
            call.respond(HttpStatusCode.BadRequest, mapOf("message" to "No file uploaded with field 'photo'"))
        } else {
            call.respond(mapOf("url" to fileUrl))
        }
    }
}
