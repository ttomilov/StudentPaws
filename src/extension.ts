import * as vscode from 'vscode';
import { CatViewProvider } from './script';

export function activate(context: vscode.ExtensionContext) {
    const provider = new CatViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('StudentPaws', provider)
    );

    vscode.languages.onDidChangeDiagnostics(() => provider.updateDiagnostics());

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => provider.typingText())
    );
}