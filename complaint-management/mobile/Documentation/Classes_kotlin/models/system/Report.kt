package com.cms.models.system

import com.cms.enums.ReportType

data class Report(
    val id: String,
    val type: ReportType,
    val generatedAt: String,
    val content: String
)
