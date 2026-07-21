# 瞬英（SHUNEI）— 瞬間英作文 & 英語力診断

日本語を見て瞬時に英語にする **瞬間英作文** と、文法・語彙・作文・読解の **英語力診断テスト** をブラウザだけで使える静的Webアプリです。

## 機能

- **瞬間英作文**：初級 / 中級 / 上級、5・10・15問、任意で1問60秒タイマー、ヒント表示、答え合わせ（短縮形・句読点のゆれを許容）
- **英語力診断**：全20問（選択＋英作文）、CEFR目安（A1〜B2）、スキル別正答率、端末内に前回結果を保存

## ファイル構成

```text
english-training/
├── index.html
├── style.css
├── app.js
├── data.js
├── assets/favicon.svg
├── _headers
└── README.md
```

## ローカルで確認

```bash
cd english-training
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## Cloudflare Pages で公開する場合

| 項目 | 設定例 |
|---|---|
| Framework preset | `None` |
| Build command | 空欄 |
| Build output directory | `/` または `.` |
| Root directory | `english-training` |

既存の売上構造診断サイト（`sales-structure-diagnosis-github/`）とは別ディレクトリです。英語アプリだけを公開するときは Root directory に `english-training` を指定してください。
