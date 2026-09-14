import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "io.github.teninz.shadowfox"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.teninz.shadowfox"   // тот же id, что у Capacitor-версии: магазин примет как обновление
        minSdk = 26
        targetSdk = 36
        versionCode = 100
        versionName = "2.0.0-alpha1"
        vectorDrawables { useSupportLibrary = true }
    }

    // подпись тем же ключом: из переменных окружения (GitHub Actions) или keystore.properties локально
    signingConfigs {
        create("release") {
            val props = Properties()
            val f = rootProject.file("keystore.properties")
            if (f.exists()) props.load(f.inputStream())
            storeFile = file(System.getenv("SF_KEYSTORE") ?: props.getProperty("storeFile", "../../apk/signing.keystore"))
            storePassword = System.getenv("SF_STORE_PASSWORD") ?: props.getProperty("storePassword", "")
            keyAlias = System.getenv("SF_KEY_ALIAS") ?: props.getProperty("keyAlias", "my-key-alias")
            keyPassword = System.getenv("SF_KEY_PASSWORD") ?: props.getProperty("keyPassword", "")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_21; targetCompatibility = JavaVersion.VERSION_21 }
    kotlinOptions { jvmTarget = "21" }
    buildFeatures { compose = true }
    packaging { resources.excludes += "/META-INF/{AL2.0,LGPL2.1}" }
}

dependencies {
    val bom = platform("androidx.compose:compose-bom:2025.08.00")
    implementation(bom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.2")
    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.core:core-splashscreen:1.2.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}
