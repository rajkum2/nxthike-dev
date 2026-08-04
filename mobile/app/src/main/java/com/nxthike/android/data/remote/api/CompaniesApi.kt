package com.nxthike.android.data.remote.api

import com.nxthike.android.data.remote.dto.*
import retrofit2.http.*

interface CompaniesApi {
    @GET("api/companies")
    suspend fun list(): List<CompanyDto>

    @GET("api/companies/{id}")
    suspend fun get(@Path("id") id: String): CompanyDto

    @POST("api/companies")
    suspend fun create(@Body body: CompanyWriteDto): CompanyDto

    @PUT("api/companies/{id}")
    suspend fun update(@Path("id") id: String, @Body body: CompanyWriteDto): CompanyDto

    @DELETE("api/companies/{id}")
    suspend fun delete(@Path("id") id: String): Map<String, String>
}
