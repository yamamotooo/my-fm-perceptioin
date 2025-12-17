import * as path from 'path';
import { TextDecoder } from 'util';
import * as vscode from 'vscode';
import { XMLParser } from 'fast-xml-parser';

type StringMap = Map<string, string>;

type ScriptStep = {
	reference?: string;
	id?: string;
	enabled?: boolean;
};

const STEP_LOCALIZED_LABELS: Record<string, string> = {
	'1': "スクリプト実行",
	'2': "<不明> [2]",
	'3': "名前を付けて XML として保存",
	'4': "次のフィールドへ移動",
	'5': "前のフィールドへ移動",
	'6': "レイアウト切り替え",
	'7': "新規レコード/検索条件",
	'8': "レコード/検索条件複製",
	'9': "レコード/検索条件削除",
	'10': "対象レコード削除",
	'11': "索引から挿入",
	'12': "直前に参照したレコードから挿入",
	'13': "現在の日付を挿入",
	'14': "現在の時刻を挿入",
	'15': "<不明> [15]",
	'16': "レコード/検索条件/ページへ移動",
	'17': "フィールドへ移動",
	'18': "選択部分をスペルチェック",
	'19': "現レコードをスペルチェック",
	'20': "対象レコードをスペルチェック",
	'21': "レコードのソート解除",
	'22': "検索モードに切り替え",
	'23': "全レコードを表示",
	'24': "検索条件を変更",
	'25': "レコードを対象外に",
	'26': "複数レコードを対象外に",
	'27': "対象外のみを表示",
	'28': "検索実行",
	'29': "ツールバーの表示切り替え",
	'30': "表示方法の切り替え",
	'31': "ウインドウの調整",
	'32': "ヘルプを表示",
	'33': "ファイルを開く",
	'34': "ファイルを閉じる",
	'35': "レコードのインポート",
	'36': "レコードのエクスポート",
	'37': "名前を付けて保存",
	'38': "データベースの管理を開く",
	'39': "レコードのソート",
	'40': "フィールド内容の再ルックアップ",
	'41': "プレビューモードに切り替え",
	'42': "印刷設定",
	'43': "印刷",
	'44': "アプリケーションを終了",
	'45': "元に戻す/再実行",
	'46': "切り取り",
	'47': "コピー",
	'48': "貼り付け",
	'49': "消去",
	'50': "全てを選択",
	'51': "レコード/検索条件復帰",
	'52': "<不明> [52]",
	'53': "<不明> [53]",
	'54': "<不明> [54]",
	'55': "ブラウズモードに切り替え",
	'56': "ピクチャを挿入",
	'57': "Event を送信",
	'58': "<不明> [58]",
	'59': "QuickTime を挿入",
	'60': "現在のユーザ名を挿入",
	'61': "テキストを挿入",
	'62': "スクリプト一時停止/続行",
	'63': "メールを送信",
	'64': "DDE コマンドを送信",
	'65': "電話をかける",
	'66': "読み上げ",
	'67': "AppleScript を実行",
	'68': "", //If
	'69': "", //Else
	'70': "", //End If
	'71': "", //Loop
	'72': "", //Exit Loop If
	'73': "", //End Loop
	'74': "関連レコードへ移動",
	'75': "レコード/検索条件確定",
	'76': "フィールド設定",
	'77': "計算結果を挿入",
	'78': "オブジェクトを挿入",
	'79': "ウインドウの固定",
	'80': "ウインドウ内容の再表示",
	'81': "ウインドウのスクロール",
	'82': "新規作成",
	'83': "パスワード変更",
	'84': "マルチユーザ設定",
	'85': "ユーザによる強制終了を許可",
	'86': "エラー処理",
	'87': "カスタムダイアログを表示",
	'88': "スクリプトワークスペースを開く",
	'89': "", //# (コメント)
	'90': "全スクリプト終了",
	'91': "フィールド内容の全置換",
	'92': "テキスト定規の表示切り替え",
	'93': "警告音",
	'94': "システム書式の使用",
	'95': "ファイルの修復",
	'96': "名前を付けてアドオンパッケージとして保存",
	'97': "ズームの設定",
	'98': "全レコード/検索条件コピー",
	'99': "ポータル内の行へ移動",
	'100': "<不明> [100]",
	'101': "レコード/検索条件コピー",
	'102': "キャッシュをディスクに書き込む",
	'103': "現在のスクリプト終了",
	'104': "ポータル内の行を削除",
	'105': "設定を開く",
	'106': "単語を修正",
	'107': "スペルチェックオプション",
	'108': "辞書を選択",
	'109': "ユーザ辞書を編集",
	'110': "<不明> [110]",
	'111': "URL を開く",
	'112': "値一覧の管理を開く",
	'113': "共有設定を開く",
	'114': "ファイルオプションを開く",
	'115': "書式設定バーを許可",
	'116': "次のシリアル値を設定",
	'117': "SQL を実行",
	'118': "ホストを開く",
	'119': "ウインドウの移動/サイズ変更",
	'120': "全ウインドウを整列",
	'121': "ウインドウを閉じる",
	'122': "新規ウインドウ",
	'123': "ウインドウを選択",
	'124': "ウインドウタイトルの設定",
	'125': "", //Else If
	'126': "対象レコードの絞り込み",
	'127': "対象レコードの拡大",
	'128': "検索/置換を実行",
	'129': "検索/置換を開く",
	'130': "選択範囲を設定",
	'131': "ファイルを挿入",
	'132': "フィールド内容のエクスポート",
	'133': "レコード/検索条件を開く",
	'134': "アカウントを追加",
	'135': "アカウントを削除",
	'136': "アカウントパスワードをリセット",
	'137': "アカウントの有効化",
	'138': "再ログイン",
	'139': "ファイルを変換",
	'140': "データソースの管理を開く",
	'141': "変数を設定",
	'142': "メニューセットのインストール",
	'143': "レコードを Excel として保存",
	'144': "レコードを PDF として保存",
	'145': "オブジェクトへ移動",
	'146': "Web ビューアの設定",
	'147': "フィールドを名前で設定",
	'148': "OnTimer スクリプトをインストール",
	'149': "保存済み検索を開く",
	'150': "クイック検索の実行",
	'151': "レイアウトの管理を開く",
	'152': "レコードをスナップショットリンクとして保存",
	'153': "<不明> [153]",
	'154': "レコードをフィールド順でソート",
	'155': "一致するレコードを検索",
	'156': "オブジェクトの管理を開く",
	'157': "プラグインファイルのインストール",
	'158': "PDF を挿入",
	'159': "オーディオ/ビデオを挿入",
	'160': "URL から挿入",
	'161': "デバイスから挿入",
	'162': "<不明> [162]",
	'163': "<不明> [163]",
	'164': "サーバー上のスクリプト実行",
	'165': "テーマの管理を開く",
	'166': "メニューバーの表示切り替え",
	'167': "オブジェクトの更新",
	'168': "レイアウトオブジェクトアニメーション設定",
	'169': "ポップオーバーを閉じる",
	'170': "<不明> [170]",
	'171': "<不明> [171]",
	'172': "ホストにアップロードを開く",
	'173': "<不明> [173]",
	'174': "タッチキーボードの有効化",
	'175': "Web ビューアで JavaScript を実行",
	'176': "許可される向きの設定",
	'177': "AVPlayer 再生",
	'178': "AVPlayer 再生状態設定",
	'179': "AVPlayer オプション設定",
	'180': "ポータルの更新",
	'181': "フォルダパスを取得",
	'182': "テーブルデータを削除",
	'183': "お気に入りを開く",
	'184': "Open Starter Solution",
	'185': "領域監視スクリプトを構成",
	'186': "<不明な外部 スクリプトステップ>",
	'187': "ローカル通知の構成",
	'188': "ファイルの存在を取得",
	'189': "ファイルサイズを取得",
	'190': "データファイルを作成",
	'191': "データファイルを開く",
	'192': "データファイルに書き込む",
	'193': "データファイルから読み取る",
	'194': "データファイルの位置を取得",
	'195': "データファイルの位置を設定",
	'196': "データファイルを閉じる",
	'197': "ファイルを削除",
	'198': "<不明> [198]",
	'199': "ファイルの名前変更",
	'200': "エラーログ設定",
	'201': "NFC 読み取りの構成",
	'202': "機械学習モデルを構成",
	'203': "FileMaker Data API を実行",
	'204': "<不明> [204]",
	'205': "トランザクションを開く",
	'206': "トランザクション確定",
	'207': "トランザクション復帰",
	'208': "セッション識別子の設定",
	'209': "辞書を設定",
	'210': "コールバックを使用してサーバー上のスクリプト実行",
	'211': "Claris Connect フローをトリガ",
	'212': "AI アカウント設定",
	'213': "モデルをファインチューニング",
	'214': "自然言語で SQL クエリーを実行",
	'215': "埋め込みを挿入",
	'216': "対象レコードに埋め込みを挿入",
	'217': "AI 呼び出しログ設定",
	'218': "セマンティック検索を実行",
	'219': "RAG 処理を実行",
	'220': "モデルから応答を生成",
	'221': "自然言語で検索実行",
	'222': "回帰モデルを構成",
	'223': "エラー時のトランザクション復帰設定",
	'224': "Execute URL",
	'225': "レコードを JSONL として保存",
	'226': "プロンプトテンプレートを構成",
	'227': "RAG アカウント設定",
	'228': "レコード一覧へ移動",
	'237': "<不明>",
	'238': "<不明>",
	'239': "<不明>",
	'240': "<不明>",
	'241': "<不明>"
};

const INDENT_UNIT = '    ';
const BLOCK_START_STEP_IDS = new Set(['68', '71']);
const BLOCK_MID_STEP_IDS = new Set(['69', '125']);
const BLOCK_END_STEP_IDS = new Set(['70', '73']);

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('my-fm-perception.exportXML', async () => {
		try {
			const targetDocument = vscode.window.activeTextEditor?.document;
			if (!targetDocument) {
				throw new Error('アクティブなエディターがありません。対象の XML を開いてからコマンドを実行してください。');
			}

			if (targetDocument.isDirty) {
				await targetDocument.save();
			}

			const fileUri = targetDocument.uri;
			if (fileUri.scheme !== 'file') {
				throw new Error('ローカルファイル以外は処理できません。');
			}

			const fileBuffer = await vscode.workspace.fs.readFile(fileUri);
			const xmlContent = decodeXml(fileBuffer);
			const result = await exportScripts(xmlContent, fileUri.fsPath);
			vscode.window.showInformationMessage(
				`スクリプト ${result.scriptFiles} 件（フォルダ ${result.folders} 件）を ${result.outputDir} に書き出しました。`
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			vscode.window.showErrorMessage(`スクリプトの書き出しに失敗しました: ${message}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

async function exportScripts(xmlContent: string, sourcePath: string) {
	const parsed = parseXml(xmlContent);
	const root = parsed?.FMSaveAsXML;
	if (!root) {
		throw new Error('FMSaveAsXML ルート要素を検出できません。');
	}

	const scriptEntries = toArray(root.Structure?.AddAction?.ScriptCatalog?.Script);
	if (scriptEntries.length === 0) {
		throw new Error('ScriptCatalog にスクリプトが見つかりません。');
	}

	const stepsMap = buildStepsMap(root.Structure?.AddAction?.StepsForScripts);
	const ddrTextMap = buildDdrTextMap(root.DDR_INFO);

	const xmlDir = path.dirname(sourcePath);
	const exportRoot = path.join(xmlDir, 'FMSaveAsXML');
	const outputDir = path.join(exportRoot, 'ScriptCatalog');
	await vscode.workspace.fs.createDirectory(vscode.Uri.file(outputDir));

	const folderStack: string[] = [];
	const nameUsage = new Map<string, number>();
	let scriptFiles = 0;
	let folderCount = 0;

	for (const entry of scriptEntries) {
		const rawName = typeof entry.name === 'string' && entry.name.trim().length > 0 ? entry.name.trim() : 'Unnamed';
		const safeName = sanitizeName(rawName);
		const folderFlag = typeof entry.isFolder === 'string' ? entry.isFolder.toLowerCase() : '';

		if (folderFlag === 'marker') {
			folderStack.pop();
			continue;
		}

		if (folderFlag === 'true') {
			folderStack.push(safeName);
			const dirUri = vscode.Uri.file(path.join(outputDir, ...folderStack));
			await vscode.workspace.fs.createDirectory(dirUri);
			folderCount += 1;
			continue;
		}

		const scriptUuid = getText(entry.UUID);
		if (!scriptUuid) {
			console.warn(`UUID が存在しないスクリプトをスキップしました: ${rawName}`);
			continue;
		}

		const dirPath = path.join(outputDir, ...folderStack);
		await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));

		const uniqueName = ensureUniqueFileName(dirPath, safeName, nameUsage);
		const fileUri = vscode.Uri.file(path.join(dirPath, `${uniqueName}.txt`));
		const scriptLines = buildScriptLines(scriptUuid, stepsMap, ddrTextMap);
		const fileContent = formatScriptFile(rawName, scriptUuid, scriptLines);
		await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent, 'utf8'));
		scriptFiles += 1;
	}

	return { outputDir, scriptFiles, folders: folderCount };
}

function decodeXml(buffer: Uint8Array): string {
	if (buffer.length >= 2) {
		if (buffer[0] === 0xff && buffer[1] === 0xfe) {
			const text = new TextDecoder('utf-16le').decode(buffer);
			return text.replace(/^\uFEFF/, '');
		}

		if (buffer[0] === 0xfe && buffer[1] === 0xff) {
			const swapped = Buffer.from(buffer);
			for (let i = 0; i < swapped.length - 1; i += 2) {
				const temp = swapped[i];
				swapped[i] = swapped[i + 1];
				swapped[i + 1] = temp;
			}

			const text = new TextDecoder('utf-16le').decode(swapped);
			return text.replace(/^\uFEFF/, '');
		}
	}

	return new TextDecoder().decode(buffer).replace(/^\uFEFF/, '');
}

function parseXml(xmlContent: string) {
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '',
		textNodeName: 'text',
		trimValues: false,
		allowBooleanAttributes: true
	});

	try {
		return parser.parse(xmlContent);
	} catch (error) {
		throw new Error(`XML の解析に失敗しました: ${error}`);
	}
}

function buildStepsMap(stepsForScripts: any) {
	const map: Map<string, ScriptStep[]> = new Map();
	const scripts = toArray(stepsForScripts?.Script);
	for (const script of scripts) {
		const uuid = script?.ScriptReference?.UUID;
		if (!uuid) {
			continue;
		}

		const steps = toArray(script?.ObjectList?.Step);
			const scriptSteps: ScriptStep[] = [];
			for (const step of steps) {
				const reference = getText(step?.DDRREF);
				const stepId = typeof step?.id === 'string' ? step.id : undefined;
				if (!reference && !stepId) {
					continue;
				}

				const enabledAttr = typeof step?.enable === 'string' ? step.enable : undefined;
				const isEnabled = enabledAttr ? enabledAttr.toLowerCase() === 'true' : true;
				scriptSteps.push({ reference, id: stepId, enabled: isEnabled });
			}

			map.set(uuid, scriptSteps);
	}

	return map;
}

function buildDdrTextMap(ddrInfo: any): StringMap {
	const map: StringMap = new Map();
	const objectList = ddrInfo?.Script?.ObjectList;
	if (!objectList || typeof objectList !== 'object') {
		return map;
	}

	for (const [key, value] of Object.entries(objectList)) {
		if (key === 'text') {
			continue;
		}

			const nodes = toArray(value as any);
			for (const node of nodes) {
				const content = typeof node === 'string' ? node : getText(node);
				if (typeof content === 'string') {
					map.set(key, normalizeDdrText(content));
				} else if (content === undefined && typeof node === 'object' && node !== null) {
					map.set(key, '');
				}
			}
	}

	return map;
}

function buildScriptLines(uuid: string, stepsMap: Map<string, ScriptStep[]>, ddrTextMap: StringMap) {
	const steps = stepsMap.get(uuid) ?? [];
	const applyIndent = createIndentFormatter();
	return steps.map((step) => {
		const text = resolveStepText(step, ddrTextMap);
		const indented = applyIndent(step, text);
		return isStepDisabled(step) ? commentOutLine(indented) : indented;
	});
}

function formatScriptFile(name: string, uuid: string, lines: string[]) {
	const header = [`# Script: ${name}`, `# UUID: ${uuid}`, ''];
	if (lines.length === 0) {
		lines.push('# ステップ情報が見つかりませんでした。');
	}

	return `${[...header, ...lines].join('\n')}\n`;
}

function sanitizeName(input: string) {
	const replacements: Record<string, string> = {
		'<': '＜',
		'>': '＞',
		':': '：',
		'"': '”',
		'/': '／',
		'\\': '＼',
		'|': '｜',
		'?': '？',
		'*': '＊'
	};

	const reserved = new Set(['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']);

	let sanitized = input.replace(/[<>:"/\\|?*]/g, (char) => replacements[char] ?? '＿').trim();
	sanitized = sanitized.replace(/[. ]+$/g, '');
	if (sanitized.length === 0) {
		return 'script';
	}

	if (reserved.has(sanitized.toUpperCase())) {
		return `${sanitized}_`;
	}

	return sanitized;
}

function ensureUniqueFileName(dir: string, baseName: string, usage: Map<string, number>) {
	const normalized = baseName || 'script';
	const key = `${dir}::${normalized.toLowerCase()}`;
	const count = usage.get(key) ?? 0;
	usage.set(key, count + 1);
	return count === 0 ? normalized : `${normalized}_${count}`;
}

function getText(node: any): string | undefined {
	if (typeof node === 'string') {
		return node.trim();
	}

	if (!node) {
		return undefined;
	}

	if (Object.prototype.hasOwnProperty.call(node, 'text')) {
		const value = node.text;
		if (typeof value === 'string') {
			return value.trim();
		}

		if (value === undefined) {
			return '';
		}
	}

	return undefined;
}

function toArray<T>(value: T | T[] | undefined): T[] {
	if (!value) {
		return [];
	}

	return Array.isArray(value) ? value : [value];
}

function isStepDisabled(step: ScriptStep) {
	return step.enabled === false;
}

function commentOutLine(line: string) {
	if (!line) {
		return line;
	}

	const match = line.match(/^(\s*)(.*)$/);
	if (!match) {
		return `// ${line}`;
	}

	const [, indent, content] = match;
	if (content.length === 0) {
		return line;
	}

	const trimmedContent = content.trimStart();
	if (trimmedContent.startsWith('//')) {
		return `${indent}${content}`;
	}

	return `${indent}// ${content}`;
}

function resolveStepText(step: ScriptStep, ddrTextMap: StringMap) {
	if (!step.reference) {
		return '[DDRREF が存在しません]';
	}

	const resolved = ddrTextMap.get(step.reference);
	if (resolved === undefined) {
		return `[DDRREF ${step.reference} のテキストが見つかりません]`;
	}

	if (resolved.length === 0) {
		return '';
	}

	return applyLocalization(step.id, resolved);
}

function applyLocalization(stepId: string | undefined, text: string) {
	if (!stepId) {
		return text;
	}

	const localized = STEP_LOCALIZED_LABELS[stepId];
	if (!localized) {
		return text;
	}

	return `${localized} ${text}`;
}

function createIndentFormatter() {
	let level = 0;
	return (step: ScriptStep, text: string) => {
		const normalizedId = step.id ?? '';
		const affectsIndent = !isStepDisabled(step);
		if (affectsIndent && shouldDecreaseIndent(normalizedId)) {
			level = Math.max(0, level - 1);
		}

		const line = text.length === 0 ? '' : `${INDENT_UNIT.repeat(level)}${text}`;

		if (affectsIndent && shouldIncreaseIndent(normalizedId)) {
			level += 1;
		}

		return line;
	};
}

function shouldDecreaseIndent(stepId: string) {
	return BLOCK_END_STEP_IDS.has(stepId) || BLOCK_MID_STEP_IDS.has(stepId);
}

function shouldIncreaseIndent(stepId: string) {
	return BLOCK_START_STEP_IDS.has(stepId) || BLOCK_MID_STEP_IDS.has(stepId);
}

function normalizeDdrText(input: string) {
	return input.replace(/(?:&#13;|&#09;|\r|\t)/g, ' ');
}
