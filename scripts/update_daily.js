const fs = require("fs");
const path = require("path");

async function updateDaily() {
  try {
    // Fetch 1 random article from Wikipedia
    const url =
      "https://ja.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json";

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "WikiHopDailyBot/1.0 (https://github.com/cure88200/wiki-race)",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const article = data.query.random[0].title;

    const filePath = path.join(__dirname, "../daily_history.json");
    let history = [];
    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const today = new Date();
    // Format to YYYY-MM-DD in JST
    const jstFormatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [{ value: year }, , { value: month }, , { value: day }] =
      jstFormatter.formatToParts(today);
    const dateStr = `${year}-${month}-${day}`;

    // Prevent duplicate entry for the same day
    if (!history.find((h) => h.date === dateStr)) {
      history.unshift({
        date: dateStr,
        article: article,
      });

      // Keep history length reasonable (e.g. max 100 days)
      if (history.length > 100) history = history.slice(0, 100);

      fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
      console.log(`Successfully updated JSON for ${dateStr}: ${article}`);
    } else {
      console.log(`Already updated for today (${dateStr}). Skipping.`);
    }
  } catch (error) {
    console.error("Error updating daily history:", error);
    process.exit(1);
  }
}

updateDaily();
