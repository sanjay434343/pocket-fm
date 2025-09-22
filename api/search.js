import fetch from "node-fetch";

export default async function handler(req, res) {
  // ✅ Enable CORS for all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Custom-Auth");

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Query & optional endpoint
  const { q = "tamil", endpoint = "search" } = req.query;

  let url;
  if (endpoint === "search") {
    url = `https://api.pocketfm.com/v2/search_api/search?query=${encodeURIComponent(q)}&language=tamil`;
  } else if (endpoint === "feed") {
    url = `https://api.pocketfm.com/v2/feed_api/get_feed_data?api_type=explore_v2&is_mobile=0&language=tamil`;
  } else {
    return res.status(400).json({ error: "Unknown endpoint. Use ?endpoint=search or ?endpoint=feed" });
  }

  // ✅ Forward Authorization if provided
  const authHeader = req.headers["authorization"] || "";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)",
        "Accept": "application/json",
        "Referer": "https://www.pocketfm.com/",
        ...(authHeader ? { "Authorization": authHeader } : {})
      }
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text }; // fallback if not valid JSON
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream API failed", details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
