import * as vscode from 'vscode';
import TripasManager from "./TripasTimerManager";
import * as axios from "axios";

const cats = {
	'Coding Cat': 'https://i.postimg.cc/fbm33cJG/logo.png',
	'Compiling Cat': 'https://i.postimg.cc/fbm33cJG/logo.png',
	'Testing Cat': 'https://i.postimg.cc/fbm33cJG/logo.png'
};

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	let NEXT_TERM_ID = 1;

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.start', () => {
			CatCodingPanel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('catCoding.doRefactor', () => {
			if (CatCodingPanel.currentPanel) {
				CatCodingPanel.currentPanel.doRefactor();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('styleCollison.execute', () => {
			const terminal = vscode.window.createTerminal(`style collision #${NEXT_TERM_ID++}`);
			terminal.sendText("cd /");
			terminal.sendText(`mkdir styleCollision/${NEXT_TERM_ID}`);
			terminal.sendText(`cd ./styleCollision/${NEXT_TERM_ID}`);
			terminal.sendText(`type > ${NEXT_TERM_ID}.txt`);
			if (ensureTerminalExists()) {
				selectTerminal().then(terminal => {
					if (terminal) {
						terminal.show(true);
					}
				});
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('launchTFS.execute', () => {
			const terminal = vscode.window.createTerminal('LaunchTFS');
			terminal.sendText("cd /");
			terminal.sendText("cd '.\\Windows\\System32'");
			terminal.sendText("notepad.exe");
			if (ensureTerminalExists()) {
				selectTerminal().then(terminal => {
					if (terminal) {
						terminal.show(true);
					}
				});
			}
		})
	);

	const myCommandId = "tripasLint.execute";
	context.subscriptions.push(
		vscode.commands.registerCommand(myCommandId, () => {
			vscode.window.showInformationMessage('Lint Was started Executing');
			const terminal = vscode.window.createTerminal('TriPAs Lint');
			terminal.sendText('npm run lint');
			if (ensureTerminalExists()) {
				selectTerminal().then(terminal => {
					if (terminal) {
						terminal.show(true);
					}
				});
			}
		})
	);

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = myCommandId;
	context.subscriptions.push(myStatusBarItem);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				CatCodingPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

	//Timer-----------------------------------------------------------------------
	const config = vscode.workspace.getConfiguration("cat-coding");
	const tripasManager = new TripasManager(config.workTime, config.pauseTime);

	tripasManager.start();

	context.subscriptions.push(tripasManager);
	//-----------------------------------------------------------------------------
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: CatCodingPanel | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (CatCodingPanel.currentPanel) {
			CatCodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			CatCodingPanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						// vscode.window.showErrorMessage(message.text);
						return;
					case 'style':
						vscode.window.showInformationMessage(message.text);
						vscode.commands.executeCommand("styleCollison.execute");
					break;
					case 'tfs':
						vscode.window.showInformationMessage(message.text);
						vscode.commands.executeCommand("launchTFS.execute");
					break;
					case 'get':
						axios.get(message.text, {auth: {
							username: '',
							password: 'i37vpq7gtuhiolhb74omkqrr6pglxvepiezyvcj22ys24l4bnfna'
						}}).then(function(response: any) {
							const responseData  = response.data;
							panel.webview.postMessage({ command: 'getData' , text : responseData});
						});
					break;	
				}
			},
			null,
			this._disposables
		);

		//Axios Service call
		let getapidata : any;
        const loginhtml = "index";
		let user: '';
        const token = 'i37vpq7gtuhiolhb74omkqrr6pglxvepiezyvcj22ys24l4bnfna';
		axios.get('https://dev.azure.com/TrizettoT3/Facets/_apis/wit/wiql/3dbc60d2-97a1-483b-99c6-0eed0460646e?api-version=4.1', {auth: {
			username: user,
			password: token
		}} )
        .then(function (response : any) {
          // handle success
          getapidata = response.data;
          panel.webview.postMessage({ command: 'AZdoData' , text : getapidata });
          const terminal = vscode.window.createTerminal('LaunchChrome');
            terminal.sendText("cd /");
            terminal.sendText(`mkdir Login/${loginhtml}`);
            terminal.sendText(`cd ./Login/${loginhtml}`);
            terminal.sendText(`type > ${loginhtml}.html`);
			return response.data;
        })
        .catch(function (error : any) {
          // handle error
          console.log(error , 'err');
        })
        .then(function () {
          // always executed
        });

	}

	public axiosCall(url: string, panel: vscode.WebviewPanel) {
		
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		CatCodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat(webview, 'Compiling Cat');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat(webview, 'Testing Cat');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat(webview, 'Coding Cat');
				return;
		}
	}

	private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
		this._panel.title = 'TriPAs';
		this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
	}

	private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>TriPAs</title>
			</head>
			<body>
				<div class="container">
					<div class="image-container">
						<img class="logo" src="${catGifPath}" width="300" />
					</div>
					<div class="btn-container">
						<button type="button" id="Dashboard">Dashboard</button>
						<button type="button" id="style">Configure Command</button>
						<button type="button" id="lint">Run Lint</button>
						<button type="button" id="tfs">Launch application</button>
						<button type="button" id="task">AzDo Information</button>
					</div>
				</div>
				<br />
				<div id="azdoContent">
					<h2>AzDo Information</h2><br />
					<table border="1" width="100%">
						<thead>
							<tr>
								<th>Title</th>
								<th>Date</th>
								<th>State</th>
								<th>Original Estimate</th>
								<th>Completed</th>
								<th>Remaining</th>
							</tr>
						</thead>
						<tbody id="tbodyContent">
						<tr><td><a href="https://dev.azure.com/TriZettoT3/Facets/_workitems/edit/464696">DNAR - C++ Analysis, Maint movement, Rest Service</a></td><td>2021-07-28T06:31:44.01Z</td><td>Closed</td><td>36</td><td>36</td><td>36</td></tr><tr><td><a href="https://dev.azure.com/TriZettoT3/Facets/_workitems/edit/464668">Premium Gender - Coding, C++ Analysis, Maint Movement, Rest Service Development</a></td><td>2021-07-28T06:31:41.39Z</td><td>Closed</td><td>24</td><td>24</td><td>24</td></tr><tr><td><a href="https://dev.azure.com/TriZettoT3/Facets/_workitems/edit/464465"> ReST development - Coding and Unit testing</a></td><td>2021-07-28T11:11:57.797Z</td><td>In Progress</td><td>30</td><td>6</td><td>30</td></tr>
						</tbody>
					</table>
				</div>
				<br />
				<div id="buildInfo">
					<h2>Build Information</h2><br />
					<p>Last Successful build: 7/1/2021<br />
					Changesets are included<br />
					Changeset: <i><a>911725</a></i><br />
					User: <i><a>Frederick, Jerry</a></i><br />
					Changeset: <i><a>911723</a></i><br />
					User: Panson, Gregg <br />
					<a>Click Here</a> for Detailed Report</p>
				</div>
				<h1 id="lines-of-code-counter">0</h1>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});
	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}