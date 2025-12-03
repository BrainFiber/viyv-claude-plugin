---
name: traffic-info
description: 高速道路の混雑状況、渋滞情報、交通情報について質問された時に使用。「高速道路 混雑」「渋滞情報」「交通状況」等のキーワードでトリガー
---
# 高速道路混雑状況取得

このスキルがトリガーされたら、`highway-traffic-fetcher` サブエージェントを起動して処理を委譲してください。

## 実行方法

Taskツールを以下のパラメータで呼び出す：

```
subagent_type: highway-traffic-fetcher
model: haiku
description: 高速道路混雑状況取得
prompt: ユーザーの質問「{質問内容}」に対して、高速道路の混雑状況を取得して報告してください。
```

## 注意

- 必ずTaskツールでサブエージェントに処理を委譲すること
- メインコンテキストで直接WebFetchを実行しないこと
