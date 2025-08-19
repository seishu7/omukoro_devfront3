# Teams連携テスト手順

## 作成したテストページ

### 1. 基本的なTeams送信テスト
**URL:** `/teams-test`

- 任意のメッセージをTeamsに送信するテストページ
- チャンネルIDとメンション対象ユーザーIDを指定可能
- サンプル質問事項の設定機能付き

### 2. 統合テスト（推奨）
**URL:** `/teams-integration-test`

- 実際の機能フローに近いテストページ
- 相談内容入力 → 質問事項生成 → Teams送信の一連の流れをテスト
- 複数の相談先から選択してTeams送信が可能

## 必要な環境変数設定

以下の環境変数を `.env.local` に設定してください：

```bash
# Microsoft Azure AD設定
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id

# Microsoft Graph API設定
GRAPH_REFRESH_TOKEN=your-refresh-token

# Teams設定
TEAMS_TEAM_ID=your-teams-team-id
TEAMS_DEFAULT_CHANNEL_ID=19:your-channel-id@thread.tacv2
TEAMS_DEFAULT_MENTION_USER_ID=user@yourdomain.com

# API設定
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
```

## 作成したAPIエンドポイント

### 1. `/api/teams/test` (POST)
Teams連携テスト用API

**リクエスト:**
```json
{
  "message": "送信するメッセージ",
  "channelId": "チャンネルID（オプション）",
  "mentionUserId": "メンション対象ユーザーID（オプション）"
}
```

### 2. `/api/analytics/test` (POST)
質問事項生成テスト用API

**リクエスト:**
```json
{
  "text": "相談内容"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "summary": "相談内容の要約",
    "questions": ["質問1", "質問2", "質問3"],
    "consultants": [
      {
        "name": "相談先名",
        "department": "部署名",
        "expertise": "専門分野"
      }
    ],
    "analysis_metadata": {
      "confidence": 0.85,
      "generated_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

## テスト手順

1. **環境変数の設定**
   - 上記の環境変数を `.env.local` に設定

2. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

3. **基本テスト**
   - `http://localhost:3000/teams-test` にアクセス
   - サンプルメッセージでTeams送信をテスト

4. **統合テスト**
   - `http://localhost:3000/teams-integration-test` にアクセス
   - 相談内容を入力して質問事項生成をテスト
   - 生成された質問事項をTeamsに送信をテスト

## 注意事項

- テスト時は実際のTeamsチャンネルにメッセージが送信されます
- 権限とスコープが正しく設定されていることを確認してください
- Microsoft Graph APIの `ChannelMessage.Send` 権限が必要です
- テスト用のチャンネルを使用することを推奨します

## 🔧 診断機能

### 環境設定診断API
**URL:** `/api/teams/debug`

- **GET**: 環境変数の設定状況をチェック
- **POST**: Microsoft Graph APIトークンの取得テスト

### 使用方法
1. ブラウザで `http://localhost:3000/api/teams/debug` にアクセス
2. 環境変数の設定状況を確認
3. 不足している変数があれば `.env.local` に追加

## トラブルシューティング

### 🚨 修正済みの問題
- **API URL構築の問題**: 内部関数でトークン取得を実装し、外部API呼び出しを削除
- **エラーハンドリング不足**: 詳細なエラー情報を追加

### よくあるエラーと対策

1. **"Failed to get access token"**
   - **原因**: 環境変数の設定不足
   - **対策**: `/api/teams/debug` で設定状況を確認し、不足している環境変数を設定

2. **"Missing required environment variables for Microsoft Graph API"**
   - **原因**: Azure AD関連の環境変数が未設定
   - **対策**: 以下の環境変数を `.env.local` に設定
     ```bash
     NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
     AZURE_CLIENT_SECRET=your-client-secret
     NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
     GRAPH_REFRESH_TOKEN=your-refresh-token
     ```

3. **"Token refresh failed"**
   - **原因**: リフレッシュトークンの有効期限切れまたは不正な値
   - **対策**: 
     - Azure ADでアプリの設定を確認
     - 新しいリフレッシュトークンを取得
     - スコープに `ChannelMessage.Send` が含まれているか確認

4. **"TEAMS_TEAM_ID環境変数が設定されていません"**
   - **原因**: Teams設定の環境変数が未設定
   - **対策**: 以下を `.env.local` に追加
     ```bash
     TEAMS_TEAM_ID=your-teams-team-id
     TEAMS_DEFAULT_CHANNEL_ID=19:your-channel-id@thread.tacv2
     TEAMS_DEFAULT_MENTION_USER_ID=user@yourdomain.com
     ```

5. **Teams message send failed**
   - **原因**: チーム・チャンネルIDが不正、または権限不足
   - **対策**: 
     - チーム・チャンネルIDが正しいか確認
     - Microsoft Graph APIの権限を確認
     - メンション対象ユーザーがチームのメンバーか確認
     - アプリがTeamsチームに追加されているか確認

6. **403 Forbidden**
   - **原因**: 権限不足
   - **対策**: 
     - アプリがTeamsチームに追加されているか確認
     - 必要な権限が付与されているか確認
     - Azure ADでアプリの権限設定を確認

### 🔍 診断手順
1. `http://localhost:3000/api/teams/debug` にアクセスして環境変数をチェック
2. 不足している変数があれば設定
3. `http://localhost:3000/teams-test` でテスト実行
4. エラーが発生した場合は、詳細なエラー情報を確認
