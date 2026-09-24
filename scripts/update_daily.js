const fs = require('fs');

async function updateDaily() {
  // Wikipedia APIからランダムな記事を1つ取得
  const res = await fetch("https://ja.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1");
  const data = await res.json();
  const title = data.query.random[0].title;
  
  // 日本時間で今日の日付を取得
  const jpDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
  const dateStr = jpDate.getFullYear() + "-" + 
                  String(jpDate.getMonth() + 1).padStart(2, '0') + "-" + 
                  String(jpDate.getDate()).padStart(2, '0');

  // 既存の履歴を読み込み
  const historyPath = 'daily_history.json';
  let history = [];
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  }
  
  // すでに今日のデータがあればスキップ
  if (history.length > 0 && history[0].date === dateStr) {
    console.log("Already updated today.");
    return;
  }
  
  // 先頭に追加して保存 (過去問として蓄積)
  history.unshift({ date: dateStr, target: title });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log(`Added daily target: ${title} for ${dateStr}`);
}

updateDaily();