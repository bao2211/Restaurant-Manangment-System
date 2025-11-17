# 🍽️ RMS Android - Customer App
## Restaurant Management System for Android

### ✅ What Has Been Created

The foundational structure of your Android customer app has been set up:

#### 📦 Dependencies Added (build.gradle.kts)
- Retrofit 2.9.0 (REST API client)
- Gson Converter (JSON parsing)
- OkHttp 4.11.0 (HTTP client)
- Glide 4.16.0 (Image loading)
- Material Design Components
- RecyclerView, CardView
- Navigation Component
- ViewBinding enabled

#### 🏗️ Core Components Created

**Models** (✅ Complete)
- `User.java` - User data model
- `FoodInfo.java` - Food item model
- `Category.java` - Category model
- `Order.java` - Order model
- `TableInfo.java` - Table model
- `UserFavorite.java` - Favorites model

**API Layer** (✅ Complete)
- `ApiService.java` - Retrofit API interface with all endpoints
- `RetrofitClient.java` - Retrofit client configuration

**Utilities** (✅ Complete)
- `SessionManager.java` - User session management
- `FormatUtils.java` - Formatting helpers (price, status)

**Activities** (✅ Core Activities)
- `LoginActivity.java` - User login
- `RegisterActivity.java` - New user registration
- `MainActivity.java` - Main container with bottom navigation

---

### 📋 Remaining Work

You need to create the following components to complete the app:

#### 1. Fragments (Main UI Components)

Create these 5 fragment files in `fragments/` folder:

**MenuFragment.java** - Browse menu, search, filter by category
**FavoritesFragment.java** - View and manage favorite foods
**OrdersFragment.java** - View order history and status
**TablesFragment.java** - View and book tables
**ProfileFragment.java** - User profile and logout

#### 2. Adapters (RecyclerView Adapters)

Create these adapter files in `adapters/` folder:

**FoodAdapter.java** - Display food items in list
**CategoryAdapter.java** - Display categories
**OrderAdapter.java** - Display orders
**TableAdapter.java** - Display tables

#### 3. Layout Files (XML Resources)

Create these layout files in `res/layout/` folder:

**Activity Layouts:**
- `activity_login.xml`
- `activity_register.xml`
- `activity_main.xml`

**Fragment Layouts:**
- `fragment_menu.xml`
- `fragment_favorites.xml`
- `fragment_orders.xml`
- `fragment_tables.xml`
- `fragment_profile.xml`

**Item Layouts (for RecyclerViews):**
- `item_food.xml`
- `item_category.xml`
- `item_order.xml`
- `item_table.xml`

#### 4. Menu Resource

Create `res/menu/bottom_navigation_menu.xml` for bottom navigation

#### 5. Update AndroidManifest.xml

Add activities, internet permission, and network security config

#### 6. Additional Resources

- Strings (res/values/strings.xml)
- Colors (res/values/colors.xml)
- Dimensions (res/values/dimens.xml)
- Drawable resources (icons, backgrounds)

---

### 🚀 Quick Start Guide

#### Step 1: Sync Gradle
1. Open the project in Android Studio
2. Click "Sync Now" when prompted
3. Wait for dependencies to download

#### Step 2: Update AndroidManifest.xml

Add to `app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Internet Permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.RMSAndroid"
        android:usesCleartextTraffic="true"
        tools:targetApi="36">
        
        <!-- Login Activity (Launcher) -->
        <activity
            android:name=".activities.LoginActivity"
            android:exported="true"
            android:theme="@style/Theme.RMSAndroid.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Register Activity -->
        <activity
            android:name=".activities.RegisterActivity"
            android:exported="false"
            android:theme="@style/Theme.RMSAndroid.NoActionBar" />

        <!-- Main Activity -->
        <activity
            android:name=".activities.MainActivity"
            android:exported="false" />

    </application>

</manifest>
```

#### Step 3: Test API Connection

Run the app and test login with credentials from your API server.

---

### 📱 App Features

✅ **Authentication**
- Login with username/password
- Register new customer account
- Session persistence
- Customer-only access

✅ **Menu Browsing**
- View all food items
- Browse by category
- Search functionality
- View food details and prices

✅ **Favorites**
- Add foods to favorites
- Remove from favorites
- View favorites list
- Sync with server

✅ **Ordering**
- Create new orders
- Add items to order
- Track order status in real-time
- View order history

✅ **Table Booking**
- View available tables
- Check table status
- Book a table
- View table capacity

✅ **Profile**
- View account information
- Update profile
- Logout functionality

---

### 🔗 API Endpoints Used

All endpoints connect to: `http://46.250.231.129:8080/api/`

- `POST /User/login` - User login
- `POST /User` - User registration
- `GET /FoodInfo` - Get all foods
- `GET /FoodInfo/category/{id}` - Get foods by category
- `GET /Category` - Get all categories
- `GET /Order/user/{userId}` - Get user orders
- `POST /Order` - Create order
- `GET /TableInfo` - Get all tables
- `GET /TableInfo/status/{status}` - Get tables by status
- `GET /UserFavorite/user/{userId}` - Get favorites
- `POST /UserFavorite` - Add favorite
- `DELETE /UserFavorite/user/{userId}/food/{foodId}` - Remove favorite

---

### 🎨 Design Patterns Used

- **MVC Architecture** - Models, Views (Activities/Fragments), API layer
- **Singleton Pattern** - RetrofitClient, SessionManager
- **Repository Pattern** - API service interfaces
- **Observer Pattern** - Retrofit callbacks
- **ViewHolder Pattern** - RecyclerView adapters

---

### 🔐 Security Features

- Password validation (min 6 characters)
- Customer role validation on login
- Session token management
- HTTPS support (cleartext traffic for development)
- Input validation on all forms

---

### 📊 Next Steps

1. **Create Layout Files** - Design the UI for all activities and fragments
2. **Create Fragment Classes** - Implement the 5 main fragments
3. **Create Adapter Classes** - Implement RecyclerView adapters
4. **Add Icons & Drawables** - Add visual assets
5. **Test on Device/Emulator** - Run and test all features
6. **Polish UI/UX** - Improve design and user experience
7. **Add Error Handling** - Handle edge cases
8. **Optimize Performance** - Cache data, optimize images

---

### 💡 Code Examples

#### Example: Simple Fragment Template

```java
package com.example.rmsandroid.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.rmsandroid.R;

public class MenuFragment extends Fragment {
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_menu, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize views and load data here
    }
}
```

#### Example: Simple RecyclerView Adapter

```java
package com.example.rmsandroid.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.example.rmsandroid.R;
import com.example.rmsandroid.models.FoodInfo;
import java.util.List;

public class FoodAdapter extends RecyclerView.Adapter<FoodAdapter.ViewHolder> {
    
    private List<FoodInfo> foods;
    
    public FoodAdapter(List<FoodInfo> foods) {
        this.foods = foods;
    }
    
    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_food, parent, false);
        return new ViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FoodInfo food = foods.get(position);
        holder.bind(food);
    }
    
    @Override
    public int getItemCount() {
        return foods.size();
    }
    
    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvPrice;
        
        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_food_name);
            tvPrice = itemView.findViewById(R.id.tv_food_price);
        }
        
        void bind(FoodInfo food) {
            tvName.setText(food.getFoodName());
            tvPrice.setText(String.valueOf(food.getUnitPrice()));
        }
    }
}
```

---

### 📞 Support

If you need help with implementation:
1. Check Android documentation
2. Review the API documentation
3. Test endpoints with Postman
4. Check logcat for errors

---

### ✨ Features to Add Later

- Push notifications for order updates
- QR code scanning for table booking
- Payment integration
- Order rating and reviews
- Food recommendations
- Offline mode with local database
- Dark mode support

---

**Created:** November 17, 2025  
**API Server:** http://46.250.231.129:8080  
**Target SDK:** Android 14 (API 36)  
**Min SDK:** Android 7.0 (API 24)

