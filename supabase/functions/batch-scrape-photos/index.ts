import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to download image and upload to Supabase Storage
async function downloadAndUploadImage(
  supabase: any,
  imageUrl: string,
  leaderId: string
): Promise<string | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) {
      console.log(`Failed to download image from ${imageUrl}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Skip if not an image
    if (!contentType.startsWith('image/')) {
      console.log(`Not an image content type: ${contentType}`);
      return null;
    }

    const extension = contentType.includes('png') ? 'png' : 
                     contentType.includes('webp') ? 'webp' : 'jpg';
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Skip very small files (likely placeholders)
    if (arrayBuffer.byteLength < 5000) {
      console.log(`Image too small (${arrayBuffer.byteLength} bytes), likely placeholder`);
      return null;
    }

    const blob = new Blob([arrayBuffer], { type: contentType });

    // Upload to Supabase Storage
    const fileName = `${leaderId}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('leader-photos')
      .upload(fileName, blob, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Upload error:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('leader-photos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error(`Error downloading/uploading image:`, err);
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
    .replace(/,.*$/, '') // Remove titles after comma
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

// Try to get photo from Streamline Feed
async function tryStreamlineFeed(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  try {
    const slug = nameToSlug(leaderName);
    const profileUrl = `https://streamlinefeed.co.ke/persons-of-interest/${slug}`;
    
    console.log(`Trying Streamline: ${profileUrl}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: profileUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const html = data.data?.html || data.html || '';
    const markdown = data.data?.markdown || data.markdown || '';
    
    // Look for Supabase storage URLs (these are their image storage)
    const supabaseMatch = html.match(/https:\/\/[a-z]+\.supabase\.co\/storage\/v1\/object\/public\/media\/people\/[^"'\s]+/);
    if (supabaseMatch) {
      return { photoUrl: supabaseMatch[0], sourceUrl: profileUrl };
    }
    
    // Look for image in markdown
    const mdImageMatch = markdown.match(/!\[.*?\]\((https:\/\/[^\s)]+)\)/);
    if (mdImageMatch && mdImageMatch[1].includes('supabase.co')) {
      return { photoUrl: mdImageMatch[1], sourceUrl: profileUrl };
    }
    
    return null;
  } catch (err) {
    console.error('Streamline error:', err);
    return null;
  }
}

// Try to get photo from Parliament website
async function tryParliamentWebsite(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  try {
    // Search parliament.go.ke for the leader
    const cleanName = leaderName
      .replace(/^Hon\.\s*/i, '')
      .replace(/^Dr\.\s*/i, '')
      .replace(/^Prof\.\s*/i, '')
      .trim();
    
    const searchQuery = `site:parliament.go.ke "${cleanName}"`;
    
    console.log(`Trying Parliament: ${searchQuery}`);
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
      }),
    });

    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    for (const result of results) {
      const url = result.url;
      if (!url || !url.includes('parliament.go.ke')) continue;
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['html'],
          onlyMainContent: true,
        }),
      });
      
      if (!scrapeResponse.ok) continue;
      
      const scrapeData = await scrapeResponse.json();
      const html = scrapeData.data?.html || scrapeData.html || '';
      
      // Look for MP profile images
      const imgMatch = html.match(/https:\/\/www\.parliament\.go\.ke\/sites\/default\/files\/styles\/mp_image\/public\/[^"'\s]+\.(jpg|jpeg|png)/i);
      if (imgMatch) {
        return { photoUrl: imgMatch[0], sourceUrl: url };
      }
      
      // Also try general images from parliament
      const generalImg = html.match(/https:\/\/www\.parliament\.go\.ke\/sites\/default\/files\/[^"'\s]+\.(jpg|jpeg|png)/i);
      if (generalImg && !generalImg[0].includes('logo') && !generalImg[0].includes('icon')) {
        return { photoUrl: generalImg[0], sourceUrl: url };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Parliament error:', err);
    return null;
  }
}

// Try Maarifa Centre (Kenya ICJ)
async function tryMaarifaCentre(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  try {
    const cleanName = leaderName
      .replace(/^Hon\.\s*/i, '')
      .replace(/^Dr\.\s*/i, '')
      .replace(/^Prof\.\s*/i, '')
      .trim();
    
    const searchQuery = `site:maarifa.icj.or.ke "${cleanName}"`;
    
    console.log(`Trying Maarifa: ${searchQuery}`);
    
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 3,
      }),
    });

    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const results = searchData.data || [];
    
    for (const result of results) {
      const url = result.url;
      if (!url) continue;
      
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['html', 'markdown'],
          onlyMainContent: true,
        }),
      });
      
      if (!scrapeResponse.ok) continue;
      
      const scrapeData = await scrapeResponse.json();
      const html = scrapeData.data?.html || scrapeData.html || '';
      const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
      
      // Look for profile images
      const imgMatch = html.match(/(https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp))/i);
      if (imgMatch && !imgMatch[0].includes('logo') && !imgMatch[0].includes('icon')) {
        return { photoUrl: imgMatch[0], sourceUrl: url };
      }
      
      // Try markdown images
      const mdMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp))\)/i);
      if (mdMatch) {
        return { photoUrl: mdMatch[1], sourceUrl: url };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Maarifa error:', err);
    return null;
  }
}

// Try news sources (Nation Africa, Tuko, Standard)
async function tryNewsSources(
  leaderName: string,
  apiKey: string
): Promise<{ photoUrl: string; sourceUrl: string } | null> {
  const NEWS_SOURCES = [
    { name: 'Nation Africa', domain: 'nation.africa', searchPrefix: 'site:nation.africa' },
    { name: 'Tuko Kenya', domain: 'tuko.co.ke', searchPrefix: 'site:tuko.co.ke' },
    { name: 'The Standard', domain: 'standardmedia.co.ke', searchPrefix: 'site:standardmedia.co.ke' },
  ];

  const cleanName = leaderName
    .replace(/^Hon\.\s*/i, '')
    .replace(/^Dr\.\s*/i, '')
    .replace(/^Prof\.\s*/i, '')
    .trim();

  for (const source of NEWS_SOURCES) {
    try {
      const searchQuery = `${source.searchPrefix} "${cleanName}" Kenya`;
      
      console.log(`Trying ${source.name}: ${searchQuery}`);
      
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 3,
        }),
      });

      if (!searchResponse.ok) continue;
      
      const searchData = await searchResponse.json();
      const results = searchData.data || [];

      for (const result of results) {
        const url = result.url;
        if (!url || !url.includes(source.domain)) continue;

        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) continue;

        const scrapeData = await scrapeResponse.json();
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
        const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

        // Check OG image first
        if (metadata.ogImage && metadata.ogImage.includes(source.domain)) {
          return { photoUrl: metadata.ogImage, sourceUrl: url };
        }

        // Extract from markdown
        const imageMatches = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
        if (imageMatches) {
          for (const match of imageMatches) {
            const urlMatch = match.match(/\((https?:\/\/[^\s)]+)\)/);
            if (urlMatch) {
              const imgUrl = urlMatch[1];
              if (imgUrl.includes(source.domain) && 
                  !imgUrl.includes('logo') && 
                  !imgUrl.includes('icon') &&
                  !imgUrl.includes('placeholder') &&
                  (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp'))) {
                return { photoUrl: imgUrl, sourceUrl: url };
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`${source.name} error:`, err);
    }
    
    // Small delay between sources
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 10, dryRun = true, prioritizeNational = true, migrateExisting = true } = await req.json();

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

    // Build query based on whether we're migrating existing external URLs or finding new photos
    let query = supabase
      .from('leaders')
      .select('id, name, position, is_national, photo_url, photo_source');

    if (migrateExisting) {
      // Get leaders with external URLs that need migration to storage
      query = query.or(
        'photo_url.is.null,photo_url.eq.,' +
        'photo_url.ilike.%nation.africa%,' +
        'photo_url.ilike.%tuko.co.ke%,' +
        'photo_url.ilike.%standardmedia.co.ke%'
      );
    } else {
      // Only get leaders without photos
      query = query.or('photo_url.is.null,photo_url.eq.');
    }

    query = query.limit(limit);

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
        JSON.stringify({ success: true, message: 'All leaders have photos!', processed: 0 }),
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

      // If leader already has an external photo URL that needs migration
      if (leader.photo_url && (
        leader.photo_url.includes('nation.africa') || 
        leader.photo_url.includes('tuko.co.ke') ||
        leader.photo_url.includes('standardmedia.co.ke')
      )) {
        console.log(`Migrating existing external photo...`);
        
        if (!dryRun) {
          const storedUrl = await downloadAndUploadImage(supabase, leader.photo_url, leader.id);
          if (storedUrl) {
            const { error: updateError } = await supabase
              .from('leaders')
              .update({ 
                photo_url: storedUrl,
                photo_source: leader.photo_source || leader.photo_url
              })
              .eq('id', leader.id);

            if (!updateError) {
              results.push({ 
                name: leader.name, 
                position: leader.position, 
                found: true, 
                photoUrl: storedUrl, 
                sourceUrl: leader.photo_url,
                source: 'migrated'
              });
              successCount++;
              console.log(`✓ Migrated photo`);
              continue;
            }
          }
        } else {
          results.push({ 
            name: leader.name, 
            position: leader.position, 
            found: true, 
            photoUrl: '(would migrate)', 
            sourceUrl: leader.photo_url,
            source: 'migrated (dry run)'
          });
          successCount++;
          continue;
        }
      }

      // Try sources in order of reliability
      // 1. Streamline Feed (best source - has Supabase storage, no hotlink issues)
      photoResult = await tryStreamlineFeed(leader.name, apiKey);
      if (photoResult) sourceName = 'Streamline Feed';

      // 2. Parliament website
      if (!photoResult) {
        photoResult = await tryParliamentWebsite(leader.name, apiKey);
        if (photoResult) sourceName = 'Parliament.go.ke';
      }

      // 3. Maarifa Centre
      if (!photoResult) {
        photoResult = await tryMaarifaCentre(leader.name, apiKey);
        if (photoResult) sourceName = 'Maarifa Centre';
      }

      // 4. News sources (as fallback - will be downloaded and uploaded to storage)
      if (!photoResult) {
        photoResult = await tryNewsSources(leader.name, apiKey);
        if (photoResult) sourceName = 'News Sources';
      }

      if (photoResult) {
        if (!dryRun) {
          // Download and upload to storage
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
              console.log(`✓ Found and uploaded photo from ${sourceName}`);
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
          console.log(`✓ Would use photo from ${sourceName}`);
        }
      } else {
        results.push({ 
          name: leader.name, 
          position: leader.position, 
          found: false, 
          error: 'No photo found in any source'
        });
        failCount++;
        console.log(`✗ No photo found`);
      }

      // Delay between leaders
      await new Promise(resolve => setTimeout(resolve, 500));
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
