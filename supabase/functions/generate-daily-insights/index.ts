declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Promise<Response>): void;
};

// @ts-ignore: Deno-specific import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno-specific import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'


const BRAVE_API_KEY = Deno.env.get('BRAVE_API_KEY')!
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

serve(async (req: any) => {
  // This is an example of a Cron Job.
  // 1. You can visit this function in your browser at `http://localhost:54321/functions/v1/generate-daily-insights`
  // 2. You can ask the AI to elaborate on the Cron Job step and provide you a command.
  // 3. You can use the Supabase CLI to deploy this function: `supabase functions deploy generate-daily-insights --no-verify-jwt`
  // 4. Finally, you can use the SQL editor in your Supabase project dashboard to schedule this function.

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Use Brave Search to get trending content
    console.log('Fetching trending topics from Brave Search...')
    const searchQuery = 'latest trends in digital marketing and technology for content creators'
    const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&count=5`, {
      headers: { 'X-Subscription-Token': BRAVE_API_KEY, Accept: 'application/json' },
    })

    if (!braveResponse.ok) {
      throw new Error(`Brave API request failed: ${braveResponse.statusText}`)
    }
    
    const braveData = await braveResponse.json()
    const searchContext = braveData.web?.results.map((r: any) => ({ title: r.title, snippet: r.description })) || []
    console.log(`Brave search context retrieved. ${searchContext.length} results.`)

    // 2. Use OpenAI to generate insights
    const prompt = `
      You are a senior market analyst at a leading tech company. 
      Based on the following web search results about the latest trends in digital marketing and technology, generate a concise, bulleted list of 3-4 key insights for a team of content creators at HubSpot.

      CRITICAL CONSTRAINTS (Non-Negotiable):
      - Respond with properly formatted HTML content ONLY. No JSON, no markdown, no explanatory text outside the HTML.
      - Your entire response must be wrapped in a single parent <ul> element.
      - Each insight must be in its own <li> element.
      - Keep each bullet point to a maximum of 2-3 sentences.
      - The tone should be professional, insightful, and actionable.

      WEB SEARCH CONTEXT:
      ${JSON.stringify(searchContext, null, 2)}

      EXAMPLE OUTPUT:
      <ul><li><strong>AI-Powered Content Personalization:</strong> AI is no longer just a buzzword. Generative AI tools are enabling hyper-personalized content at scale, allowing brands to tailor messaging to individual user behavior and preferences, leading to higher engagement.</li><li><strong>The Rise of Short-Form Video:</strong> Platforms like TikTok, Instagram Reels, and YouTube Shorts dominate user attention. Brands must create engaging, concise video content to stay relevant and capture new audiences.</li></ul>
    `
    
    console.log('Generating insights with OpenAI...')
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
      }),
    })

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text()
      throw new Error(`OpenAI API request failed: ${openAIResponse.status} ${errorBody}`)
    }

    const chatCompletion = await openAIResponse.json()
    let insightsHtml = chatCompletion.choices[0].message.content.trim()

    // Clean the response to ensure it's just the <ul>...</ul>
    if (insightsHtml.startsWith('```html')) {
      insightsHtml = insightsHtml.substring(7, insightsHtml.length - 3).trim()
    }

    console.log('Insights generated.')

    // 3. Store the insights in the database
    const { error: insertError } = await supabaseAdmin
      .from('daily_insights')
      .insert({ content: insightsHtml })

    if (insertError) {
      throw insertError
    }

    console.log('Successfully saved new daily insights.')

    return new Response(JSON.stringify({ success: true, insights: insightsHtml }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error generating daily insights:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
