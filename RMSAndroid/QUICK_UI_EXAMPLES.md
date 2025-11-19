# Quick UI Examples - Copy & Paste Ready

## 🎯 Immediate Improvements You Can Make

### 1. Replace ALL Toast Messages with FancyToast

**Find in your project:**
```java
Toast.makeText(context, "Message", Toast.LENGTH_SHORT).show();
```

**Replace with:**
```java
// Success (green)
FancyToast.makeText(this, "Đã thêm vào giỏ hàng!", FancyToast.LENGTH_SHORT, FancyToast.SUCCESS, false).show();

// Error (red)
FancyToast.makeText(this, "Lỗi kết nối!", FancyToast.LENGTH_SHORT, FancyToast.ERROR, false).show();

// Warning (orange)
FancyToast.makeText(this, "Vui lòng đăng nhập!", FancyToast.LENGTH_SHORT, FancyToast.WARNING, false).show();

// Info (blue)
FancyToast.makeText(this, "Đang tải dữ liệu...", FancyToast.LENGTH_SHORT, FancyToast.INFO, false).show();
```

---

### 2. Add Shimmer Loading to FavoritesFragment

**Step 1:** Create `shimmer_food_item.xml` in `res/layout/`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="4dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical">

        <!-- Image placeholder -->
        <View
            android:layout_width="match_parent"
            android:layout_height="200dp"
            android:background="#E0E0E0"/>

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:padding="12dp"
            android:orientation="vertical">

            <!-- Title placeholder -->
            <View
                android:layout_width="200dp"
                android:layout_height="20dp"
                android:background="#E0E0E0"/>

            <!-- Description placeholder -->
            <View
                android:layout_width="match_parent"
                android:layout_height="16dp"
                android:layout_marginTop="8dp"
                android:background="#E0E0E0"/>

            <!-- Price placeholder -->
            <View
                android:layout_width="100dp"
                android:layout_height="18dp"
                android:layout_marginTop="8dp"
                android:background="#E0E0E0"/>

        </LinearLayout>
    </LinearLayout>
</androidx.cardview.widget.CardView>
```

**Step 2:** Update `fragment_favorites.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- Shimmer Loading Layout -->
    <com.facebook.shimmer.ShimmerFrameLayout
        android:id="@+id/shimmer_layout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:visibility="visible">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical">

            <include layout="@layout/shimmer_food_item"/>
            <include layout="@layout/shimmer_food_item"/>
            <include layout="@layout/shimmer_food_item"/>
            <include layout="@layout/shimmer_food_item"/>

        </LinearLayout>
    </com.facebook.shimmer.ShimmerFrameLayout>

    <!-- Your existing RecyclerView -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recycler_view"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:visibility="gone"/>

    <!-- Empty state -->
    <TextView
        android:id="@+id/tv_empty"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:text="Chưa có món ăn yêu thích"
        android:visibility="gone"/>

</FrameLayout>
```

**Step 3:** Update `FavoritesFragment.java`:
```java
import com.facebook.shimmer.ShimmerFrameLayout;
import io.github.shashank02051997.fancytoast.FancyToast;

public class FavoritesFragment extends Fragment {
    private ShimmerFrameLayout shimmerLayout;
    private RecyclerView recyclerView;
    private TextView tvEmpty;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_favorites, container, false);
        
        shimmerLayout = view.findViewById(R.id.shimmer_layout);
        recyclerView = view.findViewById(R.id.recycler_view);
        tvEmpty = view.findViewById(R.id.tv_empty);
        
        // Start shimmer
        shimmerLayout.startShimmer();
        
        loadFavorites();
        return view;
    }

    private void loadFavorites() {
        // Your API call...
        
        apiService.getUserFavorites(userId).enqueue(new Callback<List<UserFavorite>>() {
            @Override
            public void onResponse(Call<List<UserFavorite>> call, Response<List<UserFavorite>> response) {
                // Stop shimmer and show content
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                
                if (response.body() != null && !response.body().isEmpty()) {
                    recyclerView.setVisibility(View.VISIBLE);
                    // Set your adapter
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<List<UserFavorite>> call, Throwable t) {
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                FancyToast.makeText(getContext(), "Lỗi kết nối: " + t.getMessage(), 
                    FancyToast.LENGTH_SHORT, FancyToast.ERROR, false).show();
            }
        });
    }
}
```

---

### 3. Add Lottie Loading Animation

**Step 1:** Download a free animation from https://lottiefiles.com/
- Search for "food loading" or "restaurant"
- Download JSON file
- Place in `app/src/main/res/raw/` folder (create if doesn't exist)
- Rename to `loading_animation.json`

**Step 2:** Replace ProgressBar with Lottie:

**Old:**
```xml
<ProgressBar
    android:id="@+id/progress_bar"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_gravity="center"/>
```

**New:**
```xml
<com.airbnb.lottie.LottieAnimationView
    android:id="@+id/animation_loading"
    android:layout_width="200dp"
    android:layout_height="200dp"
    android:layout_gravity="center"
    app:lottie_rawRes="@raw/loading_animation"
    app:lottie_autoPlay="true"
    app:lottie_loop="true"/>
```

**In Java:**
```java
import com.airbnb.lottie.LottieAnimationView;

LottieAnimationView loadingAnimation = view.findViewById(R.id.animation_loading);
loadingAnimation.setVisibility(View.VISIBLE);

// When done loading:
loadingAnimation.setVisibility(View.GONE);
```

---

### 4. Use Responsive Sizing (SDP/SSP)

**Convert your hardcoded sizes to responsive ones:**

**Old `item_food.xml`:**
```xml
<TextView
    android:id="@+id/tv_food_name"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:textSize="18sp"
    android:padding="16dp"/>

<ImageView
    android:id="@+id/img_food"
    android:layout_width="match_parent"
    android:layout_height="200dp"/>
```

**New with SDP/SSP:**
```xml
<TextView
    android:id="@+id/tv_food_name"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:textSize="@dimen/_18ssp"
    android:padding="@dimen/_16sdp"/>

<ImageView
    android:id="@+id/img_food"
    android:layout_width="match_parent"
    android:layout_height="@dimen/_200sdp"/>
```

**Common Conversions:**
- `8dp` → `@dimen/_8sdp`
- `12dp` → `@dimen/_12sdp`
- `16dp` → `@dimen/_16sdp`
- `24dp` → `@dimen/_24sdp`
- `14sp` → `@dimen/_14ssp`
- `16sp` → `@dimen/_16ssp`
- `18sp` → `@dimen/_18ssp`

---

### 5. Enhanced Button with Balloon Tooltip

**Show helpful tooltips to users:**

```java
import com.skydoves.balloon.Balloon;
import com.skydoves.balloon.BalloonAnimation;

// Create a tooltip
Balloon balloon = new Balloon.Builder(context)
    .setArrowSize(10)
    .setArrowPosition(0.5f)
    .setWidth(BalloonSizeSpec.WRAP)
    .setHeight(BalloonSizeSpec.WRAP)
    .setText("Nhấn để thêm vào giỏ hàng")
    .setTextColorResource(R.color.white)
    .setBackgroundColorResource(R.color.colorPrimary)
    .setCornerRadius(8f)
    .setAlpha(0.9f)
    .setBalloonAnimation(BalloonAnimation.ELASTIC)
    .setLifecycleOwner(lifecycleOwner)
    .build();

// Show on button
balloon.showAlignTop(addToCartButton);

// Auto dismiss after 3 seconds
balloon.dismissWithDelay(3000L);
```

---

### 6. Material Rating Bar for Food Reviews

**Add to your food detail layout:**

```xml
<me.zhanghai.android.materialratingbar.MaterialRatingBar
    android:id="@+id/rating_bar"
    style="@style/Widget.MaterialRatingBar.RatingBar"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:numStars="5"
    android:rating="0"
    android:stepSize="0.5"
    app:mrb_progressTint="@color/orange"
    app:mrb_secondaryProgressTint="@color/gray_light"/>
```

**In Java:**
```java
import me.zhanghai.android.materialratingbar.MaterialRatingBar;

MaterialRatingBar ratingBar = findViewById(R.id.rating_bar);
ratingBar.setRating(4.5f); // Set rating
ratingBar.setIsIndicator(true); // Read-only, or false for user input
```

---

### 7. Apply These Changes Right Now

**Priority Order:**

1. ✅ **FancyToast** - Replace all Toast calls (5 minutes)
   - Search: `Toast.makeText`
   - Add import: `import io.github.shashank02051997.fancytoast.FancyToast;`

2. ✅ **Shimmer Loading** - Add to FavoritesFragment (10 minutes)
   - Create shimmer layout
   - Update fragment layout
   - Update Java code

3. ✅ **SDP/SSP** - Make layouts responsive (15 minutes)
   - Replace `dp` with `@dimen/_XXsdp`
   - Replace `sp` with `@dimen/_XXssp`

4. ✅ **Lottie Animation** - Replace ProgressBar (10 minutes)
   - Download animation
   - Update XML
   - Update Java code

5. ✅ **Balloon Tooltips** - Add helpful hints (5 minutes)
   - Add to important buttons
   - Guide new users

---

## 📱 Test Your Changes

Run the app and you'll immediately see:
- ✨ Colorful toast messages
- 💫 Smooth shimmer loading effects
- 🎨 Responsive layouts on all screen sizes
- 🎬 Beautiful animations
- ℹ️ Helpful tooltips

---

## 🎯 Next Steps

After these basic improvements:
1. Add Lottie animation to splash screen
2. Use Balloon for onboarding new features
3. Add rating bars to food reviews
4. Create custom color picker for themes

---

## 💡 Tips

- Test on different screen sizes to see SDP/SSP in action
- Use Lottie for empty states (empty cart, no favorites)
- Add shimmer to all list views (menu, orders, favorites)
- Use FancyToast everywhere for consistent UI
- Add tooltips to new features for better UX

