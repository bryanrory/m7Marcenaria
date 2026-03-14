-- Storage policies for site-assets bucket
-- Allow public read access
CREATE POLICY "Public read site-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Allow public upload (for admin panel)
CREATE POLICY "Allow upload site-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

-- Allow public update
CREATE POLICY "Allow update site-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

-- Allow public delete
CREATE POLICY "Allow delete site-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');
