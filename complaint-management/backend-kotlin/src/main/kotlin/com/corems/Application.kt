package com.corems

import io.ktor.server.application.*
import io.ktor.server.netty.EngineMain
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.callloging.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.server.http.content.*

import com.corems.db.Database
import com.corems.routes.*

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    // Initialize DB from config/env
    Database.init(environment.config)

    install(CallLogging)
    install(ContentNegotiation) { json() }
    install(CORS) {
        anyHost()
        allowCredentials = true
        allowNonSimpleContentTypes = true
    }

    routing {
        staticResources("/uploads", "uploads")
        route("/api") {
            authRoutes()
            complaintRoutes()
            statusRoutes()
            uploadRoutes()
        }
        get("/") { call.respondText("CoreMS Kotlin Backend is running") }
    }
}
