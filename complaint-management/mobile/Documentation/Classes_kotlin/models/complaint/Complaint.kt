package com.cms.models.complaint

import com.cms.enums.ComplaintCategory
import com.cms.enums.ComplaintPriority
import com.cms.enums.ComplaintStatus

data class Complaint(
    val id: String,
    val title: String,
    val description: String,
    val category: ComplaintCategory,
    val priority: ComplaintPriority,
    val status: ComplaintStatus,
    val createdByUserId: String,
    val createdAt: String
)
