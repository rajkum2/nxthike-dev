package com.nxthike.android.di

import com.nxthike.android.data.repository.*
import com.nxthike.android.domain.repository.*
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds @Singleton abstract fun auth(impl: AuthRepositoryImpl): AuthRepository
    @Binds @Singleton abstract fun jobs(impl: JobRepositoryImpl): JobRepository
    @Binds @Singleton abstract fun events(impl: EventRepositoryImpl): EventRepository
    @Binds @Singleton abstract fun courses(impl: CourseRepositoryImpl): CourseRepository
    @Binds @Singleton abstract fun companies(impl: CompanyRepositoryImpl): CompanyRepository
    @Binds @Singleton abstract fun hiring(impl: HiringRepositoryImpl): HiringRepository
    @Binds @Singleton abstract fun dashboard(impl: DashboardRepositoryImpl): DashboardRepository
    @Binds @Singleton abstract fun calls(impl: CallRepositoryImpl): CallRepository
}
