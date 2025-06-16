# 📸 Camera Lens Chart

カメラレンズの焦点距離を視覚的に比較できるインタラクティブなチャートアプリケーションです。

## ✨ 機能

- **インタラクティブなレンズチャート**: レンズの焦点距離範囲を棒グラフと散布図で視覚的に表示
- **レンズフィルタリング**: 表示したいレンズを個別に選択可能
- **カテゴリ別色分け**: 単焦点、ズーム、マクロレンズを異なる色で表示
- **ダークモード対応**: ライト・ダークテーマの切り替えが可能
- **レスポンシブデザイン**: モバイルからデスクトップまで対応

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **チャートライブラリ**: Recharts
- **テーマ**: next-themes

## 🚀 はじめ方

### 前提条件

- Node.js 18以上
- npm、yarn、pnpm、またはbun

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd lens-chart
```

2. 依存関係をインストール
```bash
npm install
# または
yarn install
# または
pnpm install
```

3. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

4. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📊 データ構造

レンズデータは以下の構造で管理されています：

```typescript
interface Lens {
  id: string;
  name: string;
  category: '単焦点' | 'ズーム' | 'マクロ';
  focalLengthMin: number;
  focalLengthMax: number;
  aperture: string;
  manufacturer: string;
}
```

## 🎨 カスタマイズ

### レンズデータの追加

`data/lenses.ts` ファイルを編集してレンズデータを追加・変更できます。

### スタイルの変更

- Tailwind CSSクラスを使用してスタイリング
- `components/lens-chart.tsx` でチャートの色やレイアウトをカスタマイズ可能

## 📁 プロジェクト構造

```
lens-chart/
├── app/                 # Next.js App Router
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # メインページ
├── components/         # Reactコンポーネント
│   ├── lens-chart.tsx  # メインチャートコンポーネント
│   ├── theme-provider.tsx # テーマプロバイダー
│   ├── theme-toggle.tsx   # テーマ切り替えボタン
│   └── ui/             # shadcn/ui コンポーネント
├── data/               # データファイル
│   └── lenses.ts       # レンズデータ
├── types/              # TypeScript型定義
│   └── lens.ts         # レンズ関連の型
└── lib/                # ユーティリティ
    └── utils.ts        # ヘルパー関数
```

## 🔧 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用にビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

