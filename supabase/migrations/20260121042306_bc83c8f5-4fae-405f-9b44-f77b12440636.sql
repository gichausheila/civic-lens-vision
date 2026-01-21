-- Add structured manifesto fields to leaders table
ALTER TABLE public.leaders 
ADD COLUMN IF NOT EXISTS manifesto_summary text,
ADD COLUMN IF NOT EXISTS manifesto_promises jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS manifesto_source text,
ADD COLUMN IF NOT EXISTS manifesto_available boolean DEFAULT false;

-- Add index for manifesto_available to optimize queries
CREATE INDEX IF NOT EXISTS idx_leaders_manifesto_available ON public.leaders (manifesto_available);

-- Comment on columns for documentation
COMMENT ON COLUMN public.leaders.manifesto_summary IS '2-3 line summary of leader key priorities';
COMMENT ON COLUMN public.leaders.manifesto_promises IS 'Array of promises grouped by standardized policy categories';
COMMENT ON COLUMN public.leaders.manifesto_source IS 'URL to official manifesto or party manifesto document';
COMMENT ON COLUMN public.leaders.manifesto_available IS 'True if individual manifesto exists, false if only party manifesto';