-- Create counties table
CREATE TABLE public.counties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code INTEGER NOT NULL UNIQUE,
  region TEXT,
  population INTEGER,
  area_sq_km DECIMAL,
  capital TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaders table
CREATE TABLE public.leaders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  county_id UUID REFERENCES public.counties(id) ON DELETE SET NULL,
  party TEXT,
  photo_url TEXT,
  bio TEXT,
  manifesto JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  controversial_statements JSONB DEFAULT '[]'::jsonb,
  is_national BOOLEAN DEFAULT false,
  contact_email TEXT,
  contact_phone TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create survey_votes table (tracks individual votes)
CREATE TABLE public.survey_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, voter_identifier)
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  leader_id UUID REFERENCES public.leaders(id) ON DELETE SET NULL,
  county_id UUID REFERENCES public.counties(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Counties are public read
CREATE POLICY "Counties are publicly readable"
ON public.counties FOR SELECT
USING (true);

-- Leaders are public read
CREATE POLICY "Leaders are publicly readable"
ON public.leaders FOR SELECT
USING (true);

-- Surveys are public read
CREATE POLICY "Surveys are publicly readable"
ON public.surveys FOR SELECT
USING (true);

-- Survey votes - anyone can vote (using fingerprint/session identifier)
CREATE POLICY "Anyone can view vote counts"
ON public.survey_votes FOR SELECT
USING (true);

CREATE POLICY "Anyone can submit votes"
ON public.survey_votes FOR INSERT
WITH CHECK (true);

-- Feedback - anyone can submit
CREATE POLICY "Anyone can submit feedback"
ON public.feedback FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_leaders_county ON public.leaders(county_id);
CREATE INDEX idx_leaders_position ON public.leaders(position);
CREATE INDEX idx_leaders_name ON public.leaders(name);
CREATE INDEX idx_survey_votes_survey ON public.survey_votes(survey_id);
CREATE INDEX idx_feedback_status ON public.feedback(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for leaders table
CREATE TRIGGER update_leaders_updated_at
BEFORE UPDATE ON public.leaders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all 47 Kenyan counties as placeholder data
INSERT INTO public.counties (name, code, region, capital) VALUES
('Mombasa', 1, 'Coast', 'Mombasa'),
('Kwale', 2, 'Coast', 'Kwale'),
('Kilifi', 3, 'Coast', 'Kilifi'),
('Tana River', 4, 'Coast', 'Hola'),
('Lamu', 5, 'Coast', 'Lamu'),
('Taita-Taveta', 6, 'Coast', 'Voi'),
('Garissa', 7, 'North Eastern', 'Garissa'),
('Wajir', 8, 'North Eastern', 'Wajir'),
('Mandera', 9, 'North Eastern', 'Mandera'),
('Marsabit', 10, 'Eastern', 'Marsabit'),
('Isiolo', 11, 'Eastern', 'Isiolo'),
('Meru', 12, 'Eastern', 'Meru'),
('Tharaka-Nithi', 13, 'Eastern', 'Chuka'),
('Embu', 14, 'Eastern', 'Embu'),
('Kitui', 15, 'Eastern', 'Kitui'),
('Machakos', 16, 'Eastern', 'Machakos'),
('Makueni', 17, 'Eastern', 'Wote'),
('Nyandarua', 18, 'Central', 'Ol Kalou'),
('Nyeri', 19, 'Central', 'Nyeri'),
('Kirinyaga', 20, 'Central', 'Kerugoya'),
('Muranga', 21, 'Central', 'Muranga'),
('Kiambu', 22, 'Central', 'Kiambu'),
('Turkana', 23, 'Rift Valley', 'Lodwar'),
('West Pokot', 24, 'Rift Valley', 'Kapenguria'),
('Samburu', 25, 'Rift Valley', 'Maralal'),
('Trans-Nzoia', 26, 'Rift Valley', 'Kitale'),
('Uasin Gishu', 27, 'Rift Valley', 'Eldoret'),
('Elgeyo-Marakwet', 28, 'Rift Valley', 'Iten'),
('Nandi', 29, 'Rift Valley', 'Kapsabet'),
('Baringo', 30, 'Rift Valley', 'Kabarnet'),
('Laikipia', 31, 'Rift Valley', 'Nanyuki'),
('Nakuru', 32, 'Rift Valley', 'Nakuru'),
('Narok', 33, 'Rift Valley', 'Narok'),
('Kajiado', 34, 'Rift Valley', 'Kajiado'),
('Kericho', 35, 'Rift Valley', 'Kericho'),
('Bomet', 36, 'Rift Valley', 'Bomet'),
('Kakamega', 37, 'Western', 'Kakamega'),
('Vihiga', 38, 'Western', 'Vihiga'),
('Bungoma', 39, 'Western', 'Bungoma'),
('Busia', 40, 'Western', 'Busia'),
('Siaya', 41, 'Nyanza', 'Siaya'),
('Kisumu', 42, 'Nyanza', 'Kisumu'),
('Homa Bay', 43, 'Nyanza', 'Homa Bay'),
('Migori', 44, 'Nyanza', 'Migori'),
('Kisii', 45, 'Nyanza', 'Kisii'),
('Nyamira', 46, 'Nyanza', 'Nyamira'),
('Nairobi', 47, 'Nairobi', 'Nairobi');

-- Insert placeholder leaders (sample data - replace with real data later)
INSERT INTO public.leaders (name, position, county_id, party, photo_url, bio, is_national) VALUES
('Placeholder Governor', 'Governor', (SELECT id FROM public.counties WHERE name = 'Nairobi'), 'Independent', NULL, 'Governor of Nairobi County. Add real bio here.', false),
('Placeholder Senator', 'Senator', (SELECT id FROM public.counties WHERE name = 'Nairobi'), 'Independent', NULL, 'Senator for Nairobi County. Add real bio here.', false),
('Placeholder MP', 'Member of Parliament', (SELECT id FROM public.counties WHERE name = 'Mombasa'), 'Independent', NULL, 'MP for Mombasa. Add real bio here.', false),
('Placeholder Governor 2', 'Governor', (SELECT id FROM public.counties WHERE name = 'Kisumu'), 'Independent', NULL, 'Governor of Kisumu County. Add real bio here.', false),
('Placeholder President', 'President', NULL, 'Independent', NULL, 'President of Kenya. Add real bio here.', true),
('Placeholder Deputy President', 'Deputy President', NULL, 'Independent', NULL, 'Deputy President of Kenya. Add real bio here.', true),
('Placeholder Governor 3', 'Governor', (SELECT id FROM public.counties WHERE name = 'Meru'), 'Independent', NULL, 'Governor of Meru County. Add real bio here.', false),
('Placeholder Senator 2', 'Senator', (SELECT id FROM public.counties WHERE name = 'Kiambu'), 'Independent', NULL, 'Senator for Kiambu County. Add real bio here.', false),
('Placeholder Women Rep', 'Women Representative', (SELECT id FROM public.counties WHERE name = 'Nakuru'), 'Independent', NULL, 'Women Rep for Nakuru County. Add real bio here.', false);

-- Insert placeholder survey questions
INSERT INTO public.surveys (question, options, is_active) VALUES
('How would you rate the current county government performance?', '["Excellent", "Good", "Average", "Poor", "Very Poor"]', true),
('Which sector needs the most improvement in your county?', '["Healthcare", "Education", "Infrastructure", "Security", "Water & Sanitation"]', true),
('Do you believe devolution has improved service delivery?', '["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]', true),
('What is your biggest concern about local governance?', '["Corruption", "Poor Service Delivery", "Lack of Transparency", "Tribalism", "Inadequate Funding"]', true);