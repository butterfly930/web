# Duplicate Logic Scanner - Usage Guide for VS Code

## Quick Start Guide

### Step 1: Install the Extension

1. **Option A: From VSIX (Recommended)**
   - Navigate to the `vscode-duplicate-scanner` directory
   - Run `npm install` to install dependencies
   - Run `npm run compile` to build
   - Run `npm run package` to create the VSIX file
   - In VS Code: Extensions → "..." menu → Install from VSIX
   - Select the generated `.vsix` file

2. **Option B: Development Mode**
   - Open the `vscode-duplicate-scanner` folder in VS Code
   - Press `F5` to launch Extension Development Host
   - The extension will be active in the new window

### Step 2: Configure Your Settings (Optional)

Open VS Code Settings (`Ctrl+,` or `Cmd+,`):

```json
{
  // Minimum similarity to detect duplicates (0.5 = 50%, 1.0 = 100%)
  "duplicateScanner.minSimilarityThreshold": 0.8,
  
  // Minimum lines of code to analyze
  "duplicateScanner.minCodeBlockSize": 5,
  
  // Files to include
  "duplicateScanner.includePatterns": [
    "**/*.js",
    "**/*.ts",
    "**/*.jsx",
    "**/*.tsx"
  ],
  
  // Files to exclude
  "duplicateScanner.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.min.js",
    "**/*.test.*",
    "**/*.spec.*"
  ],
  
  // For scanning multiple repositories
  "duplicateScanner.enableCrossRepoScanning": true,
  "duplicateScanner.repositoryPaths": [
    "/absolute/path/to/repo1",
    "/absolute/path/to/repo2"
  ]
}
```

### Step 3: Run Your First Scan

1. Open a workspace/project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: **"Duplicate Scanner: Scan Current Workspace"**
4. Wait for the analysis to complete
5. Review results in the webview panel

## Common Use Cases

### Use Case 1: Finding Duplicate Functions in Your Project

**Scenario**: You suspect there are similar functions scattered across your codebase.

**Steps**:
1. Open your project
2. Run: `Duplicate Scanner: Scan Current Workspace`
3. Switch to the "Duplicates" tab
4. Review each duplicate pattern
5. Click on file locations to navigate to the code
6. Switch to "Suggestions" tab for refactoring recommendations

**Example Output**:
```
Pattern #1: extractHandleSubmit
- 85% Similar
- 4 Occurrences
Locations:
- components/UserForm.tsx:45-62
- components/ProductForm.tsx:38-55
- components/OrderForm.tsx:52-69
- components/SettingsForm.tsx:28-45

Suggestion: Extract duplicate function found in 4 locations
Priority: HIGH
Estimated Savings: 45 lines of code
```

### Use Case 2: Finding Similar Code to What You're Writing

**Scenario**: You're writing a new function and want to check if similar logic already exists.

**Steps**:
1. Write or select your function
2. Highlight the code
3. Press `Ctrl+Shift+P`
4. Run: `Duplicate Scanner: Find Similar Code to Selection`
5. Review matches with similarity percentages
6. Consider reusing or adapting existing code

**Example**:
```javascript
// You select this code:
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Extension finds:
Match #1: 95% Similar in utils/validation.ts:12
Match #2: 87% Similar in helpers/auth.ts:45
```

### Use Case 3: Cross-Repository Duplicate Detection

**Scenario**: You maintain multiple projects and want to find shared logic that could be extracted to a library.

**Steps**:
1. Configure repository paths in settings:
   ```json
   {
     "duplicateScanner.repositoryPaths": [
       "/Users/you/projects/frontend-app",
       "/Users/you/projects/admin-panel",
       "/Users/you/projects/mobile-app"
     ],
     "duplicateScanner.enableCrossRepoScanning": true
   }
   ```

2. Run: `Duplicate Scanner: Scan Multiple Repositories`
3. Wait for cross-repo analysis (may take longer)
4. Review duplicates across all repositories
5. Identify candidates for shared library

**Benefits**:
- Find common utilities used across projects
- Identify opportunities for creating shared packages
- Reduce maintenance burden by centralizing logic

### Use Case 4: Identifying Opportunities to Use Existing Utilities

**Scenario**: Team members write custom implementations that could use standard libraries.

**Steps**:
1. Run: `Duplicate Scanner: Suggest Refactoring Opportunities`
2. Review "Use Existing Utility" suggestions
3. Check suggestions for:
   - Array method alternatives to for-loops
   - Native API replacements for custom code
   - Library function alternatives (lodash, etc.)

**Example Suggestions**:
```
1. Replace custom implementation with Array.filter
   - Found 3 locations using for-loops with if statements
   - Use Array.filter for cleaner, more readable code

2. Replace JSON.parse(JSON.stringify()) with structuredClone
   - Found 5 locations using this deep clone pattern
   - Use modern structuredClone API or lodash.cloneDeep

3. Replace manual debounce with lodash.debounce
   - Found 2 custom debounce implementations
   - Use battle-tested lodash implementation
```

## Advanced Workflows

### Workflow 1: Code Review Assistant

Use the scanner during code reviews:

1. Checkout the PR branch
2. Run scan on changed files
3. Check if new code duplicates existing logic
4. Suggest refactoring before merging

### Workflow 2: Refactoring Sprint

Dedicate time to reducing technical debt:

1. Run full workspace scan
2. Export/note all high-priority suggestions
3. Create refactoring tasks for each suggestion
4. Address incrementally, starting with highest savings
5. Re-scan after refactoring to measure improvement

### Workflow 3: New Developer Onboarding

Help new team members understand the codebase:

1. Scan the codebase
2. Review duplicate patterns together
3. Discuss why duplicates exist
4. Plan refactoring as learning exercise
5. Use as example of what to avoid in new code

### Workflow 4: Library Extraction Planning

Identify code to extract into shared libraries:

1. Enable cross-repo scanning
2. Scan all related projects
3. Filter for patterns appearing in 3+ repos
4. Prioritize by:
   - Frequency of use
   - Complexity
   - Stability (low change rate)
5. Create shared package with extracted code

## Interpreting Results

### Understanding Similarity Percentages

- **90-100%**: Nearly identical code, definitely should be refactored
- **80-89%**: Very similar, strong candidate for extraction
- **70-79%**: Similar structure, consider if worth refactoring
- **60-69%**: Some similarities, may have shared concepts
- **50-59%**: Minor similarities, probably not worth refactoring

### Priority Levels

- **HIGH**: 
  - 50+ lines saved OR
  - 5+ duplicate locations
  - Address these first for maximum impact

- **MEDIUM**: 
  - 20-50 lines saved
  - 3-5 duplicate locations
  - Good candidates after high-priority items

- **LOW**: 
  - <20 lines saved
  - 2-3 duplicate locations
  - Consider if easy to refactor

### Suggestion Types

1. **Extract Function**: Pull duplicate logic into a shared function
2. **Extract Class**: Create a base class or shared class
3. **Use Existing Utility**: Replace with library or built-in
4. **Extend Class**: Inherit instead of duplicate
5. **Merge Similar**: Parameterize similar code blocks

## Best Practices

### DO:
✅ Start with high-priority suggestions
✅ Review suggestions critically - not all are appropriate
✅ Test thoroughly after refactoring
✅ Update documentation when extracting shared code
✅ Consider naming conventions for extracted utilities
✅ Run scans regularly (weekly/monthly)
✅ Use lower thresholds for exploratory analysis

### DON'T:
❌ Blindly apply all suggestions
❌ Over-abstract code (YAGNI principle)
❌ Create complex abstractions for 2-3 occurrences
❌ Ignore context differences between similar code
❌ Forget to update tests after refactoring
❌ Rush refactoring in critical paths

## Troubleshooting Common Issues

### Issue: "No duplicates found" but you know there are some

**Solutions**:
- Lower `minSimilarityThreshold` (try 0.6 or 0.7)
- Check `includePatterns` - ensure your files are included
- Reduce `minCodeBlockSize` (try 3)
- Check if files are being excluded by `excludePatterns`

### Issue: Too many false positives

**Solutions**:
- Increase `minSimilarityThreshold` (try 0.85 or 0.9)
- Increase `minCodeBlockSize` to ignore small blocks
- Add specific patterns to `excludePatterns`

### Issue: Scan is too slow

**Solutions**:
- Exclude more directories (especially vendor code)
- Increase `minCodeBlockSize` to reduce processing
- Scan specific subdirectories instead of entire workspace
- Close unnecessary files/folders in workspace

### Issue: Parse errors for certain files

**Solutions**:
- Ensure files are valid JavaScript/TypeScript
- Check for unsupported syntax
- Add problematic files to `excludePatterns`
- Check Output panel for specific error messages

## Tips for Maximum Value

1. **Regular Scanning**: Schedule regular scans (e.g., monthly)
2. **Team Reviews**: Review results as a team to build consensus
3. **Metrics Tracking**: Track lines saved, duplicates reduced over time
4. **Learning Tool**: Use as educational tool for junior developers
5. **Pre-Commit Checks**: Scan new code before committing
6. **Documentation**: Document decisions about why some duplicates remain
7. **Incremental Approach**: Don't try to fix everything at once
8. **Celebrate Wins**: Track and celebrate reduction in code duplication

## Example Results Interpretation

### Good Refactoring Candidate:
```
Pattern: validateUserInput
Similarity: 92%
Locations: 6 files
Lines to Save: 85
Complexity: Medium

✅ REFACTOR - High impact, clear pattern
```

### Questionable Candidate:
```
Pattern: renderModal
Similarity: 65%
Locations: 3 files
Lines to Save: 15
Context: Different modal types with unique behavior

⚠️ REVIEW - Low similarity, context-specific, small savings
```

### Poor Candidate:
```
Pattern: handleClick
Similarity: 55%
Locations: 2 files
Lines to Save: 8
Context: Different click handlers for different purposes

❌ SKIP - Too context-specific, minimal benefit
```

## Integration with Development Workflow

### In VS Code:
- **Before writing new code**: Search for similar existing code
- **During code review**: Scan PR changes for duplicates
- **Refactoring sessions**: Use suggestions as task list
- **Sprint planning**: Estimate refactoring work from results

### In CI/CD:
- Could be extended to fail builds with too many duplicates
- Generate reports for tracking technical debt
- Alert on new duplicate patterns introduced

## Next Steps

After using the extension:

1. **Share Results**: Present findings to your team
2. **Create Tasks**: Add high-priority refactoring to backlog
3. **Document Patterns**: Record common patterns to avoid
4. **Establish Guidelines**: Create team coding standards
5. **Regular Reviews**: Make scanning part of your process

---

**Need Help?**

- Check the README.md for detailed feature documentation
- Review the code examples in the extension
- Open an issue for bugs or feature requests
- Share your success stories and use cases!

Happy scanning! 🚀
