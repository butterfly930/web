import leven from 'leven';
import { CodeBlock } from './analyzer';

export interface DuplicatePattern {
    id: string;
    blocks: CodeBlock[];
    similarity: number;
    suggestedName?: string;
}

export class PatternMatcher {
    /**
     * Find duplicate patterns in code blocks
     */
    async findDuplicates(
        codeBlocks: CodeBlock[],
        minSimilarityThreshold: number,
        minCodeBlockSize: number
    ): Promise<DuplicatePattern[]> {
        const duplicates: DuplicatePattern[] = [];
        const processedBlocks = new Set<string>();

        // Filter out blocks that are too small
        const validBlocks = codeBlocks.filter(
            block => block.code.split('\n').length >= minCodeBlockSize
        );

        // Compare each block with every other block
        for (let i = 0; i < validBlocks.length; i++) {
            if (processedBlocks.has(validBlocks[i].id)) {
                continue;
            }

            const similarBlocks: CodeBlock[] = [validBlocks[i]];
            processedBlocks.add(validBlocks[i].id);

            for (let j = i + 1; j < validBlocks.length; j++) {
                if (processedBlocks.has(validBlocks[j].id)) {
                    continue;
                }

                const similarity = this.calculateSimilarity(validBlocks[i], validBlocks[j]);

                if (similarity >= minSimilarityThreshold) {
                    similarBlocks.push(validBlocks[j]);
                    processedBlocks.add(validBlocks[j].id);
                }
            }

            // Only create duplicate pattern if we found at least 2 similar blocks
            if (similarBlocks.length >= 2) {
                const avgSimilarity =
                    similarBlocks.reduce((sum, _, idx) => {
                        if (idx === 0) return 0;
                        return sum + this.calculateSimilarity(similarBlocks[0], similarBlocks[idx]);
                    }, 0) / (similarBlocks.length - 1);

                duplicates.push({
                    id: `dup_${duplicates.length}`,
                    blocks: similarBlocks,
                    similarity: avgSimilarity,
                    suggestedName: this.generateSuggestedName(similarBlocks[0]),
                });
            }
        }

        // Sort by number of duplicates (descending)
        duplicates.sort((a, b) => b.blocks.length - a.blocks.length);

        return duplicates;
    }

    /**
     * Find code blocks similar to a given block
     */
    async findSimilarTo(
        targetBlock: CodeBlock,
        codeBlocks: CodeBlock[],
        minSimilarityThreshold: number
    ): Promise<Array<CodeBlock & { similarity: number }>> {
        const similarBlocks: Array<CodeBlock & { similarity: number }> = [];

        for (const block of codeBlocks) {
            // Skip if it's the same block
            if (block.filePath === targetBlock.filePath && block.startLine === targetBlock.startLine) {
                continue;
            }

            const similarity = this.calculateSimilarity(targetBlock, block);

            if (similarity >= minSimilarityThreshold) {
                similarBlocks.push({
                    ...block,
                    similarity,
                });
            }
        }

        // Sort by similarity (descending)
        similarBlocks.sort((a, b) => b.similarity - a.similarity);

        return similarBlocks;
    }

    /**
     * Calculate similarity between two code blocks
     */
    private calculateSimilarity(block1: CodeBlock, block2: CodeBlock): number {
        // Quick check: if hashes are identical, return 1.0
        if (block1.hash === block2.hash) {
            return 1.0;
        }

        // If types are different, apply a penalty
        const typePenalty = block1.type === block2.type ? 1.0 : 0.9;

        // Structural similarity using normalized code
        const normalized1 = this.normalizeCode(block1.code);
        const normalized2 = this.normalizeCode(block2.code);

        // Use Levenshtein distance for similarity
        const maxLength = Math.max(normalized1.length, normalized2.length);
        if (maxLength === 0) {
            return 0;
        }

        const distance = leven(normalized1, normalized2);
        const structuralSimilarity = 1 - distance / maxLength;

        // Token-based similarity
        const tokens1 = this.tokenize(normalized1);
        const tokens2 = this.tokenize(normalized2);
        const tokenSimilarity = this.calculateTokenSimilarity(tokens1, tokens2);

        // Parameter similarity (if applicable)
        let parameterSimilarity = 1.0;
        if (block1.parameters && block2.parameters) {
            const maxParams = Math.max(block1.parameters.length, block2.parameters.length);
            if (maxParams > 0) {
                const minParams = Math.min(block1.parameters.length, block2.parameters.length);
                parameterSimilarity = minParams / maxParams;
            }
        }

        // Complexity similarity
        const complexityDiff = Math.abs(block1.complexity - block2.complexity);
        const maxComplexity = Math.max(block1.complexity, block2.complexity);
        const complexitySimilarity = maxComplexity > 0 ? 1 - complexityDiff / maxComplexity : 1.0;

        // Weighted average of different similarity metrics
        const similarity =
            structuralSimilarity * 0.4 +
            tokenSimilarity * 0.3 +
            parameterSimilarity * 0.15 +
            complexitySimilarity * 0.15;

        return similarity * typePenalty;
    }

    /**
     * Normalize code for comparison
     */
    private normalizeCode(code: string): string {
        return code
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comments
            .replace(/["']([^"'\\]|\\.)*["']/g, '""') // Normalize strings
            .replace(/\b\d+\b/g, '0') // Normalize numbers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[{}();,]/g, match => ` ${match} `) // Add spaces around delimiters
            .trim()
            .toLowerCase();
    }

    /**
     * Tokenize code into meaningful tokens
     */
    private tokenize(code: string): string[] {
        return code
            .split(/\s+/)
            .filter(token => token.length > 0 && token !== ' ');
    }

    /**
     * Calculate token-based similarity
     */
    private calculateTokenSimilarity(tokens1: string[], tokens2: string[]): number {
        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        if (union.size === 0) {
            return 0;
        }

        // Jaccard similarity
        return intersection.size / union.size;
    }

    /**
     * Generate a suggested name for extracted common code
     */
    private generateSuggestedName(block: CodeBlock): string {
        if (block.name) {
            return `extract${this.capitalize(block.name)}`;
        }

        // Try to extract a meaningful name from the code
        const lines = block.code.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length > 0) {
            // Look for variable assignments or return statements
            const firstLine = lines[0].trim();
            
            // Check for function calls or operations
            const match = firstLine.match(/\b(get|set|create|update|delete|fetch|load|save|calculate|compute|validate|check|handle|process)\w+/i);
            if (match) {
                return `extract${this.capitalize(match[0])}`;
            }
        }

        // Default name based on type
        switch (block.type) {
            case 'function':
            case 'arrow-function':
                return 'extractCommonFunction';
            case 'class':
                return 'ExtractedClass';
            case 'method':
                return 'extractCommonMethod';
            default:
                return 'extractCommonLogic';
        }
    }

    /**
     * Capitalize first letter
     */
    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
