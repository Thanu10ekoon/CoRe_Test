package com.cms.models.user

import com.cms.enums.UserRole

open class User(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole
)
