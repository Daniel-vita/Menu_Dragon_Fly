import { getStore, connectLambda } from "@netlify/blobs";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Buffer } from "node:buffer";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  try {
    // Netlify runtime injects blobs metadata at execution time.
    // Cast keeps local TS checks compatible with the @netlify/blobs signature.
    connectLambda(event as any);

    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    const store = getStore("dragonfly-menu");

    if (event.httpMethod === "GET") {
      const data = await store.get("menu_v2", { type: 'json' });
      // If menu_v2 is missing, attempt to fall back to 'latest' so we don't return null if possible
      let finalData = data;
      if (!finalData) {
         finalData = await store.get("latest", { type: 'json' });
      }
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(finalData || null)
      };
    }

    if (event.httpMethod === "POST") {
      const user = context.clientContext?.user;
      if (!user) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized - Bearer token missing, invalid or expired" }) };
      }

      const rawBody = event.isBase64Encoded ? Buffer.from(event.body || "", 'base64').toString('utf-8') : (event.body || "[]");
      const parsedBody = JSON.parse(rawBody);

      // Wrapper to prevent HTTP 502 timeout limit (10s on Netlify defaults)
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Netlify Blobs timeout after 6 seconds")), 6000));
      await Promise.race([store.setJSON("menu_v2", parsedBody), timeoutPromise]);

      // Verification Step
      const verify = await store.get("menu_v2", { type: 'json' });
      if (!verify || JSON.stringify(verify).length !== JSON.stringify(parsedBody).length) {
        throw new Error("Write successful but verification failed, blob length mismatch. Netlify blobs might be caching or read-only.");
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Menu saved successfully" })
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (e: any) {
    console.error("FATAL ERROR IN HANDLER:", e);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ 
        error: 'Fatal server error', 
        name: e.name,
        message: e.message,
        stack: e.stack ? e.stack.split('\n')[0] : ""
      }) 
    };
  }
};
