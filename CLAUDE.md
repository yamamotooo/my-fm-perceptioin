# my-fm-perception

FileMaker の SaveAsXML エクスポートファイル（DDR XML）を解析し、スクリプトおよびレイアウトをファイルとして書き出す VS Code 拡張機能。

## コマンド

| コマンド ID | タイトル | 処理内容 |
|---|---|---|
| `my-fm-perception.exportXML` | Export FileMaker SaveAsXML | スクリプトを `.txt` ファイルとして書き出す |
| `my-fm-perception.exportLayouts` | Export FileMaker Layouts (HTML) | レイアウトを `.html` ファイルとして書き出す |

アクティブエディターで対象 XML を開いた状態でコマンドパレットから実行する。

## 書き出し先

ソース XML と同じディレクトリ配下の `FMSaveAsXML/` に書き出す。
実データ XML はプロジェクトルートの `data/` フォルダに置く（`.gitignore` で除外済み）。

```
data/
  sample.xml               ← ソース XML をここに置く
  FMSaveAsXML/
    ScriptCatalog/         ← exportXML の出力先
    LayoutCatalog/         ← exportLayouts の出力先
```

---

## スクリプト書き出し仕様（exportXML）

### XML 構造とデータ取得の流れ

**Step 1 – ScriptCatalog からスクリプト一覧を取得**

```
FMSaveAsXML > Structure > AddAction > ScriptCatalog > Script
```

- `Script.name` → ファイル名／フォルダ名（Windows 使用不可文字は全角に置換）
- `Script.isFolder = "True"` → ディレクトリを作成
- `Script.isFolder = "marker"` → フォルダの終端（スタックから pop）
- それ以外 → `.txt` ファイルを作成
- `Script > UUID` の値を取得し、後続ステップで照合に使う

**Step 2 – StepsForScripts から対応スクリプトを特定**

```
FMSaveAsXML > Structure > AddAction > StepsForScripts > Script > ScriptReference.UUID
```

Step 1 で取得した UUID と一致する `Script` を探す。

**Step 3 – Step ごとの DDRREF を取得**

```
... > StepsForScripts > Script > ObjectList > Step > DDRREF
```

各 `Step` の `DDRREF` の値（キー文字列）を取得する。

**Step 4 – DDR_INFO からテキストを取得**

```
FMSaveAsXML > DDR_INFO > Script > ObjectList
```

Step 3 で得た DDRREF の値をキーとして、書き出すスクリプトテキストを取得する。

**Step 5 – ScriptCatalog の全スクリプト／フォルダに対して Step 1–4 を実行**

---

### スクリプトテキストの加工

**インデント**

ブロック制御文に応じてインデントを付与する（ネスト対応）。

| 動作 | Step ID |
|---|---|
| インデント増加（開始） | `68` (If), `71` (Loop) |
| インデント増加＋減少（中間） | `69` (Else), `125` (Else If) |
| インデント減少（終了） | `70` (End If), `73` (End Loop) |

無効化されたステップは `// ` でコメントアウトする。

**制御文字の置換**

| 文字 | 置換後 |
|---|---|
| `&#13;`（CR） | スペース |
| `&#09;`（TAB） | スペース |
| `\r`, `\t` | スペース |

**日本語ローカライズ**

`Step.id` に対応する日本語ラベルを DDRREF テキストの前に付加する。

例：id=145 の場合
```
オブジェクトへ移動 Go to Object [ Object Name: "hoge"; Repetition: 1 ]
```

Step ID → 日本語ラベルの対応は `src/extension.ts` の `STEP_LOCALIZED_LABELS` を参照。

---

## レイアウト書き出し仕様（exportLayouts）

### XML 構造

```
FMSaveAsXML > Structure > AddAction > LayoutCatalog > Layout
```

- `Layout.isFolder = "true"` → ディレクトリを作成
- `Layout.isFolder = "marker"` → フォルダの終端
- `Layout.isSeparatorItem = "true"` → スキップ
- それ以外 → `{連番}_{レイアウト名}.html` を作成

### 出力ファイル構成

```
FMSaveAsXML/LayoutCatalog/
  001_レイアウト名.html
  002_レイアウト名.html
  layout-to-html.xsl     ← 初回のみ生成（既存の場合はスキップ）
```

### レイアウト HTML の構造

```
Layout
  └─ PartsList > Part          → <section class="fm-part">
       └─ ObjectList > LayoutObject → <div class="fm-object fm-object-{type}">
```

オブジェクトの位置は `Bounds`（left / top / right / bottom）から `position:absolute` スタイルに変換。

テーマ CSS は `LocalCSS`（CDATA）から抽出して `<style>` に注入。

### 拡張性

未対応のレイアウト XML オブジェクトは、`resources/layout/xslt/templates/` 配下の XSLT ファイルを追加・更新することで対応する。XSLT ファイルはファイル名のアルファベット順に結合される。

---

## レイアウトオブジェクト定義

### CSS クラス ID（fm-object のサフィックス）

```
text_box / text_area / scrollbar / field / edit_box / container
pop_up / drop_down / radio_set / checkbox_set / calendar
chart / portal / web_viewer
rectangle / line / oval / rounded / shape
tab_control / tab_panel / dot_control
button_bar / button_bar_segment / button / popover
```

### パートの CSS クラス

```
layout_background / top_nav_part / title_header / header
body / body_alt / part / footer / title_footer / bottom_nav_part
trailing_sub_summary / trailing_sub_summary_1 / trailing_sub_summary_2
trailing_grand_summary
leading_sub_summary / leading_sub_summary_1 / leading_sub_summary_2
leading_grand_summary
```

### Layout オブジェクトの type 属性値

```
Text / Edit Box / Container / Line / Rectangle / Button / Button Bar
Tab Control / Panel / Popover Button / PopoverPanel / Slide Control
Portal / Chart / Web Viewer / Graphic / Group
Drop-down Calendar / Drop-down List / Pop-up Menu
Concealed Edit Box / Radio Button Set / Checkbox Set
```

### Part の type 属性値

```
Top Navigation / Title Header / Header / Body / Footer / Title Footer / Bottom Navigation
```

---

## 機密データの扱い

- `data/` フォルダは `.gitignore` で除外済み。実データ XML は必ず `data/` 内に置く。
- `data/.gitkeep` のみ git 追跡する。
