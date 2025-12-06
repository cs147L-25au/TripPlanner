# Trip Planner - Collaborative Travel Planning App

A collaborative travel planning app that helps groups manage shared itineraries, replacing dispersed group chats and spreadsheets with a single shared timeline.

## Features

- **Shared Multi-Day Itinerary & Timeline**: Create trips and add flights, lodging, and activities across multiple days
- **Timeline View**: Main "Itinerary" screen shows a timeline view that breaks down the trip to its events per day
- **Item Details**: Each item has time, location, notes, and who booked it
- **Trip Management**: Create trips and manage trip members
- **Planning Tools**: Tasks, packing lists, and payments (existing features)

## Tech Stack

- **Expo Router**: File-based routing with tab navigation
- **React Native**: Cross-platform mobile development
- **Supabase**: Backend database and real-time capabilities
- **TypeScript**: Type-safe development

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

**Important:** You must create a `.env` file in the root directory with your Supabase credentials.

1. Create a file named `.env` in the root directory (same level as `package.json`)
2. Add the following content:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** in the settings menu
   - Copy the **Project URL** → use for `EXPO_PUBLIC_SUPABASE_URL`
   - Copy the **anon/public key** → use for `EXPO_PUBLIC_SUPABASE_ANON_KEY`

4. **Restart the Expo server** after creating/updating the `.env` file:
   ```bash
   # Stop the current server (Ctrl+C) and restart
   npm start
   ```

**Note:** The `.env` file is in `.gitignore` and won't be committed to git (this is intentional for security).

### 4. Run the App

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Project Structure

```
├── app/
│   ├── _layout.tsx          # Root layout
│   └── (tabs)/
│       ├── _layout.tsx      # Tab navigator
│       ├── itinerary.tsx    # Itinerary timeline screen
│       └── planning.tsx     # Planning screen (tasks, packing, payments)
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── types/
│   └── database.ts         # TypeScript types for database
├── supabase/
│   └── schema.sql          # Database schema
└── collab_planner_147.tsx  # Original planning screen
```

## Database Schema

### Tables

- **trips**: Stores trip information (name, dates)
- **trip_members**: Stores members of each trip
- **itinerary_items**: Stores flights, lodging, and activities with time, location, notes, and who booked it

## Features in Detail

### Itinerary Screen

- **Timeline View**: Items grouped by date using SectionList
- **Item Types**: Flight, Lodging, Activity (color-coded)
- **Add/Edit Items**: Modal form to add or edit itinerary items
- **Trip Selection**: Select which trip to view
- **Item Details**: Time, location, notes, and who booked it

### Planning Screen

- Tasks management
- Packing lists
- Payment tracking

## Development

The app uses Expo Router for navigation. Routes are defined by the file structure in the `app/` directory.

### Adding New Features

1. Create new screens in `app/(tabs)/` for tab screens
2. Use Supabase client from `lib/supabase.ts` for database operations
3. Add types to `types/database.ts` as needed

## Notes

- Currently uses mock user authentication (hardcoded "Claudia")
- Row Level Security (RLS) policies are set to allow all operations - you should restrict these based on your authentication setup
- The app is designed with a warm, inviting color scheme

