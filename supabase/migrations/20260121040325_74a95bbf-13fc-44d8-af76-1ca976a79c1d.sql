-- ================================================
-- SECURITY REFACTORING MIGRATION
-- Remove sensitive contact info and add admin roles
-- ================================================

-- 1. Remove personal contact information from leaders table
ALTER TABLE public.leaders 
  DROP COLUMN IF EXISTS contact_email,
  DROP COLUMN IF EXISTS contact_phone,
  DROP COLUMN IF EXISTS social_media;

-- 2. Create app_role enum for role-based access control
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create user_roles table for admin access control
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Add admin-only SELECT policy for feedback table
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Add admin-only UPDATE policy for feedback table (to moderate)
CREATE POLICY "Admins can update feedback status"
ON public.feedback
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Add admin-only DELETE policy for feedback table
CREATE POLICY "Admins can delete feedback"
ON public.feedback
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create profiles table for user authentication
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 11. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 13. Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Add rate limiting tracking table for feedback
CREATE TABLE IF NOT EXISTS public.feedback_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_feedback_rate_limits_identifier_time 
ON public.feedback_rate_limits(identifier, submitted_at);

-- Enable RLS on rate limits
ALTER TABLE public.feedback_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow public insert for rate tracking
CREATE POLICY "Anyone can insert rate limit records"
ON public.feedback_rate_limits
FOR INSERT
WITH CHECK (true);

-- Only admins can view rate limit records
CREATE POLICY "Admins can view rate limits"
ON public.feedback_rate_limits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 16. Create function to check rate limit (max 5 submissions per hour per identifier)
CREATE OR REPLACE FUNCTION public.check_feedback_rate_limit(_identifier TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.feedback_rate_limits
    WHERE identifier = _identifier
      AND submitted_at > NOW() - INTERVAL '1 hour'
  ) < 5
$$;