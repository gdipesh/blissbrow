-- ==========================================
-- BROWBLISS THREADING - SUPABASE DATABASE SETUP SCHEMA
-- ==========================================
-- Paste this script directly inside the SQL Editor inside your Supabase dashboard.
-- It will create all tables, configure Row Level Security (RLS) policies, and seed default values.

-- 1. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  service_price NUMERIC NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Turn on Row Level Security (RLS)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allows prospective store guests to create bookings anonymously
CREATE POLICY "Allows anonymous guest to book" 
  ON appointments FOR INSERT 
  WITH CHECK (true);

-- Policy 2: Fully authenticated studio administrator has full command of the tables
CREATE POLICY "Allows authenticated administrators full access" 
  ON appointments FOR ALL 
  TO authenticated 
  USING (true);


-- 2. SERVICES MENU TABLE
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 15,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access to active services
CREATE POLICY "Public read active services" 
  ON services FOR SELECT 
  USING (is_active = true);

-- Policy 2: Admin full edit capability
CREATE POLICY "Admin full service management" 
  ON services FOR ALL 
  TO authenticated 
  USING (true);


-- 3. BUSINESS OPEN HOURS TABLE
CREATE TABLE IF NOT EXISTS business_hours (
  id TEXT PRIMARY KEY,
  day_index INTEGER UNIQUE NOT NULL,
  day_name TEXT NOT NULL,
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false
);

-- RLS
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access
CREATE POLICY "Public read business hours" 
  ON business_hours FOR SELECT 
  USING (true);

-- Policy 2: Admin full management
CREATE POLICY "Admin update business hours" 
  ON business_hours FOR ALL 
  TO authenticated 
  USING (true);


-- 4. BUSINESS INFO SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_info (
  id TEXT PRIMARY KEY DEFAULT '1',
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_note TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about_text TEXT NOT NULL
);

-- RLS
ALTER TABLE business_info ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access
CREATE POLICY "Public access business info" 
  ON business_info FOR SELECT 
  USING (true);

-- Policy 2: Admin modify settings
CREATE POLICY "Admin edit business settings" 
  ON business_info FOR ALL 
  TO authenticated 
  USING (true);


-- 5. BLOCKED CALENDAR DATES TABLE
CREATE TABLE IF NOT EXISTS blocked_dates (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT
);

-- RLS
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access
CREATE POLICY "Public read blocked dates" 
  ON blocked_dates FOR SELECT 
  USING (true);

-- Policy 2: Admin modify blocks
CREATE POLICY "Admin block calendar dates" 
  ON blocked_dates FOR ALL 
  TO authenticated 
  USING (true);


-- ==========================================
-- SEED INITIAL SEED DATA
-- ==========================================

-- Populate active services flyer menu
INSERT INTO services (id, name, price, category, duration, description, sort_order, is_active) VALUES
('1', 'Eyebrow Threading', 6, 'Threading', 15, 'Gentle, meticulous brow mapping & shaping designed to define your eyes.', 1, true),
('2', 'Upper Lip', 4, 'Threading', 10, 'Quick and clean threading for smooth, hair-free upper lips.', 2, true),
('3', 'Chin', 5, 'Threading', 10, 'Smooth face finish clearing any unwanted chin hair.', 3, true),
('4', 'Neck', 5, 'Threading', 10, 'Removal of hairline or underchin fuzzy neck hair.', 4, true),
('5', 'Forehead', 5, 'Threading', 10, 'Clear threading of forehead fuzz for an overall even glow.', 5, true),
('6', 'Sideburns', 10, 'Threading', 15, 'Smooth facial hair threading around ears and cheeks.', 6, true),
('7', 'Full Face', 22, 'Threading', 40, 'Includes brows, forehead, cheeks, lip, chin & neck.', 7, true),
('8', 'Henna', 10, 'Tinting', 30, 'Natural henna brow tint to accent and define. (By Appointment Only)', 8, true)
ON CONFLICT (id) DO UPDATE 
SET price = EXCLUDED.price, description = EXCLUDED.description;

-- Populate weekly business hours
INSERT INTO business_hours (id, day_index, day_name, open_time, close_time, is_closed) VALUES
('h0', 0, 'Sunday', '10:00', '16:00', true),
('h1', 1, 'Monday', '09:00', '18:00', false),
('h2', 2, 'Tuesday', '09:00', '18:00', false),
('h3', 3, 'Wednesday', '09:00', '18:00', false),
('h4', 4, 'Thursday', '09:00', '18:00', false),
('h5', 5, 'Friday', '09:00', '18:00', false),
('h6', 6, 'Saturday', '09:00', '16:00', false)
ON CONFLICT (day_index) DO UPDATE 
SET is_closed = EXCLUDED.is_closed, open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time;

-- Populate business metadata details
INSERT INTO business_info (id, business_name, phone, address_note, city, state, tagline, about_text) VALUES
('1', 'BrowBliss Threading', '530-867-2298', 'Private home studio (exact address shared after booking)', 'Woodland', 'CA', 'Beautiful Brows, Happy You', 'BrowBliss Threading is a private home studio located in Woodland, CA run by an experienced specialist dedicated to high hygiene, custom styling, and exceptional hair removal precision.')
ON CONFLICT (id) DO UPDATE 
SET phone = EXCLUDED.phone, tagline = EXCLUDED.tagline, about_text = EXCLUDED.about_text;
