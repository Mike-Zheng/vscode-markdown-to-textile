// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MarkdownParser } from './markdown-ast';
import { TextileGenerator } from './textile-generator';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-to-textile" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('markdown-to-textile.convertToTextile', () => {
		const editor = vscode.window.activeTextEditor;
		
		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found.');
			return;
		}
		
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		
		if (!selectedText) {
			vscode.window.showWarningMessage('Please select some text to convert.');
			return;
		}
		
		try {
			// Parse Markdown to AST
			const parser = new MarkdownParser();
			const ast = parser.parse(selectedText);
			
			// Generate Textile from AST
			const generator = new TextileGenerator();
			const textileText = generator.generate(ast);
			
			// Replace selected text with Textile
			editor.edit((editBuilder: vscode.TextEditorEdit) => {
				editBuilder.replace(selection, textileText);
			}).then((success: boolean) => {
				if (success) {
					vscode.window.showInformationMessage('Converted Markdown to Textile!');
				} else {
					vscode.window.showErrorMessage('Failed to replace text.');
				}
			});
			
		} catch (error) {
			vscode.window.showErrorMessage(`Conversion error: ${error}`);
			console.error('Conversion error:', error);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
