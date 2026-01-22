import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Download image and upload to Supabase Storage
async function downloadAndUploadImage(
  supabase: any,
  imageUrl: string,
  leaderId: string
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': 'https://www.google.com/',
      },
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`Download failed: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;

    const extension = contentType.includes('png') ? 'png' : 
                     contentType.includes('webp') ? 'webp' : 'jpg';
    
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 5000) return null;

    const blob = new Blob([arrayBuffer], { type: contentType });
    const fileName = `${leaderId}.${extension}`;
    
    const { error: uploadError } = await supabase.storage
      .from('leader-photos')
      .upload(fileName, blob, { contentType, upsert: true });

    if (uploadError) {
      console.error(`Upload error:`, uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('leader-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error(`Error:`, err);
    return null;
  }
}

// Convert name to URL slug for Streamline
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^hon\.\s*/i, '')
    .replace(/^dr\.\s*/i, '')
    .replace(/^prof\.\s*/i, '')
    .replace(/,.*$/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

// Try Streamline Feed with Firecrawl (most reliable source)
async function tryStreamlineFeed(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  try {
    const slug = nameToSlug(leaderName);
    const profileUrl = `https://streamlinefeed.co.ke/persons-of-interest/${slug}`;
    
    console.log(`Trying Streamline: ${profileUrl}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: profileUrl,
        formats: ['html'],
        onlyMainContent: true,
        timeout: 10000,
      }),
    });
    
    clearTimeout(timeout);

    if (!response.ok) return null;
    
    const data = await response.json();
    const html = data.data?.html || data.html || '';
    
    // Look for Supabase storage URLs
    const supabaseMatch = html.match(/https:\/\/[a-z]+\.supabase\.co\/storage\/v1\/object\/public\/media\/people\/[^"'\s]+/);
    if (supabaseMatch) {
      return { photoUrl: supabaseMatch[0], sourceUrl: profileUrl };
    }
    
    return null;
  } catch (err) {
    console.error('Streamline error:', err);
    return null;
  }
}

// Try Parliament website with Firecrawl
async function tryParliamentWebsite(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  try {
    const cleanName = leaderName
      .replace(/^Hon\.\s*/i, '')
      .replace(/^Dr\.\s*/i, '')
      .replace(/^Prof\.\s*/i, '')
      .trim();
    
    const searchQuery = `site:parliament.go.ke "${cleanName}"`;
    
    console.log(`Trying Parliament: ${searchQuery}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 2,
        timeout: 15000,
      }),
    });
    
    clearTimeout(timeout);

    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    for (const result of results) {
      const url = result.url;
      if (!url || !url.includes('parliament.go.ke')) continue;
      
      const scrapeController = new AbortController();
      const scrapeTimeout = setTimeout(() => scrapeController.abort(), 15000);
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        signal: scrapeController.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['html'],
          onlyMainContent: true,
          timeout: 10000,
        }),
      });
      
      clearTimeout(scrapeTimeout);
      
      if (!scrapeResponse.ok) continue;
      
      const scrapeData = await scrapeResponse.json();
      const html = scrapeData.data?.html || scrapeData.html || '';
      
      // Look for MP profile images
      const imgMatch = html.match(/https:\/\/www\.parliament\.go\.ke\/sites\/default\/files\/styles\/mp_image\/public\/[^"'\s]+\.(jpg|jpeg|png)/i);
      if (imgMatch) {
        return { photoUrl: imgMatch[0], sourceUrl: url };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Parliament error:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 3, dryRun = true, prioritizeNational = true } = await req.json();

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get leaders without photos
    let query = supabase
      .from('leaders')
      .select('id, name, position, is_national')
      .or('photo_url.is.null,photo_url.eq.')
      .limit(limit);

    if (prioritizeNational) {
      query = query.order('is_national', { ascending: false }).order('name');
    } else {
      query = query.order('name');
    }

    const { data: leaders, error: queryError } = await query;

    if (queryError) {
      return new Response(
        JSON.stringify({ success: false, error: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leaders || leaders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All leaders have photos!', processed: 0, found: 0, notFound: 0, results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${leaders.length} leaders`);

    const results: Array<{
      name: string;
      position: string;
      found: boolean;
      photoUrl?: string;
      sourceUrl?: string;
      source?: string;
      error?: string;
    }> = [];

    let successCount = 0;
    let failCount = 0;

    for (const leader of leaders) {
      console.log(`\n=== Processing: ${leader.name} (${leader.position}) ===`);
      
      let photoResult: { photoUrl: string; sourceUrl: string } | null = null;
      let sourceName = '';

      // Try Streamline first (most reliable)
      photoResult = await tryStreamlineFeed(leader.name, apiKey);
      if (photoResult) sourceName = 'Streamline Feed';

      // Try Parliament if Streamline fails
      if (!photoResult) {
        photoResult = await tryParliamentWebsite(leader.name, apiKey);
        if (photoResult) sourceName = 'Parliament.go.ke';
      }

      if (photoResult) {
        if (!dryRun) {
          const storedUrl = await downloadAndUploadImage(supabase, photoResult.photoUrl, leader.id);
          
          if (storedUrl) {
            const { error: updateError } = await supabase
              .from('leaders')
              .update({ 
                photo_url: storedUrl,
                photo_source: photoResult.sourceUrl
              })
              .eq('id', leader.id);

            if (!updateError) {
              results.push({ 
                name: leader.name, 
                position: leader.position, 
                found: true, 
                photoUrl: storedUrl, 
                sourceUrl: photoResult.sourceUrl,
                source: sourceName
              });
              successCount++;
              console.log(`✓ Found and uploaded from ${sourceName}`);
            } else {
              results.push({ 
                name: leader.name, 
                position: leader.position, 
                found: false, 
                error: 'DB update failed'
              });
              failCount++;
            }
          } else {
            results.push({ 
              name: leader.name, 
              position: leader.position, 
              found: false, 
              error: 'Image download/upload failed'
            });
            failCount++;
          }
        } else {
          results.push({ 
            name: leader.name, 
            position: leader.position, 
            found: true, 
            photoUrl: photoResult.photoUrl, 
            sourceUrl: photoResult.sourceUrl,
            source: `${sourceName} (dry run)`
          });
          successCount++;
          console.log(`✓ Would use from ${sourceName}`);
        }
      } else {
        results.push({ 
          name: leader.name, 
          position: leader.position, 
          found: false, 
          error: 'No photo found'
        });
        failCount++;
        console.log(`✗ No photo found`);
      }

      // Small delay between leaders
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        dryRun,
        processed: leaders.length,
        found: successCount,
        notFound: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});