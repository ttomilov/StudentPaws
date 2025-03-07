const vscode = require('vscode');

const Status = {
    happy: 'happy',
    angry: 'angry',
    neutral: 'neutral',
    absent: 'absent',
    coding: 'coding',
    neutral_coding: 'neutral_coding',
    angry_coding: 'angry_coding',
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
        this._errors = 0;
        this._warnings = 0;
        this._phase = 0;
    }

    resolveWebviewView(webviewView) {
        if (!webviewView) return;

        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.onDidChangeVisibility(() => {this._changeStatusOnChangeVisibility()});
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        this.updateDiagnostics();
        this._checkTerminalExitCode();
    }

    _changeStatusOnChangeVisibility() {
        if (this._status === Status.angry_coding) {
            this._status = Status.angry;
        } else if (this._status === Status.neutral_coding) {
            this._status = Status.neutral;
        } else if (this._status === Status.coding) {
            this._status = Status.happy;
        } else if (this._status === Status.success) {
            this.updateDiagnostics();
            return;
        } else if (this._status === Status.failed) {
            this.updateDiagnostics();
            return;
        }

        this.setState(this._status, this._status);
    }


    _checkTerminalExitCode() {
        vscode.window.onDidEndTerminalShellExecution(event => {
            if (this._terminalTimeout) {
                clearTimeout(this._terminalTimeout);
            }
            const previousStatus = this._status;
            if (event.exitCode === undefined || event.exitCode === 0) {
                this.setState(Status.success, Status.success);
            } else {
                this.setState(Status.failed, Status.failed);
            }
            if (this._status !== Status.coding) {
                this._timeout = setTimeout(() => {
                    this.setState(Status[previousStatus], previousStatus);
                }, 5000);
            }
        });
    }

    updateDiagnostics() {
        if (!this._view || this._status === Status.coding) return;
        if (this._status === Status.neutral_coding) return;
        if (this._status === Status.angry_coding) return;

        const diagnostics = vscode.languages.getDiagnostics();
        this._warnings = 0;
        this._errors = 0;

        if (diagnostics) {
            diagnostics.forEach(([_, diags]) => {
                diags.forEach(diag => {
                    if (diag.severity === vscode.DiagnosticSeverity.Error) {
                        this._errors++;
                    } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
                        this._warnings++;
                    }
                });
            });
        }

        let state = Status.happy;
        if (this._errors > 40) state = Status.absent;
        else if (this._errors > 0) state = Status.angry;
        else if (this._warnings > 0 && this._errors === 0) state = Status.neutral;

        this.setState(state, state);
    }

    setState(state, status) {
        this._status = status;
        if (this._view) {
            this._view.webview.postMessage({ state });
        }

        
    }

    _getHtmlForWebview(webview) {
        if (!webview || !this._extensionUri) return '';

        const petHappyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_happy.png'));
        const petNeutralUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral.png'));
        const petCoding1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_coding1.png'));
        const petCoding2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_coding2.png'));
        const petCodingNeutral1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral_coding1.png'));
        const petCodingNeutral2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral_coding2.png'));
        const petCodingAngry1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_angry_coding1.png'));
        const petCodingAngry2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_angry_coding2.png'));
        const petSuccessUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_success.png'));
        const petAbsentUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_absent.png'));
        const petFailedUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_failed.png'));
        
        const angryAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim1.png'));
        const angryAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim2.png'));
        const angryAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim3.png'));
        const angryAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim4.png'));
        const angryAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim5.png'));
        const angryAnim6Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim6.png'));
        const angryAnim7Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim7.png'));


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
                        width: 100vw; 
                        height: auto;  
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
                    const vscode = acquireVsCodeApi();
                    
                    const images = {
                        happy: "${petHappyUri}",
                        neutral: "${petNeutralUri}",
                        absent: "${petAbsentUri}",
                        coding0: "${petCoding1Uri}",
                        coding1: "${petCoding2Uri}",
                        angry_coding0: "${petCodingAngry1Uri}",
                        angry_coding1: "${petCodingAngry2Uri}",
                        neutral_coding0: "${petCodingNeutral1Uri}",
                        neutral_coding1: "${petCodingNeutral2Uri}",
                        success: "${petSuccessUri}",
                        failed: "${petFailedUri}"
                    };

                    const animAngry = [
                        "${angryAnim1Uri}",
                        "${angryAnim2Uri}",
                        "${angryAnim3Uri}",
                        "${angryAnim4Uri}",
                        "${angryAnim5Uri}",
                        "${angryAnim6Uri}",
                        "${angryAnim7Uri}"
                    ];

                    let prevState = null;
                    let anim = null;
                    let indexAngry = 0;

                    window.addEventListener('message', event => {
                        const state = event.data.state;
                        if (state === prevState) return;

                        const petImage = document.getElementById('pet-image');

                        if (state === "angry") {
                            startAngryAnim();
                        } else if (state === "absent") {
                            petImage.style.display = "none";
                        } else {
                            petImage.style.display = "block";
                            const imageName = images[state] || images.happy;
                            petImage.src = imageName;
                            if (anim) clearInterval(anim);    
                        }
                    
                        
                        prevState = state;
                    });

                    function startAngryAnim() {
                        indexAngry = 0;

                        anim = setInterval(() => {angryAnim()}, 100)
                    }

                    function angryAnim() {
                        const petImage = document.getElementById('pet-image');

                        petImage.src = animAngry[indexAngry];

                        indexAngry = (indexAngry + 1) % 7;
                    }


                </script>
            </body>
            </html>
        `;
    }

    typingText() {
        if (this._view && this._status != Status.absent) {
            let stateName, newStatus;

            switch (this._status) {
                case Status.happy:
                case Status.coding:
                    newStatus = Status.coding;
                    break;
                case Status.neutral:
                case Status.neutral_coding:
                    newStatus = Status.neutral_coding;
                    break;
                case Status.angry:
                case Status.angry_coding:
                    newStatus = Status.angry_coding;
                    break;
            }

            stateName = newStatus + this._phase;

            this.setState(stateName, newStatus);

            this._phase = (this._phase + 1) % 2;

            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            this._timeout = setTimeout(() => {this._status = "check"; this.updateDiagnostics()}, 1000);
        }
    }
}

module.exports = { TamagotchiViewProvider };