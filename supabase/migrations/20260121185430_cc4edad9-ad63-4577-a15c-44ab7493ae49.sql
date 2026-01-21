-- Create storage bucket for leader photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('leader-photos', 'leader-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to leader photos
CREATE POLICY "Leader photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'leader-photos');

-- Allow admins to upload leader photos
CREATE POLICY "Admins can upload leader photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'leader-photos' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update leader photos
CREATE POLICY "Admins can update leader photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'leader-photos' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete leader photos
CREATE POLICY "Admins can delete leader photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'leader-photos' AND public.has_role(auth.uid(), 'admin'));