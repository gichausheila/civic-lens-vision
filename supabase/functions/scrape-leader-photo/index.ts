import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported news sources for leader photos
const NEWS_SOURCES = [
  { name: 'Nation Africa', domain: 'nation.africa', searchPrefix: 'site:nation.africa' },
  { name: 'Tuko Kenya', domain: 'tuko.co.ke', searchPrefix: 'site:tuko.co.ke' },
];

interface PhotoResult {
  photoUrl: string;
  sourceUrl: string;
  sourceName: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leaderId, leaderName, dryRun = false, preferredSource } = await req.json();

    if (!leaderId || !leaderName) {
      return new Response(
        JSON.stringify({ success: false, error: 'leaderId and leaderName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up the name for search
    const cleanName = leaderName
      .replace(/^Hon\.\s*/i, '')
      .replace(/^Dr\.\s*/i, '')
      .replace(/^Prof\.\s*/i, '')
      .trim();

    console.log(`Searching for: ${cleanName}`);

    // Determine which sources to try
    let sourcesToTry = NEWS_SOURCES;
    if (preferredSource) {
      const preferred = NEWS_SOURCES.find(s => s.name.toLowerCase().includes(preferredSource.toLowerCase()));
      if (preferred) {
        sourcesToTry = [preferred, ...NEWS_SOURCES.filter(s => s !== preferred)];
      }
    }

    let result: PhotoResult | null = null;

    // Try each source until we find a photo
    for (const source of sourcesToTry) {
      console.log(`Trying ${source.name}...`);
      
      const searchQuery = `${source.searchPrefix} "${cleanName}" Kenya`;
      
      const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
        }),
      });

      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        console.error(`${source.name} search error:`, searchData);
        continue;
      }

      const results = searchData.data || [];
      console.log(`${source.name}: Found ${results.length} search results`);

      if (results.length === 0) continue;

      // Try to scrape each result for an image
      for (const searchResult of results) {
        const url = searchResult.url;
        if (!url || !url.includes(source.domain)) continue;

        console.log(`Scraping: ${url}`);

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

        if (!scrapeResponse.ok) {
          console.error('Scrape error:', scrapeData);
          continue;
        }

        const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
        const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

        let photoUrl: string | null = null;

        // Look for OG image or article image
        if (metadata.ogImage && !metadata.ogImage.includes('logo') && !metadata.ogImage.includes('fallback')) {
          photoUrl = metadata.ogImage;
          console.log(`Found OG image: ${photoUrl}`);
        }

        // Extract image URLs from markdown if no OG image
        if (!photoUrl) {
          const imageMatches = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
          if (imageMatches) {
            for (const match of imageMatches) {
              const urlMatch = match.match(/\((https?:\/\/[^\s)]+)\)/);
              if (urlMatch) {
                const imgUrl = urlMatch[1];
                // Filter for likely portrait photos (avoid logos, ads, etc.)
                if (!imgUrl.includes('logo') && 
                    !imgUrl.includes('icon') &&
                    !imgUrl.includes('banner') &&
                    !imgUrl.includes('fallback') &&
                    !imgUrl.includes('placeholder') &&
                    (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp'))) {
                  photoUrl = imgUrl;
                  console.log(`Found image from markdown: ${photoUrl}`);
                  break;
                }
              }
            }
          }
        }

        if (photoUrl && !photoUrl.includes('fallback')) {
          result = {
            photoUrl,
            sourceUrl: url,
            sourceName: source.name
          };
          break;
        }
      }

      if (result) break;
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          found: false, 
          message: `No suitable photo found for ${cleanName}`,
          searchedSources: sourcesToTry.map(s => s.name)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If dry run, just return what we found
    if (dryRun) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          found: true, 
          photoUrl: result.photoUrl,
          sourceUrl: result.sourceUrl,
          sourceName: result.sourceName,
          dryRun: true,
          message: `Would update ${cleanName} with photo from ${result.sourceName}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the leader's photo in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('leaders')
      .update({ 
        photo_url: result.photoUrl,
        photo_source: result.sourceUrl
      })
      .eq('id', leaderId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Database update failed: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated ${cleanName} with photo from ${result.sourceName}: ${result.photoUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        found: true, 
        photoUrl: result.photoUrl,
        sourceUrl: result.sourceUrl,
        sourceName: result.sourceName,
        message: `Updated ${cleanName} with photo from ${result.sourceName}` 
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
