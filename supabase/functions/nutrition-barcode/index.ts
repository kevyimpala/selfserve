// Supabase Edge Function: nutrition-barcode
// Deploy: supabase functions deploy nutrition-barcode

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode || typeof barcode !== "string") {
      return Response.json({ error: "barcode is required" }, { status: 400 });
    }

    // Stub response. Replace with real nutrition provider call.
    return Response.json({
      barcode,
      productName: "Sample Product",
      calories: 120,
      protein: 5,
      carbs: 14,
      fat: 3
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
});
