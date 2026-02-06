import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import fg from 'fast-glob';

export interface CodeBlock {
    id: string;
    filePath: string;
    startLine: number;
    endLine: number;
    code: string;
    type: 'function' | 'class' | 'method' | 'arrow-function' | 'block';
    name?: string;
    parameters?: string[];
    hash: string;
    ast?: any;
    complexity: number;
}

export class CodeAnalyzer {
    private idCounter = 0;

    /**
     * Analyze an entire workspace and extract code blocks
     */
    async analyzeWorkspace(
        workspacePath: string,
        includePatterns: string[],
        excludePatterns: string[]
    ): Promise<CodeBlock[]> {
        const files = await this.findFiles(workspacePath, includePatterns, excludePatterns);
        const allCodeBlocks: CodeBlock[] = [];

        for (const file of files) {
            try {
                const blocks = await this.analyzeFile(file);
                allCodeBlocks.push(...blocks);
            } catch (error) {
                console.error(`Error analyzing file ${file}:`, error);
                // Continue with other files
            }
        }

        return allCodeBlocks;
    }

    /**
     * Find all files matching the patterns
     */
    private async findFiles(
        workspacePath: string,
        includePatterns: string[],
        excludePatterns: string[]
    ): Promise<string[]> {
        const files = await fg(includePatterns, {
            cwd: workspacePath,
            ignore: excludePatterns,
            absolute: true,
            onlyFiles: true,
        });

        return files;
    }

    /**
     * Analyze a single file and extract code blocks
     */
    async analyzeFile(filePath: string): Promise<CodeBlock[]> {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const blocks: CodeBlock[] = [];

        try {
            const ast = parse(content, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread',
                    'asyncGenerators',
                    'dynamicImport',
                    'optionalChaining',
                    'nullishCoalescingOperator',
                ],
            });

            traverse(ast, {
                FunctionDeclaration: (path) => {
                    blocks.push(this.extractFunctionBlock(path, filePath, content, 'function'));
                },
                ArrowFunctionExpression: (path) => {
                    // Only capture arrow functions that are assigned to variables or exported
                    if (
                        path.parent.type === 'VariableDeclarator' ||
                        path.parent.type === 'ExportDefaultDeclaration'
                    ) {
                        blocks.push(this.extractFunctionBlock(path, filePath, content, 'arrow-function'));
                    }
                },
                ClassDeclaration: (path) => {
                    blocks.push(this.extractClassBlock(path, filePath, content));
                },
                ClassMethod: (path) => {
                    blocks.push(this.extractMethodBlock(path, filePath, content));
                },
            });
        } catch (error) {
            console.error(`Error parsing file ${filePath}:`, error);
            throw error;
        }

        return blocks;
    }

    /**
     * Parse a single code block (for user selection)
     */
    async parseCodeBlock(code: string, filePath: string): Promise<CodeBlock> {
        try {
            const ast = parse(code, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy',
                    'classProperties',
                    'objectRestSpread',
                    'asyncGenerators',
                    'dynamicImport',
                    'optionalChaining',
                    'nullishCoalescingOperator',
                ],
            });

            return {
                id: this.generateId(),
                filePath,
                startLine: 1,
                endLine: code.split('\n').length,
                code: code.trim(),
                type: 'block',
                hash: this.computeHash(code),
                ast,
                complexity: this.computeComplexity(ast),
            };
        } catch (error) {
            throw new Error(`Failed to parse code block: ${error}`);
        }
    }

    /**
     * Extract a function block from AST
     */
    private extractFunctionBlock(
        path: any,
        filePath: string,
        sourceCode: string,
        type: 'function' | 'arrow-function'
    ): CodeBlock {
        const node = path.node;
        const startLine = node.loc?.start.line || 0;
        const endLine = node.loc?.end.line || 0;

        const lines = sourceCode.split('\n');
        const code = lines.slice(startLine - 1, endLine).join('\n');

        const name =
            type === 'function' && node.id
                ? node.id.name
                : path.parent.type === 'VariableDeclarator' && path.parent.id
                ? path.parent.id.name
                : undefined;

        const parameters =
            node.params?.map((param: any) => {
                if (t.isIdentifier(param)) {
                    return param.name;
                } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                    return param.left.name;
                }
                return 'param';
            }) || [];

        return {
            id: this.generateId(),
            filePath,
            startLine,
            endLine,
            code: code.trim(),
            type,
            name,
            parameters,
            hash: this.computeHash(code),
            ast: node,
            complexity: this.computeComplexity(node),
        };
    }

    /**
     * Extract a class block from AST
     */
    private extractClassBlock(path: any, filePath: string, sourceCode: string): CodeBlock {
        const node = path.node;
        const startLine = node.loc?.start.line || 0;
        const endLine = node.loc?.end.line || 0;

        const lines = sourceCode.split('\n');
        const code = lines.slice(startLine - 1, endLine).join('\n');

        const name = node.id ? node.id.name : 'AnonymousClass';

        return {
            id: this.generateId(),
            filePath,
            startLine,
            endLine,
            code: code.trim(),
            type: 'class',
            name,
            hash: this.computeHash(code),
            ast: node,
            complexity: this.computeComplexity(node),
        };
    }

    /**
     * Extract a method block from AST
     */
    private extractMethodBlock(path: any, filePath: string, sourceCode: string): CodeBlock {
        const node = path.node;
        const startLine = node.loc?.start.line || 0;
        const endLine = node.loc?.end.line || 0;

        const lines = sourceCode.split('\n');
        const code = lines.slice(startLine - 1, endLine).join('\n');

        const name = node.key && t.isIdentifier(node.key) ? node.key.name : 'method';

        const parameters =
            node.params?.map((param: any) => {
                if (t.isIdentifier(param)) {
                    return param.name;
                } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                    return param.left.name;
                }
                return 'param';
            }) || [];

        return {
            id: this.generateId(),
            filePath,
            startLine,
            endLine,
            code: code.trim(),
            type: 'method',
            name,
            parameters,
            hash: this.computeHash(code),
            ast: node,
            complexity: this.computeComplexity(node),
        };
    }

    /**
     * Compute a simple hash for code comparison
     */
    private computeHash(code: string): string {
        // Normalize code by removing whitespace and comments for hashing
        const normalized = code
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Simple hash function
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /**
     * Compute cyclomatic complexity of code
     */
    private computeComplexity(node: any): number {
        let complexity = 1;

        const visitor = {
            IfStatement: () => complexity++,
            SwitchCase: () => complexity++,
            ForStatement: () => complexity++,
            ForInStatement: () => complexity++,
            ForOfStatement: () => complexity++,
            WhileStatement: () => complexity++,
            DoWhileStatement: () => complexity++,
            CatchClause: () => complexity++,
            ConditionalExpression: () => complexity++,
            LogicalExpression: (path: any) => {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    complexity++;
                }
            },
        };

        traverse(node, visitor, undefined, { node });

        return complexity;
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `block_${this.idCounter++}`;
    }
}
