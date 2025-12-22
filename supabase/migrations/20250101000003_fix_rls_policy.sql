-- Drop all existing policies first (ignore errors if they don't exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Allow anon insert on bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Allow authenticated insert on bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Allow authenticated read on bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Allow service_role full access" ON public.bookings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy to allow anonymous users (anon) to insert bookings
-- This is the role used by Supabase client when not authenticated
CREATE POLICY "Allow anon insert on bookings"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert (in case someone is logged in)
CREATE POLICY "Allow authenticated insert on bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all bookings (for admin)
CREATE POLICY "Allow authenticated read on bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: service_role bypasses RLS by default, so no policy needed for it
