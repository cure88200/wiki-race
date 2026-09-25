const fs = require("fs");
const path = require("path");

const SENSITIVE_KEYWORDS = [
  "性的",
  "成人向け",
  "アダルト",
  "ポルノ",
  "性風俗",
  "エロ",
  "18禁",
  "性科学",
  "性行為",
  "性器",
  "濡れ場",
];

async function isSafeArticle(title) {
  const url = `https://ja.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=categories|templates&cllimit=50&tllimit=50&format=json`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "WikiRaceApp/1.0 (https://cure88200.github.io/wiki-race/)",
    },
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const pid in pages) {
    const page = pages[pid];
    const categories = (page.categories || []).map((c) => c.title);
    const templates = (page.templates || []).map((t) => t.title);
    const allMeta = [...categories, ...templates].join(" ");
    for (const kw of SENSITIVE_KEYWORDS) {
      if (allMeta.includes(kw) || title.includes(kw)) {
        return false;
      }
    }
  }
  return true;
}

async function getSafeRandomArticle() {
  while (true) {
    const res = await fetch(
      "https://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=3&format=json",
      {
        headers: {
          "User-Agent":
            "WikiRaceApp/1.0 (https://cure88200.github.io/wiki-race/)",
        },
      },
    );
    const data = await res.json();
    const titles = (data.query?.random || []).map((r) => r.title);
    for (const title of titles) {
      if (await isSafeArticle(title)) {
        return title;
      }
    }
  }
}

async function updateDaily() {
  const historyPath = path.join(__dirname, "..", "daily_history.json");
  let history = [];
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
  }

  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (history.length > 0 && history[0].date === todayStr) {
    return;
  }

  const title = await getSafeRandomArticle();
  history.unshift({
    date: todayStr,
    article: title,
  });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf8");
}

updateDaily();
