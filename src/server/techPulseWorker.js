import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Automated Tech Pulse Worker
 * Fetches real-time technology hiring, layoff, and opening news from Hacker News Algolia & public APIs
 */
export async function fetchAndPersistLiveTechNews() {
  console.log('🌐 [Tech Pulse Worker] Fetching live tech news feeds...');
  
  try {
    // Fetch live story items from Hacker News Algolia Search API
    const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=15');
    if (!response.ok) {
      throw new Error(`HackerNews API returned status ${response.status}`);
    }
    
    const data = await response.json();
    const hits = data.hits || [];

    const techArticles = hits.map((hit, idx) => {
      const title = hit.title || hit.story_title || 'Tech Industry Update';
      const url = hit.url || hit.story_url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
      
      let category = 'opening';
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('layoff') || lowerTitle.includes('cut') || lowerTitle.includes('downsize')) {
        category = 'layoff';
      } else if (lowerTitle.includes('hiring') || lowerTitle.includes('recruit') || lowerTitle.includes('raise') || lowerTitle.includes('fund')) {
        category = 'hiring';
      } else if (lowerTitle.includes('ai') || lowerTitle.includes('model') || lowerTitle.includes('llm') || lowerTitle.includes('gpt')) {
        category = 'ai_trend';
      }

      return {
        id: `hn-${hit.objectID}`,
        headline: title,
        summary: `Live tech update from ${hit.author || 'HackerNews'} (${hit.points || 0} points, ${hit.num_comments || 0} comments)`,
        source: 'HackerNews Live',
        category,
        url,
        published_at: hit.created_at || new Date().toISOString(),
        fetched_at: new Date().toISOString()
      };
    });

    if (supabase && techArticles.length > 0) {
      const { error } = await supabase.from('tech_news').upsert(techArticles, { onConflict: 'id' });
      if (error) {
        console.warn('⚠️ [Tech Pulse Worker] Supabase Upsert Warning:', error.message);
      } else {
        console.log(`✅ [Tech Pulse Worker] Persisted ${techArticles.length} live articles to Supabase!`);
      }
    }

    return techArticles;
  } catch (err) {
    console.error('❌ [Tech Pulse Worker] Exception:', err.message);
    return [];
  }
}
