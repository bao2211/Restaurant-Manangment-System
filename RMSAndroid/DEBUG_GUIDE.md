# Android Debugging Guide for VS Code

## Method 1: View Logs in VS Code Terminal

### Start Logcat (View all logs)
```powershell
adb logcat -s "AndroidRuntime:E" "System.err:W" "*:E"
```

### Filter for your app only
```powershell
adb logcat --pid=$(adb shell pidof -s com.example.rmsandroid)
```

### Clear logs and start fresh
```powershell
adb logcat -c ; adb logcat
```

### View crash logs only
```powershell
adb logcat -s "AndroidRuntime:E"
```

## Method 2: Use VS Code Extensions

Install these extensions:
1. **Extension Pack for Java** - Full Java support with debugger
2. **Android** by adelphes - Android debugging support

## Method 3: Set Breakpoints in Code

Once you install the Java extension pack:

1. Open any Java file (e.g., LoginActivity.java)
2. Click left of line number to set breakpoint (red dot)
3. Start app in debug mode from Android Studio or command line
4. Use VS Code's Debug panel (Ctrl+Shift+D)

## Useful ADB Commands

### Check connected devices
```powershell
adb devices
```

### Install APK
```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Uninstall app
```powershell
adb uninstall com.example.rmsandroid
```

### Force stop app
```powershell
adb shell am force-stop com.example.rmsandroid
```

### Launch app
```powershell
adb shell am start -n com.example.rmsandroid/.activities.LoginActivity
```

### View app data
```powershell
adb shell run-as com.example.rmsandroid ls /data/data/com.example.rmsandroid/shared_prefs/
```

## Quick Debug Session

1. Build and install: `.\gradlew installDebug`
2. Clear logcat: `adb logcat -c`
3. Start logcat: `adb logcat --pid=$(adb shell pidof -s com.example.rmsandroid)`
4. Launch app on device
5. Watch logs in terminal
