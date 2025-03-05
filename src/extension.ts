import * as vscode from 'vscode';
import { TamagotchiViewProvider } from './script';

export function activate(context: vscode.ExtensionContext) {
    const provider = new TamagotchiViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('tamagotchiView', provider)
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => provider.typingText())
    );
}