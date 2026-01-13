package com.corems.models

import kotlinx.serialization.Serializable

@Serializable
data class ComplaintCreateRequest(
    val user_id: Int,
    val title: String,
    val description: String,
    val category: String,
    val photo_url: String? = null
)

@Serializable
data class Complaint(
    val complaint_id: Int,
    val user_id: Int,
    val title: String,
    val description: String,
    val category: String,
    val photo_url: String?,
    val status: String,
    val created_at: String,
    val updated_by_admin: Int? = null
)
