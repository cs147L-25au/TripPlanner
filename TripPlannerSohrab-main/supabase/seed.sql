-- Sample data for testing
-- Run this after creating the schema to populate with example data

-- Insert sample trips
INSERT INTO trips (id, name, start_date, end_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Summer Trip', '2025-06-15', '2025-06-25'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Winter Getaway', '2025-01-20', '2025-01-27'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Beach Vacation', '2025-08-10', '2025-08-17')
ON CONFLICT (id) DO NOTHING;

-- Insert sample trip members
INSERT INTO trip_members (trip_id, user_id, user_name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'user1', 'Claudia', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440000', 'user2', 'Sohrab', 'member'),
  ('550e8400-e29b-41d4-a716-446655440000', 'user3', 'Adrian', 'member'),
  ('550e8400-e29b-41d4-a716-446655440001', 'user1', 'Claudia', 'owner'),
  ('550e8400-e29b-41d4-a716-446655440001', 'user2', 'Sohrab', 'member'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user1', 'Claudia', 'owner')
ON CONFLICT (trip_id, user_id) DO NOTHING;

-- Insert sample itinerary items
INSERT INTO itinerary_items (trip_id, type, title, date, time, location, notes, booked_by) VALUES
  -- Summer Trip items
  ('550e8400-e29b-41d4-a716-446655440000', 'flight', 'Flight to Paris', '2025-06-15', '08:00', 'JFK Airport', 'Check-in 2 hours before', 'Claudia'),
  ('550e8400-e29b-41d4-a716-446655440000', 'lodging', 'Hotel Check-in', '2025-06-15', '15:00', 'Hotel Le Marais', 'Early check-in requested', 'Sohrab'),
  ('550e8400-e29b-41d4-a716-446655440000', 'activity', 'Eiffel Tower Visit', '2025-06-16', '10:00', 'Eiffel Tower', 'Tickets booked online', 'Adrian'),
  ('550e8400-e29b-41d4-a716-446655440000', 'activity', 'Louvre Museum', '2025-06-17', '14:00', 'Louvre Museum', 'Audio guide included', 'Claudia'),
  ('550e8400-e29b-41d4-a716-446655440000', 'lodging', 'Hotel Check-out', '2025-06-25', '11:00', 'Hotel Le Marais', 'Late check-out until 11 AM', 'Sohrab'),
  ('550e8400-e29b-41d4-a716-446655440000', 'flight', 'Flight Home', '2025-06-25', '18:00', 'CDG Airport', 'Return flight', 'Claudia'),
  -- Winter Getaway items
  ('550e8400-e29b-41d4-a716-446655440001', 'flight', 'Flight to Aspen', '2025-01-20', '06:00', 'DEN Airport', 'Early morning flight', 'Claudia'),
  ('550e8400-e29b-41d4-a716-446655440001', 'lodging', 'Ski Resort Check-in', '2025-01-20', '14:00', 'Aspen Mountain Lodge', 'Ski equipment rental included', 'Sohrab'),
  ('550e8400-e29b-41d4-a716-446655440001', 'activity', 'Ski Lessons', '2025-01-21', '09:00', 'Aspen Ski School', 'Group lesson for beginners', 'Adrian')
ON CONFLICT DO NOTHING;


