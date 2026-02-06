import * as path from 'path';
import { CodeBlock } from './analyzer';
import { DuplicatePattern } from './patternMatcher';

export interface RefactoringSuggestion {
    id: string;
    type: 'extract-function' | 'extract-class' | 'use-existing-utility' | 'extend-class' | 'merge-similar';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedFiles: string[];
    suggestedLocation?: string;
    suggestedName?: string;
    codeToExtract?: string;
    existingUtility?: {
        name: string;
        location: string;
        usage: string;
    };
    estimatedSavings: {
        linesOfCode: number;
        duplicateCount: number;
    };
}

export interface UtilityReplacement {
    codeBlock: CodeBlock;
    utilityName: string;
    utilityPath: string;
    confidence: number;
}

export class RefactoringSuggester {
    private commonUtilityPatterns = [
        { pattern: /\.map\(.*=>.*\)\.filter\(.*=>.*\)/g, utility: 'lodash/fp', suggestion: 'Use lodash/fp flow or compose' },
        { pattern: /for\s*\(.*\)\s*{[^}]*if\s*\(/g, utility: 'Array.filter', suggestion: 'Use Array.filter instead of for-loop with if' },
        { pattern: /let\s+\w+\s*=\s*\[\];.*\.push\(/gs, utility: 'Array.map', suggestion: 'Use Array.map instead of push in loop' },
        { pattern: /JSON\.parse\(.*JSON\.stringify/g, utility: 'structuredClone or lodash.cloneDeep', suggestion: 'Use structuredClone or lodash.cloneDeep for deep cloning' },
        { pattern: /new\s+Date\(\)\.getTime\(\)/g, utility: 'Date.now()', suggestion: 'Use Date.now() instead of new Date().getTime()' },
        { pattern: /\w+\s*\?\s*\w+\s*:\s*['"]['"]|null|undefined/g, utility: 'nullish coalescing (??)', suggestion: 'Use nullish coalescing operator (??)' },
    ];

    /**
     * Generate refactoring suggestions from duplicate patterns
     */
    async generateSuggestions(duplicates: DuplicatePattern[]): Promise<RefactoringSuggestion[]> {
        const suggestions: RefactoringSuggestion[] = [];

        for (const duplicate of duplicates) {
            const suggestion = this.createSuggestionFromDuplicate(duplicate);
            suggestions.push(suggestion);
        }

        return suggestions;
    }

    /**
     * Find existing utilities that could replace code blocks
     */
    async findUtilityReplacements(codeBlocks: CodeBlock[]): Promise<UtilityReplacement[]> {
        const replacements: UtilityReplacement[] = [];

        for (const block of codeBlocks) {
            for (const pattern of this.commonUtilityPatterns) {
                if (pattern.pattern.test(block.code)) {
                    replacements.push({
                        codeBlock: block,
                        utilityName: pattern.utility,
                        utilityPath: pattern.suggestion,
                        confidence: 0.8,
                    });
                }
            }
        }

        return replacements;
    }

    /**
     * Generate comprehensive suggestions including utility replacements
     */
    async generateComprehensiveSuggestions(
        duplicates: DuplicatePattern[],
        utilityReplacements: UtilityReplacement[]
    ): Promise<RefactoringSuggestion[]> {
        const suggestions: RefactoringSuggestion[] = [];

        // Add duplicate refactoring suggestions
        for (const duplicate of duplicates) {
            suggestions.push(this.createSuggestionFromDuplicate(duplicate));
        }

        // Add utility replacement suggestions
        const utilityGroups = this.groupUtilityReplacements(utilityReplacements);
        for (const [utilityName, replacements] of utilityGroups.entries()) {
            suggestions.push(this.createUtilityReplacementSuggestion(utilityName, replacements));
        }

        // Sort by priority and savings
        suggestions.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            return b.estimatedSavings.linesOfCode - a.estimatedSavings.linesOfCode;
        });

        return suggestions;
    }

    /**
     * Create a refactoring suggestion from a duplicate pattern
     */
    private createSuggestionFromDuplicate(duplicate: DuplicatePattern): RefactoringSuggestion {
        const firstBlock = duplicate.blocks[0];
        const affectedFiles = [...new Set(duplicate.blocks.map(b => b.filePath))];
        const totalLines = duplicate.blocks.reduce((sum, b) => sum + b.code.split('\n').length, 0);
        const extractedLines = firstBlock.code.split('\n').length;
        const savedLines = totalLines - extractedLines - duplicate.blocks.length * 2; // Subtract call overhead

        // Determine suggestion type
        let type: RefactoringSuggestion['type'] = 'extract-function';
        if (firstBlock.type === 'class') {
            type = 'extract-class';
        } else if (duplicate.blocks.length > 5) {
            type = 'extract-function';
        } else if (this.shouldMergeSimilar(duplicate)) {
            type = 'merge-similar';
        }

        // Determine priority based on savings and complexity
        let priority: RefactoringSuggestion['priority'] = 'medium';
        if (savedLines > 50 || duplicate.blocks.length > 5) {
            priority = 'high';
        } else if (savedLines < 20 && duplicate.blocks.length < 3) {
            priority = 'low';
        }

        // Generate suggested location
        const suggestedLocation = this.suggestExtractionLocation(duplicate.blocks);

        const description = this.generateDescription(duplicate, type);

        return {
            id: `suggestion_${duplicate.id}`,
            type,
            priority,
            title: `Extract duplicate ${firstBlock.type} found in ${duplicate.blocks.length} locations`,
            description,
            affectedFiles,
            suggestedLocation,
            suggestedName: duplicate.suggestedName || 'extractedFunction',
            codeToExtract: firstBlock.code,
            estimatedSavings: {
                linesOfCode: savedLines,
                duplicateCount: duplicate.blocks.length,
            },
        };
    }

    /**
     * Create a utility replacement suggestion
     */
    private createUtilityReplacementSuggestion(
        utilityName: string,
        replacements: UtilityReplacement[]
    ): RefactoringSuggestion {
        const affectedFiles = [...new Set(replacements.map(r => r.codeBlock.filePath))];
        const totalLines = replacements.reduce(
            (sum, r) => sum + r.codeBlock.code.split('\n').length,
            0
        );

        return {
            id: `utility_${utilityName.replace(/[^a-zA-Z0-9]/g, '_')}`,
            type: 'use-existing-utility',
            priority: totalLines > 30 ? 'high' : 'medium',
            title: `Replace custom implementation with ${utilityName}`,
            description: `Found ${replacements.length} location(s) where code could be replaced with the existing utility "${utilityName}". This would simplify the code and improve maintainability.`,
            affectedFiles,
            existingUtility: {
                name: utilityName,
                location: replacements[0].utilityPath,
                usage: replacements[0].utilityPath,
            },
            estimatedSavings: {
                linesOfCode: Math.floor(totalLines * 0.6), // Estimate 60% reduction
                duplicateCount: replacements.length,
            },
        };
    }

    /**
     * Group utility replacements by utility name
     */
    private groupUtilityReplacements(
        replacements: UtilityReplacement[]
    ): Map<string, UtilityReplacement[]> {
        const groups = new Map<string, UtilityReplacement[]>();

        for (const replacement of replacements) {
            const existing = groups.get(replacement.utilityName) || [];
            existing.push(replacement);
            groups.set(replacement.utilityName, existing);
        }

        return groups;
    }

    /**
     * Determine if similar blocks should be merged
     */
    private shouldMergeSimilar(duplicate: DuplicatePattern): boolean {
        // If all blocks are in the same file, suggest merging
        const files = new Set(duplicate.blocks.map(b => b.filePath));
        return files.size === 1 && duplicate.blocks.length <= 3;
    }

    /**
     * Suggest a location for extracting common code
     */
    private suggestExtractionLocation(blocks: CodeBlock[]): string {
        // Find the most common directory
        const directories = blocks.map(b => path.dirname(b.filePath));
        const dirCounts = new Map<string, number>();

        for (const dir of directories) {
            dirCounts.set(dir, (dirCounts.get(dir) || 0) + 1);
        }

        let mostCommonDir = directories[0];
        let maxCount = 0;

        for (const [dir, count] of dirCounts.entries()) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonDir = dir;
            }
        }

        // Suggest creating a utils or helpers directory
        const parentDir = path.dirname(mostCommonDir);
        
        // Check if there's a common pattern (components, utils, lib, etc.)
        if (mostCommonDir.includes('components')) {
            return path.join(parentDir, 'components', 'utils');
        } else if (mostCommonDir.includes('pages') || mostCommonDir.includes('Pages')) {
            return path.join(parentDir, 'utils');
        } else {
            return path.join(mostCommonDir, 'utils');
        }
    }

    /**
     * Generate a descriptive explanation for the suggestion
     */
    private generateDescription(duplicate: DuplicatePattern, type: RefactoringSuggestion['type']): string {
        const firstBlock = duplicate.blocks[0];
        const locations = duplicate.blocks.map(b => {
            const fileName = path.basename(b.filePath);
            return `${fileName}:${b.startLine}`;
        }).join(', ');

        switch (type) {
            case 'extract-function':
                return `This ${firstBlock.type} appears ${duplicate.blocks.length} times with ${(duplicate.similarity * 100).toFixed(0)}% similarity. Consider extracting it into a shared utility function.\n\nLocations: ${locations}\n\nBenefits:\n- Reduces code duplication\n- Centralizes logic for easier maintenance\n- Makes testing more straightforward`;

            case 'extract-class':
                return `This class structure is duplicated ${duplicate.blocks.length} times. Consider creating a base class or shared implementation.\n\nLocations: ${locations}\n\nBenefits:\n- Single source of truth for shared behavior\n- Easier to extend and maintain\n- Reduces risk of inconsistent implementations`;

            case 'merge-similar':
                return `These ${duplicate.blocks.length} similar code blocks in the same file could be merged with parameters.\n\nLocations: ${locations}\n\nBenefits:\n- Simplifies the code structure\n- Reduces file size\n- Easier to understand and maintain`;

            case 'extend-class':
                return `Consider extending an existing class instead of duplicating functionality.\n\nLocations: ${locations}`;

            case 'use-existing-utility':
                return `This code pattern could be replaced with an existing utility or library function.`;

            default:
                return `Found duplicate code pattern across ${duplicate.blocks.length} locations.`;
        }
    }
}
