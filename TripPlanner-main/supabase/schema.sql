-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
-- Drop in order: dependent tables first, then parent tables
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.packing_items CASCADE;
DROP TABLE IF EXISTS public.responsibilities CASCADE;
DROP TABLE IF EXISTS public.trip_members CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  venmo TEXT,
  zelle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip members table (for invitations)
CREATE TABLE public.trip_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Responsibilities/Tasks table
CREATE TABLE public.responsibilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  trip_name TEXT NOT NULL,
  trip_date DATE,
  complete_by DATE NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packing items table
CREATE TABLE public.packing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  trip_name TEXT NOT NULL,
  bag TEXT NOT NULL,
  packed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  from_person TEXT NOT NULL,
  to_person TEXT NOT NULL,
  trip_name TEXT NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table (for budget tracker)
CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  category TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  split_between TEXT[] NOT NULL,
  trip_name TEXT NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_responsibilities_user_id ON public.responsibilities(user_id);
CREATE INDEX idx_responsibilities_trip_id ON public.responsibilities(trip_id);
CREATE INDEX idx_packing_items_user_id ON public.packing_items(user_id);
CREATE INDEX idx_packing_items_trip_id ON public.packing_items(trip_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_trip_id ON public.payments(trip_id);
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trip_members_trip_id ON public.trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON public.trip_members(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can insert own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view own responsibilities" ON public.responsibilities;
DROP POLICY IF EXISTS "Users can insert own responsibilities" ON public.responsibilities;
DROP POLICY IF EXISTS "Users can update own responsibilities" ON public.responsibilities;
DROP POLICY IF EXISTS "Users can delete own responsibilities" ON public.responsibilities;
DROP POLICY IF EXISTS "Users can view own packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Users can insert own packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Users can update own packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Users can delete own packing items" ON public.packing_items;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view trip members" ON public.trip_members;
DROP POLICY IF EXISTS "Users can insert trip members" ON public.trip_members;
DROP POLICY IF EXISTS "Users can update trip members" ON public.trip_members;
DROP POLICY IF EXISTS "Users can delete trip members" ON public.trip_members;

-- Policies: Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own responsibilities" ON public.responsibilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responsibilities" ON public.responsibilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responsibilities" ON public.responsibilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own responsibilities" ON public.responsibilities
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own packing items" ON public.packing_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packing items" ON public.packing_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packing items" ON public.packing_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packing items" ON public.packing_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments" ON public.payments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Trip members policies: Users can see members of trips they're part of
CREATE POLICY "Users can view trip members" ON public.trip_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = invited_by OR
    EXISTS (
      SELECT 1 FROM public.trip_members tm 
      WHERE tm.trip_id = trip_members.trip_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'accepted'
    )
  );

CREATE POLICY "Users can insert trip members" ON public.trip_members
  FOR INSERT WITH CHECK (
    auth.uid() = invited_by AND
    EXISTS (
      SELECT 1 FROM public.trips t 
      WHERE t.id = trip_id 
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update trip members" ON public.trip_members
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = invited_by);

CREATE POLICY "Users can delete trip members" ON public.trip_members
  FOR DELETE USING (auth.uid() = invited_by OR auth.uid() = user_id);

