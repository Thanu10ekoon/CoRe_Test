package com.corems.models

import kotlinx.serialization.Serializable

@Serializable
data class StatusUpdateRequest(
    val status: String,
    val admin_id: Int,
    val update_text: String
)
