package com.nxthike.android.presentation.navigation

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val HOME = "home"
    const val JOBS = "jobs"
    const val JOB_DETAIL = "jobs/{id}"
    const val JOB_EDIT = "jobs/edit?id={id}"
    const val EVENTS = "events"
    const val EVENT_DETAIL = "events/{id}"
    const val EVENT_EDIT = "events/edit?id={id}"
    const val COURSES = "courses"
    const val COURSE_DETAIL = "courses/{id}"
    const val COURSE_EDIT = "courses/edit?id={id}"
    const val COMPANIES = "companies"
    const val COMPANY_DETAIL = "companies/{id}"
    const val COMPANY_EDIT = "companies/edit?id={id}"
    const val HIRING = "hiring"
    const val HIRING_CANDIDATES = "hiring/candidates"
    const val HIRING_CANDIDATE = "hiring/candidates/{id}"
    const val HIRING_CANDIDATE_EDIT = "hiring/candidates/edit?id={id}"
    const val HIRING_ROLES = "hiring/roles"
    const val CALLS = "calls"
    const val CALL_HISTORY = "calls/history"
    const val CALL_LOG =
        "calls/log/{candidateId}?name={name}&phone={phone}&roleId={roleId}&roleName={roleName}"
    const val DASHBOARD = "dashboard"
    const val PROFILE = "profile"

    fun jobDetail(id: String) = "jobs/$id"
    fun jobEdit(id: String = "new") = "jobs/edit?id=$id"
    fun eventDetail(id: String) = "events/$id"
    fun eventEdit(id: String = "new") = "events/edit?id=$id"
    fun courseDetail(id: String) = "courses/$id"
    fun courseEdit(id: String = "new") = "courses/edit?id=$id"
    fun companyDetail(id: String) = "companies/$id"
    fun companyEdit(id: String = "new") = "companies/edit?id=$id"
    fun candidateDetail(id: String) = "hiring/candidates/$id"
    fun candidateEdit(id: String = "new") = "hiring/candidates/edit?id=$id"
    fun callLog(
        candidateId: String,
        name: String? = null,
        phone: String? = null,
        roleId: String? = null,
        roleName: String? = null,
    ): String {
        fun enc(s: String?) = java.net.URLEncoder.encode(s ?: "", "UTF-8")
        return "calls/log/$candidateId?name=${enc(name)}&phone=${enc(phone)}&roleId=${enc(roleId)}&roleName=${enc(roleName)}"
    }
}
