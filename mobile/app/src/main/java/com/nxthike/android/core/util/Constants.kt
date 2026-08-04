package com.nxthike.android.core.util

object PipelineStatus {
    val ALL = listOf(
        "new", "reviewing", "shortlisted", "interview",
        "offer", "hired", "rejected", "on_hold",
    )

    fun label(status: String): String = status
        .replace('_', ' ')
        .replaceFirstChar { it.uppercase() }
}
