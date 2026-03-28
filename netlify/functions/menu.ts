import { getStore } from "@netlify/blobs";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const store = getStore("dragonfly-menu");

  if (event.httpMethod === "GET") {
    try {
      const data = await store.get("latest", { type: 'json' });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data || null)
      };
    } catch (e) {
      console.error(e);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Store read error' }) };
    }
  }

  if (event.httpMethod === "POST") {
    // Check if user is logged in via Netlify Identity
    const user = context.clientContext?.user;
    if (!user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized - Bearer token missing, invalid or expired" }) };
    }

    try {
      const body = JSON.parse(event.body || "[]");
      await store.setJSON("latest", body);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Menu saved successfully" })
      };
    } catch (e) {
      console.error(e);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Store write error' }) };
    }
  }

  return { statusCode: 405, headers, body: "Method Not Allowed" };
};
