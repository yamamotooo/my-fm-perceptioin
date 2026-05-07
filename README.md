# my-fm-perception README

VS Code から FileMaker の DDR (FMSaveAsXML) ファイルを開き、スクリプトカタログに含まれるスクリプトをフォルダ＋テキストファイルに展開するツールです。  
`my-fm-perception.exportXML` コマンド（コマンドパレットから「FileMaker: Export Scripts」などで検索）を提供します。

## Features

- アクティブな DDR XML (例: `連絡先.xml`) を解析し、`<ScriptCatalog>` に登録されているフォルダ/スクリプトを辿ります。
- `Script.isFolder="True"` を検出するとフォルダを作成し、`ScriptReference.UUID` をたどってステップの DDRREF を突き合わせ、`DDR_INFO` から人間が読めるステップテキストを抽出して `.txt` として保存します。
- `my-fm-perception.exportLayouts` コマンドで `<LayoutCatalog>/<Layout>` を HTML に変換し、`FMSaveAsXML/LayoutCatalog/NNN_レイアウト名.html` として書き出します。`layout-to-html.xsl` テンプレートも出力するので、今後の拡張は XSLT の更新で対応可能です。
- 書き出し先は元の XML と同じディレクトリに `FMSaveAsXML/ScriptCatalog` や `FMSaveAsXML/LayoutCatalog` を自動生成し、その配下に必要なファイルを作成します。

## Requirements

特別な設定は不要です。VS Code のワークスペースに DDR XML ファイルが存在し、対象ファイルをエディターで開いている必要があります。

## Extension Settings

設定項目は現在ありません。

## Known Issues

- DDR_INFO に存在しない DDRREF を参照しているステップは、プレースホルダー文を出力します。
- XML の構造は FileMaker バージョンに依存するため、未検証のバージョンでは解析に失敗する可能性があります。

## Release Notes

### 0.0.1

- FileMaker Scripts をテキストに書き出すコマンドを追加。
- 50 MB を超える大容量 XML ファイルはエディターの制限によりアクティブエディターとして認識されず、解析対象外となっていた問題を修正。
