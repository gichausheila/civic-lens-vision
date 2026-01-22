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
        'User-Agent': 'Mozilla/5.0 (compatible; CivicLens/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.log(`Failed to download image: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 
                     contentType.includes('webp') ? 'webp' : 'jpg';
    
    const arrayBuffer = await response.arrayBuffer();
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 10, dryRun = true, prioritizeNational = true } = await req.json();

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

    // Get leaders without photos or with external photo URLs that need migration
    let query = supabase
      .from('leaders')
      .select('id, name, position, is_national, photo_url, photo_source')
      .or('photo_url.is.null,photo_url.eq.,photo_url.ilike.%nation.africa%,photo_url.ilike.%tuko.co.ke%')
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
      error?: string;
    }> = [];

    let successCount = 0;
    let failCount = 0;

    const NEWS_SOURCES = [
      { name: 'Nation Africa', domain: 'nation.africa', searchPrefix: 'site:nation.africa' },
      { name: 'Tuko Kenya', domain: 'tuko.co.ke', searchPrefix: 'site:tuko.co.ke' },
    ];

    for (const leader of leaders) {
      // If leader already has a photo URL that needs migration to storage
      if (leader.photo_url && (leader.photo_url.includes('nation.africa') || leader.photo_url.includes('tuko.co.ke'))) {
        console.log(`Migrating existing photo for ${leader.name}`);
        
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
              results.push({ name: leader.name, position: leader.position, found: true, photoUrl: storedUrl, sourceUrl: leader.photo_url });
              successCount++;
              console.log(`✓ Migrated photo for ${leader.name}`);
              continue;
            }
          }
        } else {
          results.push({ name: leader.name, position: leader.position, found: true, photoUrl: '(would migrate)', sourceUrl: leader.photo_url });
          successCount++;
          continue;
        }
      }

      // Clean up the name for search
      const cleanName = leader.name
        .replace(/^Hon\.\s*/i, '')
        .replace(/^Dr\.\s*/i, '')
        .replace(/^Prof\.\s*/i, '')
        .trim();

      console.log(`Searching for: ${cleanName} (${leader.position})`);

      let foundPhoto = false;

      for (const source of NEWS_SOURCES) {
        if (foundPhoto) break;

        try {
          const searchQuery = `${source.searchPrefix} "${cleanName}" Kenya`;
          
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

          const searchData = await searchResponse.json();

          if (!searchResponse.ok) continue;

          const searchResults = searchData.data || [];
          if (searchResults.length === 0) continue;

          for (const result of searchResults) {
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

            const scrapeData = await scrapeResponse.json();
            if (!scrapeResponse.ok) continue;

            const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
            const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';

            let photoUrl: string | null = null;

            // Check OG image first
            if (metadata.ogImage && metadata.ogImage.includes(source.domain)) {
              photoUrl = metadata.ogImage;
            }

            // Extract from markdown if no OG image
            if (!photoUrl) {
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
                      photoUrl = imgUrl;
                      break;
                    }
                  }
                }
              }
            }

            if (photoUrl) {
              if (!dryRun) {
                // Download and upload to storage
                const storedUrl = await downloadAndUploadImage(supabase, photoUrl, leader.id);
                
                if (storedUrl) {
                  const { error: updateError } = await supabase
                    .from('leaders')
                    .update({ 
                      photo_url: storedUrl,
                      photo_source: url  // Store the article URL as source
                    })
                    .eq('id', leader.id);

                  if (!updateError) {
                    results.push({ name: leader.name, position: leader.position, found: true, photoUrl: storedUrl, sourceUrl: url });
                    successCount++;
                    foundPhoto = true;
                    console.log(`✓ Found and uploaded photo for ${cleanName} from ${source.name}`);
                    break;
                  }
                }
              } else {
                results.push({ name: leader.name, position: leader.position, found: true, photoUrl: '(dry run)', sourceUrl: url });
                successCount++;
                foundPhoto = true;
                break;
              }
            }
          }
        } catch (err) {
          console.error(`Error searching ${source.name} for ${leader.name}:`, err);
        }

        // Small delay between sources
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      if (!foundPhoto) {
        results.push({ name: leader.name, position: leader.position, found: false, error: 'No photo found' });
        failCount++;
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
