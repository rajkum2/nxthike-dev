import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.nxthike.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.nxthike.android"
        minSdk = 26
        targetSdk = 35
        versionCode = 9
        versionName = "2.2.1"
        // Production API (public). Override for local:
        //   ./gradlew assembleDebug -PapiBaseUrl=http://10.0.2.2:8010/
        //   ./gradlew assembleDebug -PapiBaseUrl=http://192.168.x.x:8010/
        val apiBase = (project.findProperty("apiBaseUrl") as String?)
            ?: "https://api.nxthike.com/"
        buildConfigField("String", "API_BASE_URL", "\"$apiBase\"")
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // Convenience sign-in for development builds only.
    //
    // Put these in `local.properties` (git-ignored) or pass -PdevLoginEmail=... :
    //
    //   devLoginEmail=admin@nxthike.com
    //   devLoginPassword=<the ADMIN_PASSWORD from BE/.env>
    //
    // They are compiled into the DEBUG build only, and the login screen
    // pre-fills them so a tester signs in with one tap. Release builds get empty
    // strings — a BuildConfig constant is recoverable from any APK with
    // `unzip` and `strings`, so a real credential must never reach one.
    val localProps = Properties()
    rootProject.file("local.properties").takeIf { it.exists() }?.let { f ->
        FileInputStream(f).use { localProps.load(it) }
    }
    fun devProp(name: String): String =
        (project.findProperty(name) as String?) ?: localProps.getProperty(name) ?: ""

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Never ship credentials, even if they are configured locally.
            buildConfigField("String", "DEV_LOGIN_EMAIL", "\"\"")
            buildConfigField("String", "DEV_LOGIN_PASSWORD", "\"\"")
        }
        debug {
            buildConfigField("String", "DEV_LOGIN_EMAIL", "\"${devProp("devLoginEmail")}\"")
            buildConfigField("String", "DEV_LOGIN_PASSWORD", "\"${devProp("devLoginPassword")}\"")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.4")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    implementation("com.google.dagger:hilt-android:2.52")
    ksp("com.google.dagger:hilt-compiler:2.52")

    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
    ksp("com.squareup.moshi:moshi-kotlin-codegen:1.15.1")

    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
