// api/yy.js
// Node.js 版（Vercel 可部署）
// GET /api/yy?id=xxxx

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = global.fetch || require("node-fetch");

const CACHE_TTL = 300; // 5分钟
const CACHE_DIR = "/tmp/yycache"; // Vercel 可写目录
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get("id")?.trim() || "34229877";

    const cacheFile = path.join(CACHE_DIR, `playurl_${id.replace(/[^A-Za-z0-9_-]/g, "")}.json`);
    let playUrl = null;

    // 缓存检查
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (cache.timestamp && cache.playUrl && (Date.now() / 1000 - cache.timestamp < CACHE_TTL)) {
          playUrl = cache.playUrl;
        }
      } catch {}
    }

    // 若缓存无效则重新请求
    if (!playUrl) {
      const ref = Math.floor(new Date("2001-01-01T00:00:00Z").getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      const interval = now - ref;
      const secret = "eDpJVWU$hL+Jv``$0Z";
      const token = crypto.createHash("md5").update(id + id + interval + secret).digest("hex");
      const apiUrl = `http://yyapp-data.yy.com/live/hls/auth/${id}/${id}?coderate=8000&timestamp=${interval}&token=${token}`;

      const headers = {
        "Host": "yyapp-data.yy.com",
        "User-Agent": "YYMobile/126 CFNetwork/3826.500.131 Darwin/24.5.0",
      };

      const resp = await fetch(apiUrl, { headers });
      if (!resp.ok) {
        return res.status(502).send("Failed to fetch auth API");
      }

      const json = await resp.json().catch(() => null);
      if (json && json.data && /^https?:\/\//.test(json.data)) {
        playUrl = json.data;
        fs.writeFileSync(cacheFile, JSON.stringify({ timestamp: Math.floor(Date.now() / 1000), playUrl }));
      } else {
        return res.status(502).send("Failed to get playUrl from auth API");
      }
    }

    // 获取 m3u8 内容
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) Chrome/86.0.4240.198 Safari/537.36",
      "Referer": "https://wap.yy.com/",
    };
    const playResp = await fetch(playUrl, { headers });

    if (!playResp.ok) {
      return res.status(502).send("Failed to fetch m3u8");
    }

    const text = await playResp.text();

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Content-Disposition", `attachment; filename="${id}.m3u8"`);
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).send(text);

  } catch (err) {
    res.status(500).send("Internal Error: " + err.message);
  }
};
