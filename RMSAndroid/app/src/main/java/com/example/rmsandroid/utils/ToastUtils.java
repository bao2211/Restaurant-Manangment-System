package com.example.rmsandroid.utils;

import android.content.Context;
import android.widget.Toast;

import es.dmoral.toasty.Toasty;

public class ToastUtils {
    
    public static void showSuccess(Context context, String message) {
        Toasty.success(context, message, Toast.LENGTH_SHORT, true).show();
    }
    
    public static void showError(Context context, String message) {
        Toasty.error(context, message, Toast.LENGTH_SHORT, true).show();
    }
    
    public static void showWarning(Context context, String message) {
        Toasty.warning(context, message, Toast.LENGTH_SHORT, true).show();
    }
    
    public static void showWarningLong(Context context, String message) {
        Toasty.warning(context, message, Toast.LENGTH_LONG, true).show();
    }
    
    public static void showInfo(Context context, String message) {
        Toasty.info(context, message, Toast.LENGTH_SHORT, true).show();
    }
}
