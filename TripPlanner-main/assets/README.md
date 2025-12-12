# Assets Directory

Place your app icon and splash screen images here:

- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen (1242x2436px recommended)
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)

You can generate these using:
- Expo's asset generator: https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/
- Or use a tool like https://www.appicon.co/

For now, Expo will use default icons. To add custom ones:
1. Create the images with the dimensions above
2. Place them in this `assets/` folder
3. Run `npx expo prebuild` to regenerate native files

