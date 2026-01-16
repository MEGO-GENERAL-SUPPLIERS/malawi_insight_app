# Welcome to Malawi Insight App (revised)

# Android apk building
Make sure that:
1. react-router.config.ts has `ssr: false`
2. capacitor.config.ts has `webDir: 'build/client'`

To build, you: 
1. Clean build, android and ios (if any) `rm -rf <dir>`
2. run `npx react-router build`
3. run `npx cap add android`
4. run `npx cap sync android`  
5. run `npx cap open android` or open the android folder in Android studio in the OS environment the application reside.

NOTE: for production disable the following: 
```capacitor.config.ts```
server: {
  cleartext: false,
  androidScheme: "https"
}

```AndroidManifest.xml```
android:usesCleartextTraffic="false"

```network_security_config.xml```
<base-config cleartextTrafficPermitted="false">

Generate a Debug APK (Testing)
1. Go to Build > Build Bundle(s) / APK(s) > Build APK(s).
2. Wait for the background "Gradle build" to finish
3. A notification will appear at the bottom right. Click Locate to find your app-debug.apk.
4. Path: android/app/build/outputs/apk/debug/.