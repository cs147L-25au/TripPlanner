# Setup Instructions for Graders/TAs

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase** (Required):
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key
   - Go to SQL Editor
   - Run the contents of `supabase/schema.sql` to create all tables
   - Add credentials to `.env` file

4. **Run the app**:
   ```bash
   npm start
   ```
   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator  
   - Or scan QR code with Expo Go app

## Testing Checklist

- ✅ App starts without errors
- ✅ Can sign up and login
- ✅ Can navigate between screens
- ✅ Can add tasks, packing items, payments
- ✅ Calendar date picker works
- ✅ Keyboard doesn't block input fields
- ✅ Animations work on button presses
- ✅ Timer shows countdown on tasks
- ✅ All screens accessible via navigation

## Troubleshooting

**If you see "Cannot find module" errors:**
- Run `npm install --legacy-peer-deps` again
- Clear cache: `npx expo start -c`

**If Supabase connection fails:**
- Verify `.env` file exists and has correct values
- Check Supabase project is active
- Verify database schema was run successfully

## Project Structure

```
TripPlanner-main/
├── app/
│   ├── (tabs)/              # Main app screens (protected routes)
│   │   ├── index.tsx        # Home screen
│   │   ├── collab_planner_147.tsx
│   │   └── budget_tracker.tsx
│   ├── login.tsx            # Public route
│   ├── signup.tsx           # Public route
│   └── _layout.tsx          # Root layout with auth routing
├── components/              # Reusable components
│   ├── AnimatedButton.tsx
│   ├── DatePicker.tsx
│   └── TaskTimer.tsx
├── lib/                     # Utilities
│   └── supabase.ts
├── supabase/
│   └── schema.sql          # Database schema
├── assets/                 # App icons (add your images here)
├── .env                    # Environment variables (create this)
├── package.json
└── README.md
```

## Requirements Met

See `REQUIREMENTS_CHECKLIST.md` for detailed breakdown of all technical requirements.

