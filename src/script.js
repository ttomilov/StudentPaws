const vscode = require('vscode');

const Status = {
    happy: 'happy',
    angry: 'angry',
    neutral: 'neutral',
    absent: 'absent',
    coding: 'coding',
    success: 'success'
};

class TamagotchiViewProvider {
    status;

    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = null;
        this._status = Status.happy;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    updateDiagnostics() {
        if (!this._view) return;

        const diagnostics = vscode.languages.getDiagnostics();
        let numErrors = 0;
        let numWarnings = 0;

        diagnostics.forEach(([_, diags]) => {
            diags.forEach(diag => {
                if (diag.severity === vscode.DiagnosticSeverity.Error) {
                    numErrors++;
                } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
                    numWarnings++;
                }
            });
        });

        let state = "happy";
        if (numErrors > 40) state = "absent";
        else if (numErrors > 0) state = "angry";
        else if (numWarnings > 0) state = "neutral";

        this.setState(state);
    }

    checkTerminalSuccess() {
        if (!this._view) return;

        this.setState("success");
        setTimeout(() => this.updateDiagnostics(), 5000);
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
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.js'));
        const petImageUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_happy.png'));
        const assetsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets'));

        return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <title>Тамагочи</title>
                <style>
                    body { text-align: center; font-family: Arial, sans-serif; background-color: #f9f9f9; }
                    h1 { color: #333; }
                    #pet-image { width: 150px; height: 150px; }
                </style>
            </head>
            <body>
                <h1>Ваш питомец</h1>
                <img id="pet-image" src="${petImageUri}" alt="Pet">
                <script>
                     window.assetsUri = "${assetsUri}";
                </script>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }

    typingText() {
        this.setState("coding");
    }
}

module.exports = { TamagotchiViewProvider };
