import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TamagotchiViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('tamagotchiView', provider)
    );
}

class TamagotchiViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const petHappyUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_happy.png'));
        const petHungryUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_hungry.png'));
        const petSickUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_sick.png'));
        const petAngryUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_angry.png'));
        const petNeutralUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'assets', 'pet_neutral.png'));

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tamagotchi</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    #tamagotchi {
                        margin-top: 20px;
                        font-size: 18px;
                    }
                    #pet-image {
                        width: 150px;
                        height: 150px;
                        margin: 20px auto;
                    }
                    button {
                        margin: 10px;
                        padding: 10px 20px;
                        font-size: 16px;
                        cursor: pointer;
                        border: none;
                        border-radius: 5px;
                        background-color: #4CAF50;
                        color: white;
                    }
                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <h1>Тамагочи</h1>
                <div id="tamagotchi">
                    <img id="pet-image" src="${petHappyUri}" alt="Pet">
                    <p>Голод: <span id="hunger">100</span></p>
                    <p>Счастье: <span id="happiness">100</span></p>
                    <p>Здоровье: <span id="health">100</span></p>
                    <p>Ошибки: <span id="errors">0</span></p>
                    <p>Предупреждения: <span id="warnings">0</span></p>
                </div>
                <button id="feed">Покормить</button>
                <button id="play">Поиграть</button>
                <button id="heal">Лечить</button>

                <script>
                    let hunger = 100;
                    let happiness = 100;
                    let health = 100;
                    let errors = 0;
                    let warnings = 0;
                    const petImage = document.getElementById('pet-image');

                    function updatePetImage() {
                        if (errors > 0) {
                            petImage.src = "${petAngryUri}";
                        } else if (warnings > 0) {
                            petImage.src = "${petNeutralUri}";
                        } else {
                            petImage.src = "${petHappyUri}";
                        }
                    }

                    function updateStats() {
                        document.getElementById('hunger').textContent = hunger;
                        document.getElementById('happiness').textContent = happiness;
                        document.getElementById('health').textContent = health;
                        document.getElementById('errors').textContent = errors;
                        document.getElementById('warnings').textContent = warnings;

                        if (hunger <= 0 || happiness <= 0 || health <= 0) {
                            alert('Тамагочи умер :(');
                            clearInterval(interval);
                        }

                        updatePetImage();
                        saveGame();
                    }

                    function decreaseStats() {
                        hunger -= 1;
                        happiness -= 1;
                        health -= 1;

                        if (hunger < 0) hunger = 0;
                        if (happiness < 0) happiness = 0;
                        if (health < 0) health = 0;

                        updateStats();
                    }

                    function saveGame() {
                        const gameState = { hunger, happiness, health, errors, warnings };
                        localStorage.setItem('tamagotchiState', JSON.stringify(gameState));
                    }

                    function loadGame() {
                        const savedState = localStorage.getItem('tamagotchiState');
                        if (savedState) {
                            const gameState = JSON.parse(savedState);
                            hunger = gameState.hunger;
                            happiness = gameState.happiness;
                            health = gameState.health;
                            errors = gameState.errors;
                            warnings = gameState.warnings;
                            updateStats();
                        }
                    }

                    window.onload = loadGame;

                    const interval = setInterval(() => {
                        decreaseStats();
                    }, 1000);

                    document.getElementById('feed').addEventListener('click', () => {
                        hunger += 10;
                        if (hunger > 100) hunger = 100;
                        updateStats();
                    });

                    document.getElementById('play').addEventListener('click', () => {
                        happiness += 10;
                        if (happiness > 100) happiness = 100;
                        updateStats();
                    });

                    document.getElementById('heal').addEventListener('click', () => {
                        health += 10;
                        if (health > 100) health = 100;
                        updateStats();
                    });

                    function getProblemsCount() {
                        const diagnostics = vscode.languages.getDiagnostics();
                        errors = 0;
                        warnings = 0;

                        for (let file in diagnostics) {
                            const fileDiagnostics = diagnostics[file];
                            fileDiagnostics.forEach(diagnostic => {
                                if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
                                    errors++;
                                } else if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
                                    warnings++;
                                }
                            });
                        }
                    }

                    function checkProblems() {
                        getProblemsCount();
                        updateStats();
                    }

                    vscode.workspace.onDidChangeDiagnostics(() => {
                        checkProblems();
                    });
                </script>
            </body>
            </html>
        `;
    }
}