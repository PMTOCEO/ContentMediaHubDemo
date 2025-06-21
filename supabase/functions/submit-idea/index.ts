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

// Define CORS headers inline for now to avoid file creation issues
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get data from request
    const { title } = await req.json()
    if (!title) {
      throw new Error('Missing required field: title')
    }

    // 2. Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Get the user and validate they are authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('User not found')

    // 4. Insert the new content idea into the database
    const { data: newIdea, error: insertError } = await supabaseClient
      .from('content_ideas')
      .insert({
        title,
        user_id: user.id,
        analysis_status: 'analyzing',
        project_status: 'New',
      })
      .select()
      .single()

    if (insertError) throw insertError

    // 5. Asynchronously invoke the analysis function and DO NOT wait for it to complete.
    // This provides a fast response to the user. The UI can subscribe to
    // database changes to see when the analysis is complete.
    supabaseClient.functions.invoke('analyze-content', {
      body: { idea_id: newIdea.id },
    }).then(({ error }) => {
      if (error) {
        console.error(`Error invoking analysis for idea ${newIdea.id}:`, error)
      } else {
        console.log(`Successfully invoked analysis for idea ID: ${newIdea.id}`)
      }
    }).catch(invokeError => {
      console.error(`Caught unexpected error when invoking analysis for idea ${newIdea.id}:`, invokeError)
    })

    // 6. Return the newly created idea to the client immediately
    return new Response(JSON.stringify(newIdea), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // 201 Created
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 