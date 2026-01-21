-- Add impeachment-related columns to the leaders table
ALTER TABLE public.leaders
ADD COLUMN is_impeached boolean DEFAULT false,
ADD COLUMN impeachment_date date,
ADD COLUMN impeachment_reasons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN impeachment_timeline jsonb DEFAULT '[]'::jsonb,
ADD COLUMN official_documents jsonb DEFAULT '[]'::jsonb;

-- Create index for filtering impeached leaders
CREATE INDEX idx_leaders_is_impeached ON public.leaders(is_impeached) WHERE is_impeached = true;