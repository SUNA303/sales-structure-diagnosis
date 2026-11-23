# 売上構造プロデュース 無料60分体験LP

独自ドメイン: https://sunagawalab.com/
Instagram掲載中の公開先: https://sales-structure-diagnosis.pages.dev/

index.html と assets/trial/ が、ユーザー指定の v10 HTML を元にしたLPです。apply/ は無料60分の予約と事前アンケートの案内、privacy/ は個人情報の取扱いです。

Cloudflare Pages: production branch main, root directory sales-structure-diagnosis-github, build command exit 0, output directory .

main 更新で自動公開されます。変更前の版はGit履歴から復元できます。既存の thanks/、style.css、script.js は以前の有料診断のために保持し、新しいLPからは案内しません。

GA4・MetaピクセルのIDは未設定のため、外部計測は無効です。assets/trial/tracking-init.js にIDを設定する場合は、_headers の許可先と privacy/index.html の説明も見直してください。LP上のクリックは申込完了として計測しません。

QA用ページや制作資料・アンケート回答・秘密情報をこの公開フォルダに含めないでください。

## 事前アンケート（2026年11月23日更新）

案内リンク: https://forms.gle/DTocaAc315UeJE9V9

apply/ のSTEP 02で、Googleフォームをページ内に表示するか、別のタブで開くかを選べます。質問はGoogleフォーム本体から直接表示し、サイト側に複製しません。同じフォームで質問を編集すれば、再表示時にその内容が反映されます。新しいフォームへ移行する場合は、apply/index.html の埋め込み先・案内リンク、privacy/index.html の問い合わせ先、TimeRexの予約完了メッセージを更新してください。

正式URLは https://sunagawalab.com/ です。旧 https://lp.sunagawalab.com/ からは、パスとクエリを保って301転送します。Workerの assets.run_worker_first と src/index.js のホスト判定で実装しています。
