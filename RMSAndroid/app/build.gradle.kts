plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.rmsandroid"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.rmsandroid"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    
    buildFeatures {
        viewBinding = true
    }
    
    lint {
        abortOnError = false
    }
}

dependencies {
    // Core Android
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    
    // Networking - Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
    
    // Image Loading - Glide with Rounded Images Support
    implementation("com.github.bumptech.glide:glide:4.16.0")
    annotationProcessor("com.github.bumptech.glide:compiler:4.16.0")
    
    // Enhanced Image Views
    implementation("de.hdodenhof:circleimageview:3.1.0")
    implementation("com.makeramen:roundedimageview:2.3.0")
    
    // RecyclerView & CardView
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.cardview:cardview:1.0.0")
    
    // SwipeRefreshLayout
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    
    // ViewPager2 for tabs
    implementation("androidx.viewpager2:viewpager2:1.0.0")
    
    // Navigation Component
    implementation("androidx.navigation:navigation-fragment:2.7.5")
    implementation("androidx.navigation:navigation-ui:2.7.5")
    
    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel:2.6.2")
    implementation("androidx.lifecycle:lifecycle-livedata:2.6.2")
    
    // Shared Preferences (User Session)
    implementation("androidx.preference:preference:1.2.1")
    
    // ============ ENHANCED UI LIBRARIES ============
    
    // Lottie Animations - Beautiful, smooth animations from JSON
    implementation("com.airbnb.android:lottie:6.1.0")
    
    // Shimmer Effect - Elegant loading placeholders
    implementation("com.facebook.shimmer:shimmer:0.5.0")
    
    // Toasty - Enhanced colorful toast notifications (more reliable)
    implementation("com.github.GrenderG:Toasty:1.5.2")
    
    // Material Rating Bar - Better rating UI
    implementation("me.zhanghai.android.materialratingbar:library:1.4.0")
    
    // SDP/SSP - Scalable size units for responsive design
    implementation("com.intuit.sdp:sdp-android:1.1.0")
    implementation("com.intuit.ssp:ssp-android:1.1.0")
    
    // Balloon - Modern tooltips and popups
    implementation("com.github.skydoves:balloon:1.6.4")
    
    // ColorPicker - Beautiful color picker dialog
    implementation("com.github.skydoves:colorpickerview:2.3.0")
    
    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}