// src/index.js

// AWS SDK for JavaScript (v3) の CloudWatch クライアントをインポート
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
const axios = require('axios');

// us-east-1 リージョンで CloudWatchClient を初期化
const cloudwatchClient = new CloudWatchClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log("Start!");
  try {
    // Discord の Webhook URL を Lambda の環境変数から取得
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      throw new Error('DISCORD_WEBHOOK_URL is not defined in environment variables.');
    }

    // 直近1時間分のメトリクスを取得するための時刻を指定
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3600 * 1000);

    // CloudWatch Billing メトリクスの取得パラメータ
    const params = {
      Namespace: 'AWS/Billing',
      MetricName: 'EstimatedCharges',
      Dimensions: [{ Name: 'Currency', Value: 'USD' }],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600,
      Statistics: ['Maximum']  // Sum や Average ではなく Max を取得
    };

    // コマンドオブジェクトを生成して送信
    const command = new GetMetricStatisticsCommand(params);
    const result = await cloudwatchClient.send(command);

    // Datapoints から最新の推定料金を取り出す
    const datapoints = result.Datapoints || [];
    let estimatedCharges = 0.0;

    if (datapoints.length > 0) {
      // タイムスタンプが最大のものを最新データとみなす
      const latestPoint = datapoints.reduce((a, b) =>
        (a.Timestamp > b.Timestamp) ? a : b
      );
      estimatedCharges = latestPoint.Maximum;
    }

    // Discord に送るメッセージ
    const message = 
      `**AWS推定請求額 (当月累積)**\n` +
      `・EstimatedCharges: \n`
      `    $${estimatedCharges.toFixed(2)}\n` +

    // Discord Webhook へ送信
    await axios.post(discordWebhookUrl, {
      content: message
    });

    console.log("Done!");
    return {
      statusCode: 200,
      body: 'OK'
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: err.message
    };
  }
};
