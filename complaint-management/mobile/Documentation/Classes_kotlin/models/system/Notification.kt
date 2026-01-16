package com.cms.models.system

import com.cms.enums.NotificationType

data class Notification(
    val id: String,
    val message: String,
    val type: NotificationType,
    val timestamp: String
)
