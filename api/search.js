import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { q = "tamil" } = req.query;
  const url = `https://api.pocketfm.com/v2/search_api/search?query=${encodeURIComponent(q)}&language=tamil`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PocketFM/9.9.9 (Android; SDK 33)",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Referer": "https://www.pocketfm.com/"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: "Upstream API failed", details: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
