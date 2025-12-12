-- Seed script for demo account
-- Run this AFTER creating the demo account in Supabase Auth
-- The demo account should be created with:
-- Email: demo@tripplanner.com
-- Password: demo123

-- IMPORTANT: Make sure the demo account exists in auth.users before running this script
-- You can verify by running: SELECT id, email FROM auth.users WHERE email = 'demo@tripplanner.com';

-- Get demo user ID (will be used throughout)
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get the demo user's ID
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@tripplanner.com';
  
  IF demo_user_id IS NULL THEN
    RAISE EXCEPTION 'Demo user not found. Please create the demo account first in Supabase Auth.';
  END IF;

  -- Delete existing demo data (to allow re-running the script)
  DELETE FROM public.expenses WHERE user_id = demo_user_id;
  DELETE FROM public.payments WHERE user_id = demo_user_id;
  DELETE FROM public.packing_items WHERE user_id = demo_user_id;
  DELETE FROM public.responsibilities WHERE user_id = demo_user_id;
  DELETE FROM public.trip_members WHERE user_id = demo_user_id OR invited_by = demo_user_id;
  DELETE FROM public.trips WHERE user_id = demo_user_id;

  -- Create/update profile for demo user
  INSERT INTO public.profiles (id, email, full_name, venmo, zelle)
  VALUES (
    demo_user_id,
    'demo@tripplanner.com',
    'Demo User',
    '@demo-venmo',
    'demo@zelle.com'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    venmo = EXCLUDED.venmo,
    zelle = EXCLUDED.zelle;

  -- Create trips
  INSERT INTO public.trips (user_id, name, start_date, end_date)
  VALUES
    (demo_user_id, 'Summer Trip', '2025-06-15', '2025-06-20'),
    (demo_user_id, 'Winter Getaway', '2025-01-20', '2025-01-25'),
    (demo_user_id, 'Beach Vacation', '2025-07-10', '2025-07-15');

  -- Create responsibilities/tasks
  INSERT INTO public.responsibilities (user_id, trip_id, task, assigned_to, trip_name, trip_date, complete_by, category, completed)
  SELECT 
    demo_user_id,
    t.id,
    r.task,
    r.assigned_to,
    r.trip_name,
    r.trip_date::DATE,
    r.complete_by::DATE,
    r.category,
    r.completed
  FROM (VALUES
    ('Book accommodation', 'Claudia', 'Summer Trip', '2025-06-15', '2024-12-20', 'Accommodation', false),
    ('Plan itinerary', 'Sohrab', 'Summer Trip', '2025-06-15', '2024-12-18', 'Excursions', false),
    ('Reserve restaurant', 'Adrian', 'Summer Trip', '2025-06-15', '2024-12-15', 'Excursions', true),
    ('Buy tickets', 'Claudia', 'Winter Getaway', '2025-01-20', '2025-01-10', 'Transportation', false),
    ('Research activities', 'Claudia', 'Summer Trip', '2025-06-15', '2024-12-22', 'Excursions', false)
  ) AS r(task, assigned_to, trip_name, trip_date, complete_by, category, completed)
  JOIN public.trips t ON t.name = r.trip_name AND t.user_id = demo_user_id;

  -- Create packing items
  INSERT INTO public.packing_items (user_id, trip_id, item, assigned_to, trip_name, bag, packed)
  SELECT 
    demo_user_id,
    t.id,
    p.item,
    p.assigned_to,
    p.trip_name,
    p.bag,
    p.packed
  FROM (VALUES
    ('Passport', 'Claudia', 'Summer Trip', 'Carry-on', true),
    ('Camera', 'Sohrab', 'Summer Trip', 'Carry-on', false),
    ('First aid kit', 'Adrian', 'Summer Trip', 'Checked', false),
    ('Ski jacket', 'Claudia', 'Winter Getaway', 'Checked', false),
    ('Travel adapter', 'Claudia', 'Summer Trip', 'Carry-on', false)
  ) AS p(item, assigned_to, trip_name, bag, packed)
  JOIN public.trips t ON t.name = p.trip_name AND t.user_id = demo_user_id;

  -- Create payments
  INSERT INTO public.payments (user_id, trip_id, description, amount, from_person, to_person, trip_name, paid)
  SELECT 
    demo_user_id,
    t.id,
    p.description,
    p.amount,
    p.from_person,
    p.to_person,
    p.trip_name,
    p.paid
  FROM (VALUES
    ('Venmo Kevin for Airbnb', '$150', 'Claudia', 'Kevin', 'Summer Trip', false),
    ('Split dinner bill', '$45', 'Sohrab', 'Claudia', 'Summer Trip', true),
    ('Flight reimbursement', '$320', 'Adrian', 'Claudia', 'Winter Getaway', false)
  ) AS p(description, amount, from_person, to_person, trip_name, paid)
  JOIN public.trips t ON t.name = p.trip_name AND t.user_id = demo_user_id;

  -- Create expenses
  INSERT INTO public.expenses (user_id, trip_id, description, amount, currency, category, paid_by, split_between, trip_name, expense_date)
  SELECT 
    demo_user_id,
    t.id,
    e.description,
    e.amount,
    e.currency,
    e.category,
    e.paid_by,
    e.split_between,
    e.trip_name,
    e.expense_date::DATE
  FROM (VALUES
    ('Airbnb - 3 nights', 450.00, 'USD', 'lodging', 'Kevin', ARRAY['Claudia', 'Sohrab', 'Adrian', 'Kevin'], 'Summer Trip', '2025-06-15'),
    ('Flight tickets', 320.00, 'USD', 'transport', 'Claudia', ARRAY['Claudia', 'Sohrab'], 'Summer Trip', '2025-06-15'),
    ('Welcome dinner', 180.00, 'USD', 'food', 'Sohrab', ARRAY['Claudia', 'Sohrab', 'Adrian', 'Kevin'], 'Summer Trip', '2025-06-15'),
    ('Ski passes', 280.00, 'USD', 'activities', 'Adrian', ARRAY['Claudia', 'Adrian'], 'Winter Getaway', '2025-01-20'),
    ('Car rental', 150.00, 'EUR', 'transport', 'Claudia', ARRAY['Claudia', 'Sohrab', 'Adrian'], 'Summer Trip', '2025-06-16'),
    ('Museum tickets', 60.00, 'USD', 'activities', 'Kevin', ARRAY['Claudia', 'Sohrab', 'Adrian', 'Kevin'], 'Summer Trip', '2025-06-17')
  ) AS e(description, amount, currency, category, paid_by, split_between, trip_name, expense_date)
  JOIN public.trips t ON t.name = e.trip_name AND t.user_id = demo_user_id;

  RAISE NOTICE 'Demo account data seeded successfully!';
END $$;

