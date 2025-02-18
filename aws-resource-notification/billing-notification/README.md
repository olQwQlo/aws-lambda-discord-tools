# billing-notification

AWS の CloudWatch Billing メトリクス (EstimatedCharges) を毎日 1 回取得し、
Discord Webhook へ当月の推定請求額を通知する AWS Lambda プロジェクトです。

## 機能概要

- `src/index.js` で CloudWatch から最新の推定請求額を取得し、Discord へメッセージ送信。
- Node.js (JavaScript) で実装。
- `DISCORD_WEBHOOK_URL` 環境変数を利用してWebhook先を指定。

## 前提条件

1. AWS アカウントで [Billing アラートの有効化](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/monitor-charges.html) を行い、
   `AWS/Billing` Namespace にアクセスできるようにしておく。
2. Lambda 実行ロールに `cloudwatch:GetMetricStatistics` の権限が付与されている。

## 使い方

1. **依存ライブラリのインストール** (ローカル)
    ```
    cd billing-notification
    npm install
    ```
2. **不要ファイルを除外 (必要に応じて)**
    ```
    rm -rf node_modules
    npm install --production
    ```
3. **ZIP 化** (ローカル)
    ```
    zip -r function.zip . -x "*.git*" -x "README.md" -x "*.DS_Store"
    ```
4. **Lambda へデプロイ** (AWS CLI)
    - AWS CLI で aws lambda update-function-code --function-name `YourLambdaName` --zip-file fileb://function.zip
    - または Lambda コンソールに ZIP をアップロード。
5. **環境変数の設定** (AWS Management Console)
    - Lambda の設定 > 環境変数 > `DISCORD_WEBHOOK_URL` に Discord の Webhook URL を設定。
6. **EventBridge でスケジュール設定** (AWS Management Console)
    - EventBridge のルールを作成し、Lambda をターゲットに設定。
        - 例: `cron(0 0 9 * * ? *)` で毎日朝 9 時に実行。

## ローカルテスト方法 (オプション)
- 簡易テストを行う場合は、以下のように実行すると DISCORD_WEBHOOK_URL にメッセージを送信できます。
```
DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...' node src/index.js
```
## ライセンス
- MIT License (ご自由にご利用・改変ください)
