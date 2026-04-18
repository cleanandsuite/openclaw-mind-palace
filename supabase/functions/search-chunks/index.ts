import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SINGLE_USER_ID = '00000000-0000-0000-0000-000000000000';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const CLI_SUPABASE_URL = Deno.env.get('CLI_SUPABASE_URL');
    const CLI_SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('CLI_SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
    if (!CLI_SUPABASE_URL) throw new Error('CLI_SUPABASE_URL not configured');
    if (!CLI_SUPABASE_SERVICE_ROLE_KEY) throw new Error('CLI_SUPABASE_SERVICE_ROLE_KEY not configured');

    const body = await req.json();
    const query = String(body?.query ?? '').trim();
    const workspace_id = body?.workspace_id ?? null;
    const top_k = Math.min(Math.max(Number(body?.top_k ?? 10), 1), 50);
    const similarity_threshold = Number(body?.similarity_threshold ?? 0.5);

    if (!query) {
      return new Response(JSON.stringify({ error: 'query is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Embed query with OpenAI
    const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      throw new Error(`OpenAI embeddings failed [${embedRes.status}]: ${errText}`);
    }

    const embedJson = await embedRes.json();
    const embedding = embedJson?.data?.[0]?.embedding;
    if (!Array.isArray(embedding)) throw new Error('No embedding returned from OpenAI');

    // Call match_chunks RPC on CLI Supabase via service role
    const cli = createClient(CLI_SUPABASE_URL, CLI_SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await cli.rpc('match_chunks', {
      query_embedding: embedding,
      match_workspace: workspace_id,
      match_count: top_k,
      similarity_threshold,
    });

    if (error) throw new Error(`match_chunks RPC failed: ${error.message}`);

    return new Response(JSON.stringify({ chunks: data ?? [] }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('search-chunks error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
