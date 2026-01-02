-- Add picked_up column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS picked_up BOOLEAN NOT NULL DEFAULT false;

-- Create index on picked_up for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_picked_up ON public.bookings(picked_up);

-- Update RLS policy to allow updating picked_up status
CREATE POLICY "Allow anon update picked_up on bookings"
  ON public.bookings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update picked_up on bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

