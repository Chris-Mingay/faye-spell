 jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
cd platforms\android\build\outputs\apk\
c:\android\sdk\build-tools\19.1.0\zipalign.exe -v 4 android-release-unsigned.apk release-%1.apk
cd ../../../../../