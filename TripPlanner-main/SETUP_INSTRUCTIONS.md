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

3. **Set up Supabase**:
   - Go to Project Settings > API for a new project
   - Copy  Project URL and anon/public key
   - Go to SQL Editor
   - Run the contents of `supabase/schema.sql` and `supabase/seed_demo.sql`
   - Add credentials to `.env` file

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

