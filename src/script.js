const vscode = require('vscode');

const Status = {
    happy: 'happy',
    angry: 'angry',
    neutral: 'neutral',
    absent: 'absent',
    coding: 'coding',
    success: 'success',
    failed: 'failed'
};

class TamagotchiViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = null;
        this._status = Status.happy;
        this._terminalTimeout = null;
        this._timeout = null;
    }

    resolveWebviewView(webviewView) {
        if (!webviewView) return;

        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this._checkTerminalExitCode();
    }

    _checkTerminalExitCode() {
        vscode.window.onDidEndTerminalShellExecution(event => {
            if (this._terminalTimeout) {
                clearTimeout(this._terminalTimeout);
            }
            const previousStatus = this._status;
            if (event.exitCode === undefined || event.exitCode === 0) {
                this.setState(Status.success);
            } else {
                this.setState(Status.failed);
            }
            if (this._status !== Status.coding) {
                this._timeout = setTimeout(() => {
                    this.setState(previousStatus);
                }, 5000);
            }
        });
    }

    updateDiagnostics() {
        if (!this._view || this._status === Status.coding) return;

        const diagnostics = vscode.languages.getDiagnostics();
        let numErrors = 0;
        let numWarnings = 0;

        if (diagnostics) {
            diagnostics.forEach(([_, diags]) => {
                diags.forEach(diag => {
                    if (diag.severity === vscode.DiagnosticSeverity.Error) {
                        numErrors++;
                    } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
                        numWarnings++;
                    }
                });
            });
        }

        let state = "happy";
        if (numErrors > 40) state = "absent";
        else if (numErrors > 0) state = "angry";
        else if (numWarnings > 0 && numErrors === 0) state = "neutral";

        this.setState(state);
    }

    setState(state) {
        if (state !== this._status) {
            this._status = state;
            if (this._view) {
                this._view.webview.postMessage({ state });
            }
        }
    }

    _getHtmlForWebview(webview) {
        if (!webview || !this._extensionUri) return '';

        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.js'));
        const petHappyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_happy.png'));
        const petNeutralUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral.png'));
        const petAngryUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_angry.png'));
        const petCodingUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_coding.png'));
        const petSuccessUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_success.png'));
        const petAbsentUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_absent.png'));
        const petFailedUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_failed.png'));
        const assetsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets'));

        return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <title>Тамагочи</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; background-color: var(--vscode-editor-background); }
                    .container {
                        display: grid;
                        place-items: center;
                        height: 100vh;
                    }
                    h1 { color: #333; }
                    #pet-image { 
                        width: 150px; 
                        height: 150px;  
                        margin: auto;
                        user-drag: none;
                        -webkit-user-drag: none;
                        user-select: none;
                        -moz-user-select: none;
                        -webkit-user-select: none;
                        -ms-user-select: none; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img id="pet-image" src="${petHappyUri}" alt="Pet">
                </div>
                <script>
                    window.assetsUri = "${assetsUri}";
                </script>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    typingText() {
        if (this._view) {
            this.setState("coding");

            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            this._timeout = setTimeout(() => {this._status = 'check', this.updateDiagnostics()}, 1000);
        }
    }
}

module.exports = { TamagotchiViewProvider };