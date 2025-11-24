/**
 * knowledge-base Agent SDK テスト
 *
 * 3つのシナリオで、ナレッジスキルの有効性を検証します。
 *
 * シナリオ1: 単一スキル・複数ファイル参照
 *   - 質問: エラーコード E-1001 が出て決済できません
 *   - 期待: billing-support → error-codes.md + troubleshooting.md + faq.md
 *
 * シナリオ2: 複数スキル参照
 *   - 質問: チーム→個人ダウングレード、データと料金は？
 *   - 期待: subscription-plans + account-management + billing-support
 *
 * シナリオ3: 補足情報必須
 *   - 質問: アカウントを削除したい
 *   - 期待: account-management → deletion.md + data-policy.md（30日復元可能の情報が必須）
 *
 * 実行:
 *   pnpm sdk              # 全シナリオ順次実行
 *   pnpm sdk --scenario 1 # シナリオ1のみ
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createPluginManager, createAgentSdkPluginAdapter } from '../../packages/core/dist/index.js';
import { query } from '@anthropic-ai/claude-agent-sdk';

// テストシナリオ定義
const scenarios = [
  {
    id: 1,
    name: '単一スキル・複数ファイル参照',
    prompt: 'エラーコード E-1001 が出て決済できません。どうすればいいですか？',
    expectedSkills: ['billing-support'],
    expectedFiles: ['error-codes.md', 'troubleshooting.md', 'faq.md'],
    checkPoints: [
      'カード有効期限切れ（E-1001の原因）',
      'カード情報の更新手順',
      '24時間以内に再請求（faq.mdの情報）',
    ],
  },
  {
    id: 2,
    name: '複数スキル参照',
    prompt: 'チームプランから個人プランにダウングレードしたい。データは消えますか？料金はどうなりますか？',
    expectedSkills: ['subscription-plans', 'account-management', 'billing-support'],
    expectedFiles: ['upgrade-downgrade.md', 'data-policy.md', 'payment-methods.md'],
    checkPoints: [
      'メンバーのアクセス権削除',
      'データ自体は保持（容量超過時の制限）',
      '返金なし（日割り計算なし）',
    ],
  },
  {
    id: 3,
    name: '補足情報必須',
    prompt: 'アカウントを削除したい',
    expectedSkills: ['account-management'],
    expectedFiles: ['deletion.md', 'data-policy.md'],
    checkPoints: [
      '削除手順',
      '30日間の猶予期間（復元可能）',
      '未払いの請求があると削除不可',
    ],
  },
];

// スキル定義（index.tsと同じ）
const billingSkill = {
  id: 'billing-support',
  content: [
    '---',
    'name: billing-support',
    'description: CloudSyncの請求・決済に関するサポート情報。エラーコード、支払い方法、トラブルシューティングなど。決済エラー、支払い失敗、請求に関する質問に使用。',
    '---',
    '# 請求・決済サポート',
    '',
    '## 概要',
    'CloudSyncの請求・決済に関するサポート情報です。',
    '',
    '## ドキュメント',
    '- [error-codes.md](error-codes.md) - エラーコード一覧と原因',
    '- [payment-methods.md](payment-methods.md) - 利用可能な支払い方法',
    '- [troubleshooting.md](troubleshooting.md) - トラブルシューティング手順',
    '- [faq.md](faq.md) - よくある質問',
    '',
    '## 重要',
    '- エラーが発生した場合は、まず error-codes.md でエラーコードを確認',
    '- 対処法は troubleshooting.md を参照',
    '- 補足情報は faq.md に記載',
  ].join('\n'),
  files: [
    {
      path: 'error-codes.md',
      content: [
        '# エラーコード一覧',
        '',
        '## 決済エラー',
        '',
        '| コード | 名称 | 原因 |',
        '|--------|------|------|',
        '| E-1001 | CARD_EXPIRED | クレジットカードの有効期限切れ |',
        '| E-1002 | INSUFFICIENT_FUNDS | 残高不足 |',
        '| E-1003 | CARD_DECLINED | カード会社による拒否 |',
        '| E-1004 | INVALID_CARD_NUMBER | カード番号が無効 |',
        '| E-1005 | PAYMENT_TIMEOUT | 決済処理タイムアウト |',
        '',
        '## E-1001: CARD_EXPIRED の詳細',
        '- **原因**: 登録されているクレジットカードの有効期限が切れています',
        '- **影響**: 次回の自動請求が失敗し、7日後にサービスが一時停止されます',
        '- **対処**: troubleshooting.md の「カード情報の更新」を参照',
        '',
        '## E-1002: INSUFFICIENT_FUNDS の詳細',
        '- **原因**: カードの利用可能額が請求額を下回っています',
        '- **影響**: 請求が保留され、3日後に再試行されます',
        '- **対処**: カード会社に連絡して利用可能額を確認',
      ].join('\n'),
    },
    {
      path: 'payment-methods.md',
      content: [
        '# 利用可能な支払い方法',
        '',
        '## クレジットカード',
        '- Visa, Mastercard, American Express, JCB',
        '',
        '## 日割り計算',
        '- **アップグレード時**: 即座に新プランが適用、差額を日割りで請求',
        '- **ダウングレード時**: 現在の請求期間終了後に新プランが適用',
        '- **返金**: ダウングレード・解約時の返金はありません（年間プランの途中解約を除く）',
      ].join('\n'),
    },
    {
      path: 'troubleshooting.md',
      content: [
        '# トラブルシューティング',
        '',
        '## カード情報の更新',
        '',
        '### 手順',
        '1. CloudSync管理画面にログイン',
        '2. 「設定」>「請求情報」を開く',
        '3. 「支払い方法」セクションの「編集」をクリック',
        '4. 新しいカード情報を入力',
        '5. 「保存」をクリック',
        '',
        '### 更新後の再請求',
        '- カード情報更新後、**24時間以内**に自動で再請求が行われます',
        '- 手動で即座に再請求したい場合は「今すぐ支払う」ボタンをクリック',
        '',
        '## E-1001 (カード期限切れ) の対処',
        '1. 上記「カード情報の更新」の手順でカードを更新',
        '2. または、新しいカードを追加',
      ].join('\n'),
    },
    {
      path: 'faq.md',
      content: [
        '# よくある質問（FAQ）',
        '',
        '## Q: カード更新後、いつ再請求されますか？',
        'A: カード情報更新後、**24時間以内**に自動で再請求されます。',
        '',
        '## Q: 請求に失敗するとサービスは止まりますか？',
        'A: はい。請求失敗から**7日後**にサービスが一時停止されます。',
        '   停止中もデータは保持されますが、ログインできなくなります。',
      ].join('\n'),
    },
  ],
};

const accountSkill = {
  id: 'account-management',
  content: [
    '---',
    'name: account-management',
    'description: CloudSyncのアカウント管理に関する情報。ユーザー権限、データポリシー、アカウント削除など。アカウント設定、権限、データ、削除に関する質問に使用。',
    '---',
    '# アカウント管理',
    '',
    '## 概要',
    'CloudSyncのアカウント管理に関する情報です。',
    '',
    '## ドキュメント',
    '- [user-roles.md](user-roles.md) - ユーザー権限とロール',
    '- [data-policy.md](data-policy.md) - データ保持ポリシー',
    '- [deletion.md](deletion.md) - アカウント削除手順',
    '',
    '## 重要',
    '- アカウント削除前に必ず data-policy.md を確認してください',
    '- 削除後30日間は復元可能ですが、それ以降は完全に削除されます',
  ].join('\n'),
  files: [
    {
      path: 'user-roles.md',
      content: [
        '# ユーザー権限とロール',
        '',
        '| ロール | 説明 |',
        '|--------|------|',
        '| オーナー | 全権限（削除含む） |',
        '| 管理者 | メンバー管理、請求閲覧 |',
        '| メンバー | データ閲覧・編集 |',
      ].join('\n'),
    },
    {
      path: 'data-policy.md',
      content: [
        '# データ保持ポリシー',
        '',
        '## アカウント削除時',
        '- 削除リクエスト後、**30日間**は復元可能（猶予期間）',
        '- 猶予期間中にサポートに連絡すれば復元できます',
        '- 30日経過後、すべてのデータが**完全に削除**されます',
        '',
        '## ダウングレード時のデータ',
        '- **チーム → 個人**: チームメンバーのアクセス権が削除されます',
        '- **データ自体は保持**されますが、プランの容量制限を超える場合:',
        '  - 新規アップロードが制限されます',
        '  - 既存データは削除されません',
        '  - 容量内に収まるようファイルを削除する必要があります',
        '',
        '## データエクスポート',
        '- アカウント削除前にデータをエクスポート可能',
        '- 「設定」>「データエクスポート」から全データをZIPでダウンロード',
      ].join('\n'),
    },
    {
      path: 'deletion.md',
      content: [
        '# アカウント削除',
        '',
        '## 削除前の確認事項',
        '',
        '### 必須チェックリスト',
        '- [ ] **未払いの請求がないこと**（未払いがあると削除不可）',
        '- [ ] 必要なデータをエクスポート済み',
        '- [ ] チームメンバーへの通知済み',
        '',
        '## 削除手順',
        '',
        '1. オーナーアカウントでログイン',
        '2. 「設定」>「アカウント」を開く',
        '3. ページ下部の「アカウントを削除」をクリック',
        '4. 確認のためパスワードを入力',
        '5. 「削除を実行」をクリック',
        '',
        '## 削除後',
        '',
        '- 確認メールが送信されます',
        '- **30日間の猶予期間**があります',
        '- 猶予期間中に復元したい場合はサポートにお問い合わせください',
      ].join('\n'),
    },
  ],
};

const subscriptionSkill = {
  id: 'subscription-plans',
  content: [
    '---',
    'name: subscription-plans',
    'description: CloudSyncのサブスクリプションプランに関する情報。プラン比較、アップグレード、ダウングレード、解約など。プラン変更、料金、機能比較に関する質問に使用。',
    '---',
    '# サブスクリプションプラン',
    '',
    '## 概要',
    'CloudSyncのプランと変更に関する情報です。',
    '',
    '## ドキュメント',
    '- [plan-comparison.md](plan-comparison.md) - プラン比較表',
    '- [upgrade-downgrade.md](upgrade-downgrade.md) - プラン変更手順',
    '- [cancellation.md](cancellation.md) - 解約ポリシー',
    '',
    '## 重要',
    '- ダウングレード時はデータ保持ポリシーを確認してください（account-management参照）',
    '- 料金の日割り計算については billing-support を参照',
  ].join('\n'),
  files: [
    {
      path: 'plan-comparison.md',
      content: [
        '# プラン比較表',
        '',
        '| プラン | 月額 | ストレージ | メンバー |',
        '|--------|------|------------|----------|',
        '| 個人 | $10 | 10GB | 1人 |',
        '| チーム | $25/人 | 100GB | 最大50人 |',
      ].join('\n'),
    },
    {
      path: 'upgrade-downgrade.md',
      content: [
        '# プラン変更',
        '',
        '## ダウングレード',
        '',
        '### 手順',
        '1. 「設定」>「プラン」を開く',
        '2. ダウングレード先のプランを選択',
        '3. 注意事項を確認',
        '4. 「ダウングレード」をクリック',
        '',
        '### ダウングレード時の注意',
        '- 現在の請求期間が**終了するまで**現プランが継続',
        '- **返金はありません**',
        '',
        '### チーム → 個人 ダウングレードの特別な注意',
        '- すべてのチームメンバーのアクセス権が**削除**されます',
        '- メンバーのデータはオーナーに移管されます',
        '- メンバーに事前に通知することを推奨',
      ].join('\n'),
    },
    {
      path: 'cancellation.md',
      content: [
        '# 解約ポリシー',
        '',
        '## 月額プランの解約',
        '- いつでも解約可能',
        '- 現在の請求期間終了までサービス利用可能',
        '- **返金なし**',
      ].join('\n'),
    },
  ],
};

async function runScenario(
  scenarioNum: number,
  manager: Awaited<ReturnType<typeof createPluginManager>>,
  pluginRefs: Array<{ type: 'local'; path: string }>
) {
  const scenario = scenarios.find((s) => s.id === scenarioNum);
  if (!scenario) {
    console.error(`Scenario ${scenarioNum} not found`);
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`シナリオ ${scenario.id}: ${scenario.name}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n質問: "${scenario.prompt}"`);
  console.log(`\n期待されるスキル: ${scenario.expectedSkills.join(', ')}`);
  console.log(`期待されるファイル: ${scenario.expectedFiles.join(', ')}`);
  console.log(`\nチェックポイント:`);
  scenario.checkPoints.forEach((cp, i) => console.log(`  ${i + 1}. ${cp}`));

  const q = query({
    prompt: scenario.prompt,
    options: {
      plugins: pluginRefs,
      allowedTools: ['Skill', 'Read'],
      settingSources: [],
    },
  });

  const usedSkills: string[] = [];
  const readFiles: string[] = [];
  let finalResponse = '';

  try {
    for await (const msg of q) {
      // init メッセージを確認
      if (msg.type === 'system' && (msg as { subtype?: string }).subtype === 'init') {
        const initMsg = msg as { plugins?: unknown[]; skills?: unknown };
        console.log('\n--- SDK Init ---');
        console.log('Plugins:', JSON.stringify(initMsg.plugins));
        console.log('Skills:', JSON.stringify(initMsg.skills));
      }

      // Skill使用を検出
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const block of msg.message.content) {
          if (block.type === 'tool_use' && block.name === 'Skill') {
            const skill = (block.input as { skill?: string }).skill || '';
            console.log(`\n🎯 Skill使用: ${skill}`);
            const skillName = skill.split(':')[1] || skill;
            if (!usedSkills.includes(skillName)) {
              usedSkills.push(skillName);
            }
          } else if (block.type === 'tool_use' && block.name === 'Read') {
            const filePath = (block.input as { file_path?: string }).file_path || '';
            const fileName = filePath.split('/').pop() || '';
            console.log(`📖 Read: ${fileName}`);
            if (!readFiles.includes(fileName)) {
              readFiles.push(fileName);
            }
          } else if (block.type === 'text') {
            finalResponse = block.text as string;
          }
        }
      }

      if (msg.type === 'result') {
        finalResponse = (msg as { result?: string }).result || finalResponse;
        break;
      }
    }

    // 結果サマリー
    console.log(`\n${'─'.repeat(40)}`);
    console.log('結果サマリー');
    console.log(`${'─'.repeat(40)}`);
    console.log(`使用されたスキル: ${usedSkills.join(', ') || 'None'}`);
    console.log(`読み込まれたファイル: ${readFiles.join(', ') || 'None'}`);

    // 期待値との比較
    const skillMatch = scenario.expectedSkills.some((s) => usedSkills.includes(s));
    const fileMatch = scenario.expectedFiles.some((f) => readFiles.includes(f));

    console.log(`\nスキル使用: ${skillMatch ? '✅' : '❌'}`);
    console.log(`ファイル参照: ${fileMatch ? '✅' : '❌'}`);

    // チェックポイントの確認
    console.log(`\nチェックポイント確認:`);
    scenario.checkPoints.forEach((cp, i) => {
      const found = finalResponse.toLowerCase().includes(cp.substring(0, 10).toLowerCase());
      console.log(`  ${i + 1}. ${cp}: ${found ? '✅' : '⚠️'}`);
    });

    console.log(`\n回答（抜粋）:`);
    console.log(finalResponse.substring(0, 500) + (finalResponse.length > 500 ? '...' : ''));
  } catch (err) {
    console.error('Error:', err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const scenarioArg = args.indexOf('--scenario');
  const targetScenario = scenarioArg !== -1 ? parseInt(args[scenarioArg + 1], 10) : null;

  const tempRoot = await mkdtemp(join(tmpdir(), 'viyv-knowledge-sdk-'));
  process.env.CLAUDE_PLUGIN_ROOT = tempRoot;
  process.env.CLAUDE_HOME = tempRoot;

  const manager = await createPluginManager();

  console.log('Creating CloudSync knowledge base plugin...');
  const plugin = await manager.create({
    name: 'cloudsync-support',
    description: 'CloudSync SaaS product support knowledge base',
    skills: [billingSkill, accountSkill, subscriptionSkill],
  });

  const adapter = createAgentSdkPluginAdapter(manager);
  const pluginRefs = await adapter.getSdkPlugins([plugin.id]);
  console.log('Plugin refs:', pluginRefs);

  try {
    if (targetScenario) {
      await runScenario(targetScenario, manager, pluginRefs);
    } else {
      for (const scenario of scenarios) {
        await runScenario(scenario.id, manager, pluginRefs);
      }
    }
  } finally {
    // await manager.delete(plugin.id);
    // await rm(tempRoot, { recursive: true, force: true });
    console.log('\n[DEBUG] Plugin kept at:', tempRoot);
    console.log('[DEBUG] Plugin ID:', plugin.id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
