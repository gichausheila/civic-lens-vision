import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        JSON.stringify({ success: true, message: 'All leaders have photos!', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${leaders.length} leaders without photos`);

    const results: Array<{
      name: string;
      position: string;
      found: boolean;
      photoUrl?: string;
      error?: string;
    }> = [];

    let successCount = 0;
    let failCount = 0;

    for (const leader of leaders) {
      // Clean up the name for search
      const cleanName = leader.name
        .replace(/^Hon\.\s*/i, '')
        .replace(/^Dr\.\s*/i, '')
        .replace(/^Prof\.\s*/i, '')
        .trim();

      console.log(`Processing: ${cleanName} (${leader.position})`);

      try {
        // Search Nation Africa for the leader
        const searchQuery = `site:nation.africa "${cleanName}" Kenya`;
        
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

        if (!searchResponse.ok) {
          results.push({ name: leader.name, position: leader.position, found: false, error: 'Search failed' });
          failCount++;
          continue;
        }

        const searchResults = searchData.data || [];

        if (searchResults.length === 0) {
          results.push({ name: leader.name, position: leader.position, found: false, error: 'No results' });
          failCount++;
          continue;
        }

        // Try to get photo from first result
        let photoUrl: string | null = null;
        
        for (const result of searchResults) {
          const url = result.url;
          if (!url || !url.includes('nation.africa')) continue;

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

          // Check OG image first
          if (metadata.ogImage && metadata.ogImage.includes('nation')) {
            photoUrl = metadata.ogImage;
            break;
          }

          // Extract from markdown
          const imageMatches = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
          if (imageMatches) {
            for (const match of imageMatches) {
              const urlMatch = match.match(/\((https?:\/\/[^\s)]+)\)/);
              if (urlMatch) {
                const imgUrl = urlMatch[1];
                if (imgUrl.includes('nation') && 
                    !imgUrl.includes('logo') && 
                    !imgUrl.includes('icon') &&
                    (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') || imgUrl.endsWith('.png') || imgUrl.endsWith('.webp') ||
                     imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png'))) {
                  photoUrl = imgUrl;
                  break;
                }
              }
            }
          }

          if (photoUrl) break;
        }

        if (!photoUrl) {
          results.push({ name: leader.name, position: leader.position, found: false, error: 'No photo found' });
          failCount++;
          continue;
        }

        // Update database if not dry run
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('leaders')
            .update({ photo_url: photoUrl })
            .eq('id', leader.id);

          if (updateError) {
            results.push({ name: leader.name, position: leader.position, found: true, photoUrl, error: 'DB update failed' });
            failCount++;
            continue;
          }
        }

        results.push({ name: leader.name, position: leader.position, found: true, photoUrl });
        successCount++;
        console.log(`✓ Found photo for ${cleanName}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`Error processing ${leader.name}:`, err);
        results.push({ name: leader.name, position: leader.position, found: false, error: 'Processing error' });
        failCount++;
      }
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
