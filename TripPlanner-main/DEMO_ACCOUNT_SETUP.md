# Demo Account Setup Instructions

## Overview
The app now supports a demo account that contains all sample data. New accounts start with empty data.

## Demo Account Credentials
- **Email**: `demo@tripplanner.com`
- **Password**: `demo123`

## Setup Steps

### 1. Create Demo Account in Supabase Auth
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** > **Create new user**
4. Enter:
   - Email: `demo@tripplanner.com`
   - Password: `demo123`
   - Auto Confirm User: ✅ (check this box)
5. Click **Create user**

### 2. Run the Seed Script
1. Go to **SQL Editor** in Supabase
2. Copy and paste the contents of `supabase/seed_demo.sql`
3. Click **Run** to execute the script
4. This will populate the demo account with all sample data:
   - 3 trips (Summer Trip, Winter Getaway, Beach Vacation)
   - 5 tasks/responsibilities
   - 5 packing items
   - 3 payments
   - 6 expenses

### 3. Verify Setup
1. Log in to the app with `demo@tripplanner.com` / `demo123`
2. You should see all the sample data (trips, tasks, expenses, etc.)
3. Create a new account and verify it starts with empty data

## How It Works
- The app detects if the logged-in user is `demo@tripplanner.com`
- If it's the demo account: Shows hardcoded sample data
- If it's a new account: Loads data from Supabase (empty initially, populated as user adds data)

## Notes
- The demo account data is stored in the database but the app uses hardcoded data for display
- New accounts save all data to Supabase and load from there
- All CRUD operations work for both demo and new accounts

