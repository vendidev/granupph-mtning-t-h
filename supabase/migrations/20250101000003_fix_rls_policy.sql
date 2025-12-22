-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow authenticated read on bookings" ON public.bookings;

-- Create policy to allow anyone (including anonymous users) to insert bookings
CREATE POLICY "Allow public insert on bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all bookings (for admin)
CREATE POLICY "Allow authenticated read on bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow service_role to do everything (for admin operations)
CREATE POLICY "Allow service_role full access"
  ON public.bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

