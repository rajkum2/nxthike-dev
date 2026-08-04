package com.nxthike.android.di

import com.nxthike.android.BuildConfig
import com.nxthike.android.data.remote.api.*
import com.nxthike.android.data.remote.interceptor.AuthInterceptor
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
        .add(KotlinJsonAdapterFactory())
        .build()

    @Provides @Singleton
    fun provideOkHttp(authInterceptor: AuthInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC
            else HttpLoggingInterceptor.Level.NONE
        }
        return OkHttpClient.Builder()
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
}
