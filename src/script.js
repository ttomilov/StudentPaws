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

class CatViewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._view = null;
        this._status = Status.happy;
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
                clearTimeout(this._timeout);
            }
            
            console.log(event.exitCode);
            if (event.exitCode === undefined || event.exitCode === 0) {
                this.setState(Status.success, this._status);
            } else {
                this.setState(Status.failed, this._status);
            }
            if (this._status !== Status.coding 
                    && this._status !== Status.angry_coding 
                    && this._status !== Status.neutral_coding) {
                this._timeout = setTimeout(() => {
                    this.setState(this._status, this._status);
                }, 10000);
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
        if (this._errors >= 10) state = Status.absent;
        else if (this._errors >= 5) state = Status.angry;
        else if (this._warnings > 5 || (this._errors < 5 && this._errors !== 0)) state = Status.neutral;  

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
        const petAbsentUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_absent.png'));
        
        const petCoding1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_coding1.png'));
        const petCoding2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_coding2.png'));
        const petCodingNeutral1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral_coding1.png'));
        const petCodingNeutral2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_neutral_coding2.png'));
        const petCodingAngry1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_angry_coding1.png'));
        const petCodingAngry2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'cat_angry_coding2.png'));

        const angryAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim1.png'));
        const angryAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim2.png'));
        const angryAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim3.png'));
        const angryAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim4.png'));
        const angryAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim5.png'));
        const angryAnim6Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim6.png'));
        const angryAnim7Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'angry_anim7.png'));

        const neutralAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim1.png'));
        const neutralAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim2.png'));
        const neutralAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim3.png'));
        const neutralAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim4.png'));
        const neutralAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim5.png'));
        const neutralAnim6Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim6.png'));
        const neutralAnim7Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim7.png'));
        const neutralAnim8Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'neutral_anim8.png'));
        
        const happyAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim1.png'));
        const happyAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim2.png'));
        const happyAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim3.png'));
        const happyAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim4.png'));
        const happyAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim5.png'));
        const happyAnim6Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim6.png'));
        const happyAnim7Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'happy_anim7.png'));
        
        const failedAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'failed_anim1.png'));
        const failedAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'failed_anim2.png'));
        const failedAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'failed_anim3.png'));
        const failedAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'failed_anim4.png'));
        const failedAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'failed_anim5.png'));
        
        const successAnim1Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim1.png'));
        const successAnim2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim2.png'));
        const successAnim3Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim3.png'));
        const successAnim4Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim4.png'));
        const successAnim5Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim5.png'));
        const successAnim6Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim6.png'));
        const successAnim7Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'success_anim7.png'));
        
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
                        absent: "${petAbsentUri}",
                        coding0: "${petCoding1Uri}",
                        coding1: "${petCoding2Uri}",
                        angry_coding0: "${petCodingAngry1Uri}",
                        angry_coding1: "${petCodingAngry2Uri}",
                        neutral_coding0: "${petCodingNeutral1Uri}",
                        neutral_coding1: "${petCodingNeutral2Uri}"
                    };

                    const animAngry = [
                        "${angryAnim1Uri}",
                        "${angryAnim2Uri}",
                        "${angryAnim3Uri}",
                        "${angryAnim4Uri}",
                        "${angryAnim5Uri}",
                        "${angryAnim6Uri}",
                        "${angryAnim7Uri}",
                        "${angryAnim1Uri}"
                    ];

                    const animNeutral = [
                        "${neutralAnim1Uri}",
                        "${neutralAnim2Uri}",
                        "${neutralAnim3Uri}",
                        "${neutralAnim4Uri}",
                        "${neutralAnim5Uri}",
                        "${neutralAnim6Uri}",
                        "${neutralAnim7Uri}", 
                        "${neutralAnim8Uri}"
                    ];

                    const animHappy = [
                        "${happyAnim1Uri}",
                        "${happyAnim2Uri}",
                        "${happyAnim3Uri}",
                        "${happyAnim4Uri}",
                        "${happyAnim5Uri}",
                        "${happyAnim6Uri}",
                        "${happyAnim7Uri}",
                        "${happyAnim1Uri}"
                    ];

                    const animFailed = [
                        "${failedAnim1Uri}",
                        "${failedAnim2Uri}",
                        "${failedAnim3Uri}",
                        "${failedAnim4Uri}",
                        "${failedAnim5Uri}"
                    ];

                    const animSuccess = [
                        "${successAnim1Uri}",
                        "${successAnim2Uri}",
                        "${successAnim3Uri}",
                        "${successAnim4Uri}",
                        "${successAnim5Uri}",
                        "${successAnim6Uri}",
                        "${successAnim7Uri}"
                    ];

                    let prevState = null;
                    let anim = null;
                    let index = 0;

                    window.addEventListener('message', event => {
                        const state = event.data.state;
                        if (state === prevState) return;

                        const petImage = document.getElementById('pet-image');
                        petImage.style.display = "block";

                        if (anim) clearInterval(anim); 
                        if (state === "angry") {
                            startAnim(animAngry);
                        } else if (state === "neutral") {
                            startAnim(animNeutral);
                        } else if (state === "happy") {
                            startAnim(animHappy);
                        } else if (state === "failed") {
                            startAnim(animFailed);
                        } else if (state === "success") {
                            startAnim(animSuccess);
                        } else if (state === "absent") {
                            petImage.src = images[state];   
                        } else {
                            const imageName = images[state] || images.happy;
                            petImage.src = imageName;   
                        }
                    
                        
                        prevState = state;
                    });

                    function startAnim(animArr) {
                        index = 0;

                        anim = setInterval(() => {animate(animArr)}, 100);
                    }

                    function animate(animArr) {
                        const petImage = document.getElementById('pet-image');

                        petImage.src = animArr[index];

                        index = (index + 1) % animArr.length;
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

                default:
                    newStatus = Status.coding;
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

module.exports = { CatViewProvider };