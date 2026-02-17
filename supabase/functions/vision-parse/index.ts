// Supabase Edge Function: vision-parse
// Deploy: supabase functions deploy vision-parse

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return Response.json({ error: "imageBase64 is required" }, { status: 400 });
    }

    // Stub response. Replace with real vision parsing provider call.
    return Response.json({
      ingredients: ["tomato", "onion", "garlic"]
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
});
