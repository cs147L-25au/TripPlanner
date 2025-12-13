# Trip Planner App

A collaborative trip planning application built with React Native and Expo.

## Features

- **Authentication**: Sign up and login with Supabase Auth
- **Collaborative Planner**: Manage tasks, packing lists, and payments
- **Budget Tracker**: Track expenses and balances
- **Database Integration**: All data persisted in Supabase
- **Calendar Date Picker**: Easy date selection with calendar component
- **Keyboard Handling**: Proper keyboard avoidance for better UX

## Setup Instructions

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. In your Supabase project, go to SQL Editor
2. Run the SQL script from `supabase/schema.sql` to create all tables and policies

### 4. Run the App

**Important**: After installing dependencies, restart with cache cleared:

```bash
npx expo start -c
```

Or:
```bash
npm start -- --clear
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app

**Note**: If you see errors related to `react-native-reanimated`, make sure to restart with `-c` flag to clear cache.

## Project Structure

```
TripPlanner-main/
├── app/
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx
│   │   ├── collab_planner_147.tsx
│   │   └── budget_tracker.tsx
│   ├── login.tsx        # Login screen
│   ├── signup.tsx       # Sign up screen
│   └── _layout.tsx      # Root layout with auth handling
├── components/
│   └── DatePicker.tsx   # Calendar date picker component
├── lib/
│   └── supabase.ts      # Supabase client configuration
└── supabase/
    └── schema.sql       # Database schema
```

## Key Improvements Made

1. ✅ **Single Folder Structure**: All files consolidated into one folder
2. ✅ **Authentication**: Added sign up and login screens with Supabase
3. ✅ **UI Improvements**: 
   - Removed duplicate top nav bar in collaborative planner
   - Improved reminder button with clear "🔔 Remind" label
4. ✅ **Database**: Complete Supabase setup with schema for all data
5. ✅ **Calendar**: Replaced manual date input with calendar picker
6. ✅ **Keyboard Handling**: Added KeyboardAvoidingView to prevent keyboard blocking
7. ✅ **Git Ignore**: node_modules already in .gitignore

## Environment Variables

Create a `.env` file in the root directory with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Technical Requirements Checklist

### Advanced Features ✅
- ✅ **Expo Device Integration**: 
  - `expo-status-bar` for status bar control
  - `expo-constants` for app constants
- ✅ **Animations**: 
  - React Native Reanimated for button animations
  - Animated task timer with pulsing effect for overdue items
  - Smooth transitions on interactions
- ✅ **Accessibility**: 
  - `accessibilityRole` on all interactive elements
  - `accessibilityLabel` for screen readers
  - `accessibilityState` for tab selection
  - Semantic HTML structure
- ✅ **Timers**: 
  - Task countdown timer showing time remaining until due date
  - Real-time updates every minute
  - Visual indicators for overdue tasks

### App Icon & Splash Screen ✅
- ✅ Custom app icon configured in `app.json`
- ✅ Custom splash screen configured
- ⚠️ **Note**: Place `icon.png` (1024x1024) and `splash.png` in `assets/` folder
- ⚠️ **Note**: Splash screen may not show in Expo Go (as per course update)

### Baseline Requirements (C3) ✅
- ✅ **Multiple Screens**: Login, Signup, Home, Planner, Budget Tracker
- ✅ **Complex Navigation**: Stack Navigator + Tab Navigator + Auth routing
- ✅ **Database**: Supabase with full CRUD operations
- ✅ **External API**: 
  - Exchange Rates API (exchangerate-api.com) for real-time currency conversion
  - Timezone API (worldtimeapi.org) for timezone information
- ✅ **Third-party Libraries**: 
  - `react-native-calendars` (calendar picker)
  - `@supabase/supabase-js` (database)
- ✅ **No Errors**: TypeScript types properly defined
- ✅ **Complex Layouts**: Multi-section forms, modals, filters, grouped lists
- ✅ **iOS & Android Support**: React Native with platform-specific styling
- ✅ **Visual Design**: Warm color palette, consistent spacing, thoughtful UI

## Notes

- The app uses Expo SDK 54
- React Native 0.81.5
- Supabase for backend and authentication
- Row Level Security (RLS) enabled for data protection
- All data is user-scoped and secure

## Testing Instructions

1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Set up environment variables** in `.env` file
3. **Set up Supabase database** by running `supabase/schema.sql`
4. **Start the app**: `npm start`
5. **Test on device**: Scan QR code with Expo Go or press `i`/`a` for simulators

The app should run successfully from scratch with these steps!

