import * as vscode from 'vscode';
import { CodeAnalyzer } from './analyzer';
import { PatternMatcher } from './patternMatcher';
import { RefactoringSuggester } from './refactoringSuggester';
import { ResultsPanel } from './resultsPanel';

let analyzer: CodeAnalyzer;
let patternMatcher: PatternMatcher;
let refactoringSuggester: RefactoringSuggester;
let resultsPanel: ResultsPanel;

export function activate(context: vscode.ExtensionContext) {
    console.log('Duplicate Logic Scanner extension is now active');

    // Initialize components
    analyzer = new CodeAnalyzer();
    patternMatcher = new PatternMatcher();
    refactoringSuggester = new RefactoringSuggester();
    resultsPanel = new ResultsPanel(context);

    // Register commands
    const scanWorkspaceCommand = vscode.commands.registerCommand(
        'duplicate-scanner.scanWorkspace',
        async () => {
            await scanCurrentWorkspace();
        }
    );

    const scanMultipleReposCommand = vscode.commands.registerCommand(
        'duplicate-scanner.scanMultipleRepos',
        async () => {
            await scanMultipleRepositories();
        }
    );

    const findSimilarCodeCommand = vscode.commands.registerCommand(
        'duplicate-scanner.findSimilarCode',
        async () => {
            await findSimilarCodeToSelection();
        }
    );

    const suggestRefactoringCommand = vscode.commands.registerCommand(
        'duplicate-scanner.suggestRefactoring',
        async () => {
            await suggestRefactoringOpportunities();
        }
    );

    context.subscriptions.push(
        scanWorkspaceCommand,
        scanMultipleReposCommand,
        findSimilarCodeCommand,
        suggestRefactoringCommand
    );
}

async function scanCurrentWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning workspace for duplicate code...',
            cancellable: true,
        },
        async (progress, token) => {
            try {
                const config = vscode.workspace.getConfiguration('duplicateScanner');
                const workspacePath = workspaceFolders[0].uri.fsPath;

                progress.report({ increment: 10, message: 'Analyzing code structure...' });

                // Analyze code in workspace
                const codeBlocks = await analyzer.analyzeWorkspace(
                    workspacePath,
                    config.get('includePatterns', ['**/*.{js,ts,jsx,tsx}']),
                    config.get('excludePatterns', [])
                );

                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 40, message: 'Finding duplicate patterns...' });

                // Find duplicates
                const duplicates = await patternMatcher.findDuplicates(
                    codeBlocks,
                    config.get('minSimilarityThreshold', 0.8),
                    config.get('minCodeBlockSize', 5)
                );

                progress.report({ increment: 30, message: 'Generating suggestions...' });

                // Generate refactoring suggestions
                const suggestions = await refactoringSuggester.generateSuggestions(duplicates);

                progress.report({ increment: 20, message: 'Preparing results...' });

                // Show results
                resultsPanel.show({
                    duplicates,
                    suggestions,
                    workspacePath,
                });

                vscode.window.showInformationMessage(
                    `Found ${duplicates.length} duplicate pattern(s) with ${suggestions.length} refactoring suggestion(s)`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error scanning workspace: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );
}

async function scanMultipleRepositories() {
    const config = vscode.workspace.getConfiguration('duplicateScanner');
    const enableCrossRepo = config.get('enableCrossRepoScanning', false);

    if (!enableCrossRepo) {
        const answer = await vscode.window.showWarningMessage(
            'Cross-repository scanning is disabled. Enable it in settings?',
            'Enable',
            'Cancel'
        );

        if (answer === 'Enable') {
            await config.update('enableCrossRepoScanning', true, vscode.ConfigurationTarget.Global);
        } else {
            return;
        }
    }

    let repoPaths = config.get<string[]>('repositoryPaths', []);

    if (repoPaths.length === 0) {
        const answer = await vscode.window.showInformationMessage(
            'No repository paths configured. Would you like to add some?',
            'Add Paths',
            'Cancel'
        );

        if (answer === 'Add Paths') {
            const pathInput = await vscode.window.showInputBox({
                prompt: 'Enter repository paths (comma-separated)',
                placeHolder: '/path/to/repo1, /path/to/repo2',
            });

            if (pathInput) {
                repoPaths = pathInput.split(',').map(p => p.trim());
                await config.update('repositoryPaths', repoPaths, vscode.ConfigurationTarget.Global);
            } else {
                return;
            }
        } else {
            return;
        }
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Scanning multiple repositories...',
            cancellable: true,
        },
        async (progress, token) => {
            try {
                const allCodeBlocks = [];

                for (let i = 0; i < repoPaths.length; i++) {
                    if (token.isCancellationRequested) {
                        return;
                    }

                    const repoPath = repoPaths[i];
                    progress.report({
                        increment: (50 / repoPaths.length),
                        message: `Analyzing repository ${i + 1}/${repoPaths.length}: ${repoPath}`,
                    });

                    const blocks = await analyzer.analyzeWorkspace(
                        repoPath,
                        config.get('includePatterns', ['**/*.{js,ts,jsx,tsx}']),
                        config.get('excludePatterns', [])
                    );

                    allCodeBlocks.push(...blocks);
                }

                progress.report({ increment: 20, message: 'Finding cross-repository duplicates...' });

                const duplicates = await patternMatcher.findDuplicates(
                    allCodeBlocks,
                    config.get('minSimilarityThreshold', 0.8),
                    config.get('minCodeBlockSize', 5)
                );

                progress.report({ increment: 20, message: 'Generating refactoring suggestions...' });

                const suggestions = await refactoringSuggester.generateSuggestions(duplicates);

                progress.report({ increment: 10, message: 'Preparing results...' });

                resultsPanel.show({
                    duplicates,
                    suggestions,
                    workspacePath: repoPaths.join(', '),
                    crossRepo: true,
                });

                vscode.window.showInformationMessage(
                    `Cross-repo scan complete: Found ${duplicates.length} duplicate pattern(s) across ${repoPaths.length} repositories`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error scanning repositories: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );
}

async function findSimilarCodeToSelection() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText || selectedText.trim().length === 0) {
        vscode.window.showWarningMessage('Please select some code first');
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Finding similar code...',
            cancellable: false,
        },
        async (progress) => {
            try {
                const config = vscode.workspace.getConfiguration('duplicateScanner');
                const workspaceFolders = vscode.workspace.workspaceFolders;

                if (!workspaceFolders || workspaceFolders.length === 0) {
                    vscode.window.showErrorMessage('No workspace folder is open');
                    return;
                }

                progress.report({ increment: 20, message: 'Parsing selected code...' });

                const selectedBlock = await analyzer.parseCodeBlock(
                    selectedText,
                    editor.document.fileName
                );

                progress.report({ increment: 30, message: 'Scanning workspace...' });

                const allCodeBlocks = await analyzer.analyzeWorkspace(
                    workspaceFolders[0].uri.fsPath,
                    config.get('includePatterns', ['**/*.{js,ts,jsx,tsx}']),
                    config.get('excludePatterns', [])
                );

                progress.report({ increment: 30, message: 'Finding similar patterns...' });

                const similarBlocks = await patternMatcher.findSimilarTo(
                    selectedBlock,
                    allCodeBlocks,
                    config.get('minSimilarityThreshold', 0.8)
                );

                progress.report({ increment: 20, message: 'Preparing results...' });

                if (similarBlocks.length === 0) {
                    vscode.window.showInformationMessage('No similar code found');
                } else {
                    resultsPanel.showSimilarCode(selectedBlock, similarBlocks);
                    vscode.window.showInformationMessage(
                        `Found ${similarBlocks.length} similar code block(s)`
                    );
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error finding similar code: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );
}

async function suggestRefactoringOpportunities() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open');
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing refactoring opportunities...',
            cancellable: true,
        },
        async (progress, token) => {
            try {
                const config = vscode.workspace.getConfiguration('duplicateScanner');
                const workspacePath = workspaceFolders[0].uri.fsPath;

                progress.report({ increment: 20, message: 'Analyzing code patterns...' });

                const codeBlocks = await analyzer.analyzeWorkspace(
                    workspacePath,
                    config.get('includePatterns', ['**/*.{js,ts,jsx,tsx}']),
                    config.get('excludePatterns', [])
                );

                if (token.isCancellationRequested) {
                    return;
                }

                progress.report({ increment: 30, message: 'Finding duplicate patterns...' });

                const duplicates = await patternMatcher.findDuplicates(
                    codeBlocks,
                    config.get('minSimilarityThreshold', 0.8),
                    config.get('minCodeBlockSize', 5)
                );

                progress.report({ increment: 30, message: 'Identifying utility functions...' });

                // Find existing utilities that could be used
                const utilityReplacements = await refactoringSuggester.findUtilityReplacements(
                    codeBlocks
                );

                progress.report({ increment: 10, message: 'Generating suggestions...' });

                // Generate comprehensive refactoring suggestions
                const suggestions = await refactoringSuggester.generateComprehensiveSuggestions(
                    duplicates,
                    utilityReplacements
                );

                progress.report({ increment: 10, message: 'Preparing results...' });

                resultsPanel.showRefactoringSuggestions(suggestions);

                vscode.window.showInformationMessage(
                    `Found ${suggestions.length} refactoring opportunity(ies)`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error analyzing refactoring opportunities: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );
}

export function deactivate() {
    console.log('Duplicate Logic Scanner extension is now deactivated');
}
