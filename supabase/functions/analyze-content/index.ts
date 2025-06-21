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
import { analysisBlueprint } from '../shared/prompt_blueprint.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BRAVE_API_KEY = Deno.env.get('BRAVE_API_KEY')!
const braveApiUrl = 'https://api.search.brave.com/res/v1/web/search'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let supabaseAdmin
  let idea_id
  try {
    const body = await req.json()
    idea_id = body.idea_id
    if (!idea_id) throw new Error('Missing required field: idea_id')
    console.log(`Starting analysis for idea ID: ${idea_id}`)

    supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { data: idea, error: ideaError } = await supabaseAdmin
      .from('content_ideas')
      .update({ analysis_status: 'analyzing' })
      .eq('id', idea_id)
      .select()
      .single()

    if (ideaError) throw ideaError
    if (!idea) throw new Error(`Idea with ID ${idea_id} not found`)

    // Brave Search
    console.log(`Calling Brave API for title: "${idea.title}"`)
    const braveResponse = await fetch(`${braveApiUrl}?q=${encodeURIComponent(idea.title)}`, {
      headers: { 'X-Subscription-Token': BRAVE_API_KEY, Accept: 'application/json' },
    })
    const braveData = await braveResponse.json()
    const searchContext = braveData.web?.results.slice(0, 5).map((r: any) => ({ title: r.title, url: r.url, snippet: r.description })) || []
    console.log(`Brave search context retrieved. ${searchContext.length} results.`)

    // OpenAI Prompt for HTML
    const finalBlueprint = analysisBlueprint.replace('{{IDEA_TITLE}}', idea.title);
    const prompt = `
      You are an expert content strategist and media analyst for HubSpot. Your task is to fill out the following HTML template based on the provided content idea and web search context.

      CRITICAL CONSTRAINTS (Non-Negotiable):
      - You MUST respond with properly formatted HTML content.
      - Return ONLY HTML content - no JSON wrapper, no markdown, no explanatory text.
      - Security: Do not include <script>, <style>, <iframe>, <object>, <embed>, <form>, or <input> tags. No event handlers (onclick, etc.). No "javascript:" or "data:" URLs.
      - All quotes and special characters in the content you generate must be properly escaped within the HTML.
      - Use the provided HTML structure and inline styles. Do not invent new styles or tags.

      ---
      HUBSPOT CONTEXT (Your Guiding Principles):
      - Our Mission: Help millions of organizations grow better.
      - Our Target Audience: We primarily serve marketing, sales, customer service, and operations professionals in B2B companies, from startups to large enterprises. We also have a large audience of developers and people in the startup ecosystem.
      - Core Topics: Our content revolves around inbound marketing, sales strategy, customer experience, CRM, marketing automation, AI in business, and scaling a business.
      - Content Goal: We create content to educate, inspire, and provide actionable advice that helps our audience solve their problems. Our content should build trust and subtly guide them toward our products. An idea about "raising a puppy" is not a good fit unless it's a clever analogy for a business problem. An idea about "blockchain for B2B marketing" is a much better fit.
      ---

      ---
      YOUR ANALYSIS PROCESS (Follow these steps):
      1. Deeply analyze the Idea Context (title and search results) through the lens of the HubSpot Context provided above.
      2. Fill out sections 1-5 of the HTML template with detailed, specific, and actionable insights.
      3. Critically evaluate the idea against the criteria in the "Scoring Rationale & Breakdown" table (Section 6).
      4. For each criterion, provide a score from 1-10 and a brief justification. The justification is as important as the score.
      5. Calculate the final weighted score: (Audience Fit Score * 0.3) + (Business Alignment & SEO Score * 0.3) + (Originality Score * 0.2) + (Virality Score * 0.2). The result is a score out of 10. Multiply by 10 to get the score out of 100.
      6. Place the final calculated score in the "Overall Score" field (Section 7). Ensure the rationale in Section 6 clearly supports this final score.
      ---

      ---
      IDEA CONTEXT
      Title: ${idea.title}
      Web Search Results: ${JSON.stringify(searchContext, null, 2)}
      ---

      HTML TEMPLATE TO COMPLETE:
      ${finalBlueprint}
    `
    console.log('Calling OpenAI API for analysis...')
    // Manual fetch to OpenAI for better error handling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')!}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text()
      console.error(`OpenAI API error. Status: ${openAIResponse.status}`, errorBody)
      throw new Error(`OpenAI API request failed with status: ${openAIResponse.status}`)
    }

    const chatCompletion = await openAIResponse.json()

    let analysisHtml = chatCompletion.choices[0].message.content || '<html><body>Error generating report.</body></html>'
    // Clean the response to remove markdown code block formatting if present
    analysisHtml = analysisHtml.replace(/^```html\n/, '').replace(/\n```$/, '');

    console.log('OpenAI HTML analysis received.')

    // Extract score from HTML and update DB
    const scoreMatch = analysisHtml.match(/<strong style="font-size: 1.2em; color: #FF7A59;">(\d+)\/100<\/strong>/)
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null

    await supabaseAdmin
      .from('content_ideas')
      .update({
        analysis_status: 'completed',
        score,
        analysis: analysisHtml, // Store raw HTML directly
      })
      .eq('id', idea_id)

    console.log(`Successfully completed analysis for idea ID: ${idea_id}`)
    return new Response(JSON.stringify({ success: true, idea_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(`Analysis failed for idea ID: ${idea_id}. Error:`, error)
    if (idea_id && supabaseAdmin) {
      await supabaseAdmin.from('content_ideas').update({ analysis_status: 'failed' }).eq('id', idea_id)
    }
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 