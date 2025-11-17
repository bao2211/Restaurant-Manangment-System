package com.example.rmsandroid.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.rmsandroid.models.User;
import com.google.gson.Gson;

public class SessionManager {
    private static final String PREF_NAME = "RMSAppSession";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_USER = "user";
    
    private final SharedPreferences prefs;
    private final SharedPreferences.Editor editor;
    private final Gson gson;
    
    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
        gson = new Gson();
    }
    
    // Save user session
    public void saveUser(User user) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER, gson.toJson(user));
        editor.apply();
    }
    
    // Get current user
    public User getUser() {
        String userJson = prefs.getString(KEY_USER, null);
        if (userJson != null) {
            return gson.fromJson(userJson, User.class);
        }
        return null;
    }
    
    // Check if user is logged in
    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }
    
    // Clear session (logout)
    public void logout() {
        editor.clear();
        editor.apply();
    }
    
    // Update user data
    public void updateUser(User user) {
        editor.putString(KEY_USER, gson.toJson(user));
        editor.apply();
    }
}
