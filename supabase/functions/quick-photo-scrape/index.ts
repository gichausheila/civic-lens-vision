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
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.log(`Failed to download: ${response.status}`);
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

// Direct Parliament.go.ke scrape - faster than Firecrawl
async function scrapeParliamentDirect(leaderName: string): Promise<string | null> {
  try {
    const cleanName = leaderName
      .replace(/^Hon\.\s*/i, '')
      .replace(/^Dr\.\s*/i, '')
      .replace(/^Prof\.\s*/i, '')
      .replace(/,.*$/, '')
      .trim();
    
    // Try direct search on parliament website
    const searchUrl = `https://www.parliament.go.ke/the-national-assembly/mps?title=${encodeURIComponent(cleanName)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for MP profile images
    const imgMatch = html.match(/https:\/\/www\.parliament\.go\.ke\/sites\/default\/files\/styles\/mp_image\/public\/[^"'\s]+\.(jpg|jpeg|png)/i);
    if (imgMatch) return imgMatch[0];
    
    // Try alternative image pattern
    const altMatch = html.match(/\/sites\/default\/files\/styles\/mp_image\/public\/[^"'\s]+\.(jpg|jpeg|png)/i);
    if (altMatch) return `https://www.parliament.go.ke${altMatch[0]}`;
    
    return null;
  } catch (err) {
    console.error('Parliament scrape error:', err);
    return null;
  }
}

// Try Streamline Feed direct scrape
async function scrapeStreamlineDirect(leaderName: string): Promise<string | null> {
  try {
    const slug = leaderName
      .toLowerCase()
      .replace(/^hon\.\s*/i, '')
      .replace(/^dr\.\s*/i, '')
      .replace(/^prof\.\s*/i, '')
      .replace(/,.*$/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim();
    
    const profileUrl = `https://streamlinefeed.co.ke/persons-of-interest/${slug}`;
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for Supabase storage URLs (their image storage)
    const supabaseMatch = html.match(/https:\/\/[a-z]+\.supabase\.co\/storage\/v1\/object\/public\/media\/people\/[^"'\s]+/);
    if (supabaseMatch) return supabaseMatch[0];
    
    return null;
  } catch (err) {
    console.error('Streamline scrape error:', err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 5 } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get leaders without photos, prioritize national
    const { data: leaders, error: queryError } = await supabase
      .from('leaders')
      .select('id, name, position, is_national')
      .or('photo_url.is.null,photo_url.eq.')
      .order('is_national', { ascending: false })
      .order('name')
      .limit(limit);

    if (queryError) {
      return new Response(
        JSON.stringify({ success: false, error: queryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leaders || leaders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All leaders have photos!', processed: 0, found: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${leaders.length} leaders`);

    const results: Array<{ name: string; found: boolean; source?: string }> = [];
    let found = 0;

    for (const leader of leaders) {
      console.log(`Processing: ${leader.name}`);
      
      let photoUrl: string | null = null;
      let source = '';

      // Try Streamline first (fastest, most reliable)
      photoUrl = await scrapeStreamlineDirect(leader.name);
      if (photoUrl) source = 'Streamline Feed';

      // Try Parliament if Streamline fails
      if (!photoUrl) {
        photoUrl = await scrapeParliamentDirect(leader.name);
        if (photoUrl) source = 'Parliament.go.ke';
      }

      if (photoUrl) {
        const storedUrl = await downloadAndUploadImage(supabase, photoUrl, leader.id);
        
        if (storedUrl) {
          await supabase
            .from('leaders')
            .update({ photo_url: storedUrl, photo_source: source })
            .eq('id', leader.id);

          results.push({ name: leader.name, found: true, source });
          found++;
          console.log(`✓ ${leader.name} - ${source}`);
        } else {
          results.push({ name: leader.name, found: false });
        }
      } else {
        results.push({ name: leader.name, found: false });
        console.log(`✗ ${leader.name} - no photo found`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: leaders.length, found, results }),
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
