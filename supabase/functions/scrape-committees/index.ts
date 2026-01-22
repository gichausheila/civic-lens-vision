const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping Parliament committees page...');

    // Scrape the main committees list page
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.parliament.go.ke/the-national-assembly/committees',
        formats: ['markdown', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse committee data from the markdown/links
    const markdown = data.data?.markdown || data.markdown || '';
    const links = data.data?.links || data.links || [];

    // Extract committee names and links
    const committees = parseCommittees(markdown, links);

    console.log(`Found ${committees.length} committees`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          committees,
          rawMarkdown: markdown,
          scrapedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping committees:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

interface Committee {
  name: string;
  url?: string;
  type: 'departmental' | 'select' | 'other';
}

function parseCommittees(markdown: string, links: string[]): Committee[] {
  const committees: Committee[] = [];
  
  // Common committee name patterns from Parliament website
  const committeePatterns = [
    /Committee on ([A-Z][a-zA-Z\s&,]+)/g,
    /Departmental Committee on ([A-Z][a-zA-Z\s&,]+)/g,
    /Select Committee on ([A-Z][a-zA-Z\s&,]+)/g,
  ];

  // Extract committee names from markdown
  const lines = markdown.split('\n');
  for (const line of lines) {
    // Look for committee mentions
    if (line.toLowerCase().includes('committee')) {
      for (const pattern of committeePatterns) {
        pattern.lastIndex = 0;
        const match = pattern.exec(line);
        if (match) {
          const name = match[1].trim();
          const type = line.toLowerCase().includes('departmental') 
            ? 'departmental' 
            : line.toLowerCase().includes('select') 
              ? 'select' 
              : 'other';
          
          // Avoid duplicates
          if (!committees.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            committees.push({ name, type });
          }
        }
      }
      
      // Also look for bullet points that might be committee names
      const bulletMatch = line.match(/^[\-\*•]\s*(.+Committee.*)$/i);
      if (bulletMatch) {
        const name = bulletMatch[1].trim();
        if (!committees.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          const type = name.toLowerCase().includes('departmental') 
            ? 'departmental' 
            : name.toLowerCase().includes('select') 
              ? 'select' 
              : 'other';
          committees.push({ name, type });
        }
      }
    }
  }

  // Match URLs to committees
  for (const url of links) {
    if (url.includes('committee')) {
      const committee = committees.find(c => 
        url.toLowerCase().includes(c.name.toLowerCase().replace(/\s+/g, '-'))
      );
      if (committee) {
        committee.url = url;
      }
    }
  }

  return committees;
}
