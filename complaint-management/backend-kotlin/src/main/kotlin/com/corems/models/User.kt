package com.corems.models

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val username: String, val password: String)

@Serializable
data class User(
    val user_id: Int,
    val username: String,
    val role: String,
    val subrole: String? = null
)
