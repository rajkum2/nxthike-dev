package com.nxthike.android.di

import com.nxthike.android.BuildConfig
import com.nxthike.android.data.remote.api.*
import com.nxthike.android.data.remote.interceptor.AuthInterceptor
import com.nxthike.android.data.remote.moshi.LenientStringAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides @Singleton
    fun provideMoshi(): Moshi = Moshi.Builder()
        // Registered before the reflective factory so the qualifier wins.
        .add(LenientStringAdapter)
        .add(KotlinJsonAdapterFactory())
        .build()

    @Provides @Singleton
    fun provideOkHttp(authInterceptor: AuthInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC
            else HttpLoggingInterceptor.Level.NONE
        }
        // The hiring dashboard is fanned out per role; the default cap of 5
        // requests per host turns that into several serial rounds.
        val dispatcher = okhttp3.Dispatcher().apply {
            maxRequests = 32
            maxRequestsPerHost = 12
        }
        return OkHttpClient.Builder()
            .dispatcher(dispatcher)
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    @Provides @Singleton
    fun provideRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides @Singleton fun authApi(r: Retrofit): AuthApi = r.create(AuthApi::class.java)
    @Provides @Singleton fun jobsApi(r: Retrofit): JobsApi = r.create(JobsApi::class.java)
    @Provides @Singleton fun eventsApi(r: Retrofit): EventsApi = r.create(EventsApi::class.java)
    @Provides @Singleton fun coursesApi(r: Retrofit): CoursesApi = r.create(CoursesApi::class.java)
    @Provides @Singleton fun companiesApi(r: Retrofit): CompaniesApi = r.create(CompaniesApi::class.java)
    @Provides @Singleton fun hiringApi(r: Retrofit): HiringApi = r.create(HiringApi::class.java)
    @Provides @Singleton fun dashboardApi(r: Retrofit): DashboardApi = r.create(DashboardApi::class.java)
    @Provides @Singleton fun callsApi(r: Retrofit): CallsApi = r.create(CallsApi::class.java)
    @Provides @Singleton fun workspaceApi(r: Retrofit): WorkspaceApi = r.create(WorkspaceApi::class.java)
}
