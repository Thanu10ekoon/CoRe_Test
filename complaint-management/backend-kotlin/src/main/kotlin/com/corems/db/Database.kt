package com.corems.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import java.sql.Connection

object Database {
    private lateinit var dataSource: HikariDataSource

    fun init(config: ApplicationConfig) {
        val dbUrl = config.propertyOrNull("db.url")?.getString() ?: System.getenv("DB_URL")
        val dbUser = config.propertyOrNull("db.user")?.getString() ?: System.getenv("DB_USER")
        val dbPassword = config.propertyOrNull("db.password")?.getString() ?: System.getenv("DB_PASSWORD")

        val hikariConfig = HikariConfig().apply {
            jdbcUrl = dbUrl ?: "jdbc:mysql://localhost:3306/corems"
            username = dbUser ?: "root"
            password = dbPassword ?: ""
            maximumPoolSize = 10
        }
        dataSource = HikariDataSource(hikariConfig)
    }

    fun connection(): Connection = dataSource.connection
}
