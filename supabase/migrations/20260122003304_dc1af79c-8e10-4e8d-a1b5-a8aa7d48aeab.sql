-- Add column to track photo source URL for attribution
ALTER TABLE public.leaders 
ADD COLUMN IF NOT EXISTS photo_source text;

-- Add a comment for documentation
COMMENT ON COLUMN public.leaders.photo_source IS 'Source URL where the leader photo was obtained from';