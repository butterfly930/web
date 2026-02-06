import * as vscode from 'vscode';
import * as path from 'path';
import { DuplicatePattern } from './patternMatcher';
import { RefactoringSuggestion } from './refactoringSuggester';
import { CodeBlock } from './analyzer';

export class ResultsPanel {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Show results in a webview panel
     */
    show(data: {
        duplicates: DuplicatePattern[];
        suggestions: RefactoringSuggestion[];
        workspacePath: string;
        crossRepo?: boolean;
    }) {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'duplicateScannerResults',
                'Duplicate Scanner Results',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.webview.html = this.getResultsHtml(data);

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'openFile':
                        await this.openFileAtLine(message.filePath, message.line);
                        break;
                    case 'copySuggestion':
                        await vscode.env.clipboard.writeText(message.code);
                        vscode.window.showInformationMessage('Copied to clipboard');
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Show similar code results
     */
    showSimilarCode(selectedBlock: CodeBlock, similarBlocks: Array<CodeBlock & { similarity: number }>) {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'duplicateScannerResults',
                'Similar Code Found',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.webview.html = this.getSimilarCodeHtml(selectedBlock, similarBlocks);

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'openFile':
                        await this.openFileAtLine(message.filePath, message.line);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Show refactoring suggestions
     */
    showRefactoringSuggestions(suggestions: RefactoringSuggestion[]) {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'duplicateScannerResults',
                'Refactoring Opportunities',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }

        this.panel.webview.html = this.getRefactoringSuggestionsHtml(suggestions);

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'openFile':
                        await this.openFileAtLine(message.filePath, message.line);
                        break;
                    case 'copySuggestion':
                        await vscode.env.clipboard.writeText(message.code);
                        vscode.window.showInformationMessage('Copied to clipboard');
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Open a file at a specific line
     */
    private async openFileAtLine(filePath: string, line: number) {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            const editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.One);
            const position = new vscode.Position(Math.max(0, line - 1), 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(
                new vscode.Range(position, position),
                vscode.TextEditorRevealType.InCenter
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
    }

    /**
     * Generate HTML for results display
     */
    private getResultsHtml(data: {
        duplicates: DuplicatePattern[];
        suggestions: RefactoringSuggestion[];
        workspacePath: string;
        crossRepo?: boolean;
    }): string {
        const { duplicates, suggestions, workspacePath, crossRepo } = data;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Duplicate Scanner Results</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                    line-height: 1.6;
                }
                h1, h2, h3 {
                    color: var(--vscode-foreground);
                }
                .summary {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border-left: 4px solid var(--vscode-activityBarBadge-background);
                }
                .summary-item {
                    display: inline-block;
                    margin-right: 30px;
                }
                .duplicate-group, .suggestion-item {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .priority-high {
                    border-left: 4px solid #f14c4c;
                }
                .priority-medium {
                    border-left: 4px solid #cca700;
                }
                .priority-low {
                    border-left: 4px solid #89d185;
                }
                .code-location {
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 8px;
                    margin: 5px 0;
                    border-radius: 3px;
                    cursor: pointer;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 13px;
                }
                .code-location:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                .code-preview {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 3px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                    overflow-x: auto;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .code-preview code {
                    white-space: pre;
                }
                .badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                    font-weight: bold;
                    margin-right: 5px;
                }
                .badge-similarity {
                    background-color: var(--vscode-activityBarBadge-background);
                    color: var(--vscode-activityBarBadge-foreground);
                }
                .badge-count {
                    background-color: var(--vscode-editorInfo-foreground);
                    color: white;
                }
                .badge-savings {
                    background-color: var(--vscode-editorWarning-foreground);
                    color: white;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 14px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .tabs {
                    display: flex;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    margin-bottom: 20px;
                }
                .tab {
                    padding: 10px 20px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }
                .tab.active {
                    border-bottom-color: var(--vscode-activityBarBadge-background);
                    color: var(--vscode-activityBarBadge-background);
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
            </style>
        </head>
        <body>
            <h1>🔍 Duplicate Logic Scanner Results</h1>
            
            <div class="summary">
                <div class="summary-item">
                    <strong>Workspace:</strong> ${this.escapeHtml(workspacePath)}
                </div>
                ${crossRepo ? '<div class="summary-item"><strong>Mode:</strong> Cross-Repository</div>' : ''}
                <div class="summary-item">
                    <strong>Duplicates Found:</strong> ${duplicates.length}
                </div>
                <div class="summary-item">
                    <strong>Suggestions:</strong> ${suggestions.length}
                </div>
            </div>

            <div class="tabs">
                <div class="tab active" onclick="showTab('duplicates', this)">Duplicates (${duplicates.length})</div>
                <div class="tab" onclick="showTab('suggestions', this)">Suggestions (${suggestions.length})</div>
            </div>

            <div id="duplicates" class="tab-content active">
                <h2>Duplicate Code Patterns</h2>
                ${duplicates.length === 0 ? '<p>No duplicate patterns found.</p>' : duplicates.map((dup, idx) => `
                    <div class="duplicate-group">
                        <h3>Pattern #${idx + 1}: ${this.escapeHtml(dup.suggestedName || 'Unnamed')}</h3>
                        <div>
                            <span class="badge badge-similarity">${(dup.similarity * 100).toFixed(0)}% Similar</span>
                            <span class="badge badge-count">${dup.blocks.length} Occurrences</span>
                        </div>
                        <h4>Locations:</h4>
                        ${dup.blocks.map(block => `
                            <div class="code-location" onclick="openFile('${this.escapeHtml(block.filePath)}', ${block.startLine})">
                                📄 ${this.escapeHtml(path.basename(block.filePath))}:${block.startLine}-${block.endLine}
                                ${block.name ? ` (${this.escapeHtml(block.name)})` : ''}
                            </div>
                        `).join('')}
                        <h4>Code Preview:</h4>
                        <div class="code-preview">
                            <code>${this.escapeHtml(dup.blocks[0].code.substring(0, 500))}${dup.blocks[0].code.length > 500 ? '...' : ''}</code>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="suggestions" class="tab-content">
                <h2>Refactoring Suggestions</h2>
                ${suggestions.length === 0 ? '<p>No suggestions available.</p>' : suggestions.map((sug, idx) => `
                    <div class="suggestion-item priority-${sug.priority}">
                        <h3>${idx + 1}. ${this.escapeHtml(sug.title)}</h3>
                        <div>
                            <span class="badge badge-${sug.priority}">${sug.priority.toUpperCase()} Priority</span>
                            <span class="badge badge-savings">Save ${sug.estimatedSavings.linesOfCode} lines</span>
                        </div>
                        <p>${this.escapeHtml(sug.description).replace(/\n/g, '<br>')}</p>
                        ${sug.suggestedLocation ? `<p><strong>Suggested Location:</strong> ${this.escapeHtml(sug.suggestedLocation)}</p>` : ''}
                        ${sug.suggestedName ? `<p><strong>Suggested Name:</strong> <code>${this.escapeHtml(sug.suggestedName)}</code></p>` : ''}
                        ${sug.existingUtility ? `
                            <p><strong>Use Existing:</strong> ${this.escapeHtml(sug.existingUtility.name)}</p>
                            <p><strong>Usage:</strong> <code>${this.escapeHtml(sug.existingUtility.usage)}</code></p>
                        ` : ''}
                        ${sug.codeToExtract ? `
                            <button onclick="copyCode('${this.escapeHtml(sug.id)}')">Copy Code</button>
                            <div class="code-preview" id="${sug.id}">
                                <code>${this.escapeHtml(sug.codeToExtract.substring(0, 500))}${sug.codeToExtract.length > 500 ? '...' : ''}</code>
                            </div>
                        ` : ''}
                        <p><strong>Affected Files (${sug.affectedFiles.length}):</strong></p>
                        ${sug.affectedFiles.slice(0, 5).map(file => `
                            <div class="code-location" onclick="openFile('${this.escapeHtml(file)}', 1)">
                                📄 ${this.escapeHtml(path.basename(file))}
                            </div>
                        `).join('')}
                        ${sug.affectedFiles.length > 5 ? `<p>... and ${sug.affectedFiles.length - 5} more files</p>` : ''}
                    </div>
                `).join('')}
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function showTab(tabName, clickedElement) {
                    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    
                    if (clickedElement) {
                        clickedElement.classList.add('active');
                    }
                    document.getElementById(tabName).classList.add('active');
                }

                function openFile(filePath, line) {
                    vscode.postMessage({
                        command: 'openFile',
                        filePath: filePath,
                        line: line
                    });
                }

                function copyCode(suggestionId) {
                    const codeElement = document.getElementById(suggestionId);
                    const code = codeElement.textContent;
                    vscode.postMessage({
                        command: 'copySuggestion',
                        code: code
                    });
                }
            </script>
        </body>
        </html>`;
    }

    /**
     * Generate HTML for similar code display
     */
    private getSimilarCodeHtml(
        selectedBlock: CodeBlock,
        similarBlocks: Array<CodeBlock & { similarity: number }>
    ): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Similar Code</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .selected-block, .similar-block {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .selected-block {
                    border-left: 4px solid var(--vscode-activityBarBadge-background);
                }
                .code-preview {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 3px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                    overflow-x: auto;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .code-preview code {
                    white-space: pre;
                }
                .code-location {
                    background-color: var(--vscode-textBlockQuote-background);
                    padding: 8px;
                    margin: 5px 0;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .code-location:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                .badge-similarity {
                    background-color: var(--vscode-activityBarBadge-background);
                    color: var(--vscode-activityBarBadge-foreground);
                    padding: 3px 8px;
                    border-radius: 3px;
                    font-size: 11px;
                }
            </style>
        </head>
        <body>
            <h1>🔍 Similar Code Found</h1>
            
            <div class="selected-block">
                <h2>Selected Code</h2>
                <div class="code-location" onclick="openFile('${this.escapeHtml(selectedBlock.filePath)}', ${selectedBlock.startLine})">
                    📄 ${this.escapeHtml(path.basename(selectedBlock.filePath))}:${selectedBlock.startLine}-${selectedBlock.endLine}
                </div>
                <div class="code-preview">
                    <code>${this.escapeHtml(selectedBlock.code)}</code>
                </div>
            </div>

            <h2>Similar Code (${similarBlocks.length} found)</h2>
            ${similarBlocks.map((block, idx) => `
                <div class="similar-block">
                    <h3>Match #${idx + 1} <span class="badge-similarity">${(block.similarity * 100).toFixed(0)}% Similar</span></h3>
                    <div class="code-location" onclick="openFile('${this.escapeHtml(block.filePath)}', ${block.startLine})">
                        📄 ${this.escapeHtml(path.basename(block.filePath))}:${block.startLine}-${block.endLine}
                        ${block.name ? ` (${this.escapeHtml(block.name)})` : ''}
                    </div>
                    <div class="code-preview">
                        <code>${this.escapeHtml(block.code)}</code>
                    </div>
                </div>
            `).join('')}

            <script>
                const vscode = acquireVsCodeApi();
                
                function openFile(filePath, line) {
                    vscode.postMessage({
                        command: 'openFile',
                        filePath: filePath,
                        line: line
                    });
                }
            </script>
        </body>
        </html>`;
    }

    /**
     * Generate HTML for refactoring suggestions
     */
    private getRefactoringSuggestionsHtml(suggestions: RefactoringSuggestion[]): string {
        return this.getResultsHtml({
            duplicates: [],
            suggestions,
            workspacePath: 'Refactoring Analysis',
        });
    }

    /**
     * Escape HTML special characters
     */
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }
}
