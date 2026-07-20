# sales-structure-diagnosis

売上構造診断セッションのランディングページです。GitHubリポジトリとCloudflare Pagesを連携し、静的サイトとして公開できる構成になっています。

## ファイル構成

```text
sales-structure-diagnosis/
├── index.html                 # 公開トップページ
├── style.css                  # 全ページ共通スタイル
├── script.js                  # UTM引き継ぎ・CTAクリック計測フック
├── assets/
│   └── images/
│       ├── favicon.svg
│       └── og.png
├── thanks/
│   └── index.html             # 決済後の案内ページ
├── _headers                   # Cloudflare Pages用セキュリティヘッダー
├── README.md
└── .gitignore
```

すべてのCSS・JavaScript・画像を相対パスで読み込んでいます。ローカルファイルの絶対パス、APIキー、認証トークン、`.env`の内容は含めていません。

## Cloudflare Pagesの設定値

| 項目 | 設定値 |
|---|---|
| Framework preset | `None` |
| Build command | 空欄（未設定） |
| Build output directory | `/` |
| Root directory | `/` |
| Production branch | `main` |

Cloudflareの画面でBuild output directoryに `/` を入力できない場合は、`.` を指定してください。リポジトリ直下の `index.html` が公開対象です。

## GitHubへ初回pushする

このフォルダで次を実行します。`<GITHUB_REPOSITORY_URL>`は、GitHubで作成した空のリポジトリURLに置き換えてください。

```bash
git init
git add .
git commit -m "Initial landing page"
git branch -M main
git remote add origin <GITHUB_REPOSITORY_URL>
git push -u origin main
```

GitHub側でREADMEやライセンスを自動作成せず、空のリポジトリとして作成すると初回pushが簡単です。

## Cloudflare Pagesへ公開する

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)を開きます。
2. `Workers & Pages`を開きます。
3. `Create application`を選択します。
4. `Pages`を選択します。
5. `Connect to Git`を選択します。
6. GitHubアカウントを連携し、対象リポジトリを選択します。
7. Production branchを`main`にします。
8. Framework presetを`None`にします。
9. Build commandは空欄にします。
10. Build output directoryを`/`にします。入力できない場合は`.`を指定します。
11. Root directoryを`/`にします。
12. `Save and Deploy`を押します。

公開後は、通常 `https://sales-structure-diagnosis.pages.dev` の形式でアクセスできます。プロジェクト名がすでに使用されている場合は、Cloudflareが案内する別のURLになります。

## ローカルで確認する

### 方法1：直接開く

`index.html`をブラウザで開きます。基本表示は確認できますが、実際の公開環境に近い確認には簡易サーバーを推奨します。

### 方法2：簡易サーバーを使う

Python 3が入っている場合、このフォルダで次を実行します。

```bash
python3 -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/
```

停止するときは、ターミナルで `Ctrl + C` を押します。

## 更新方法

HTML、CSS、JavaScript、画像を修正した後、次を実行します。

```bash
git add .
git commit -m "Update landing page"
git push
```

`main`ブランチへのpushを検知すると、Cloudflare Pagesが自動で再公開します。問題が起きた場合はCloudflare PagesのDeployments画面から、以前の正常なデプロイへロールバックできます。

## 公開前に確認すること

- `index.html`がリポジトリ直下にある
- 申込先URLが正しい
- 決済サービスの完了後URLが `https://公開URL/thanks/` に設定されている
- `og:url`、`og:image`、canonicalが実際のPages URLと一致している
- `.env`、APIキー、トークン、秘密鍵、顧客の実名資料が含まれていない

## 公開後チェックリスト

- [ ] `https://プロジェクト名.pages.dev`でトップページが表示される
- [ ] PCとスマートフォンでレイアウトや改行が崩れていない
- [ ] ヘッダー、途中、最終、スマートフォン固定の申込ボタンが動く
- [ ] URLに付けたUTMパラメータが決済URLへ引き継がれる
- [ ] 決済後に `/thanks/` へ移動できる
- [ ] 日程予約リンクと事前アンケートリンクが動く
- [ ] OG画像とfaviconが表示される
- [ ] ブラウザの開発者ツールにコンソールエラーがない
- [ ] Cloudflare PagesのDeploymentが成功している

## セキュリティ上の注意

- パスワード、APIキー、Cloudflareトークン、GitHubトークンをファイルへ書かないでください。
- `.env`は`.gitignore`の対象です。公開サイトで秘密値が必要な場合は、Cloudflare PagesのEnvironment variablesを利用します。
- 公開前に `git diff --cached` で、意図しない顧客情報や秘密情報が含まれていないことを確認してください。
