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
    const { leaderId, leaderName, dryRun = false } = await req.json();

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

    console.log(`Searching Nation Africa for: ${cleanName}`);

    // Search Nation Africa for the leader
    const searchQuery = `site:nation.africa "${cleanName}" Kenya politician`;
    
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
      console.error('Firecrawl search error:', searchData);
      return new Response(
        JSON.stringify({ success: false, error: searchData.error || 'Search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = searchData.data || [];
    console.log(`Found ${results.length} search results`);

    if (results.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          found: false, 
          message: `No results found for ${cleanName}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to scrape the first relevant result for an image
    let photoUrl: string | null = null;

    for (const result of results) {
      const url = result.url;
      if (!url || !url.includes('nation.africa')) continue;

      console.log(`Scraping: ${url}`);

      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown', 'links'],
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

      // Look for OG image or article image
      if (metadata.ogImage) {
        photoUrl = metadata.ogImage;
        console.log(`Found OG image: ${photoUrl}`);
        break;
      }

      // Extract image URLs from markdown
      const imageMatches = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/g);
      if (imageMatches) {
        for (const match of imageMatches) {
          const urlMatch = match.match(/\((https?:\/\/[^\s)]+)\)/);
          if (urlMatch) {
            const imgUrl = urlMatch[1];
            // Filter for likely portrait photos (avoid logos, ads, etc.)
            if (imgUrl.includes('nation.africa') && 
                !imgUrl.includes('logo') && 
                !imgUrl.includes('icon') &&
                !imgUrl.includes('banner') &&
                (imgUrl.includes('.jpg') || imgUrl.includes('.jpeg') || imgUrl.includes('.png') || imgUrl.includes('.webp'))) {
              photoUrl = imgUrl;
              console.log(`Found image from markdown: ${photoUrl}`);
              break;
            }
          }
        }
      }

      if (photoUrl) break;
    }

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          found: false, 
          message: `No suitable photo found for ${cleanName}`,
          searchResults: results.length
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
          photoUrl,
          dryRun: true,
          message: `Would update ${cleanName} with photo` 
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
      .update({ photo_url: photoUrl })
      .eq('id', leaderId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: `Database update failed: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated ${cleanName} with photo: ${photoUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        found: true, 
        photoUrl,
        message: `Updated ${cleanName} with photo` 
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
