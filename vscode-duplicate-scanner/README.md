# Duplicate Logic Scanner for VS Code

A powerful VS Code extension that scans multiple repositories for duplicated logic patterns, identifies similar functions/classes across different codebases, and suggests refactoring opportunities.

## Features

### 🔍 **Comprehensive Code Analysis**
- Scans JavaScript, TypeScript, JSX, and TSX files
- Uses AST (Abstract Syntax Tree) parsing for accurate code structure analysis
- Detects functions, classes, methods, and arrow functions

### 🎯 **Duplicate Detection**
- Identifies similar code patterns across files and repositories
- Configurable similarity threshold (50%-100%)
- Smart normalization to detect semantic duplicates, not just exact matches
- Considers code structure, tokens, parameters, and complexity

### 📊 **Cross-Repository Scanning**
- Scan multiple repositories simultaneously
- Compare code across different projects
- Find reusable patterns across your entire codebase

### 💡 **Intelligent Suggestions**
- **Extract Function**: Suggests extracting duplicate logic into shared utilities
- **Extract Class**: Recommends creating base classes for similar implementations
- **Use Existing Utility**: Detects code that could use existing libraries (lodash, native APIs)
- **Extend Class**: Suggests extending existing classes instead of duplicating
- **Merge Similar**: Identifies similar code blocks that could be parameterized

### 📈 **Refactoring Insights**
- Estimated lines of code savings
- Priority ranking (High/Medium/Low)
- Suggested extraction locations
- Recommended function/class names
- Impact analysis showing affected files

## Installation

### From VSIX Package
1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to launch a new VS Code window with the extension loaded

## Usage

### Command Palette Commands

#### 1. **Duplicate Scanner: Scan Current Workspace**
Scans the currently open workspace for duplicate code patterns.

```
Ctrl+Shift+P (Cmd+Shift+P on Mac) → "Duplicate Scanner: Scan Current Workspace"
```

#### 2. **Duplicate Scanner: Scan Multiple Repositories**
Scans multiple repositories configured in settings.

```
Ctrl+Shift+P → "Duplicate Scanner: Scan Multiple Repositories"
```

#### 3. **Duplicate Scanner: Find Similar Code to Selection**
Finds code similar to your current selection.

```
1. Select code in editor
2. Ctrl+Shift+P → "Duplicate Scanner: Find Similar Code to Selection"
```

#### 4. **Duplicate Scanner: Suggest Refactoring Opportunities**
Analyzes code for comprehensive refactoring opportunities including utility replacements.

```
Ctrl+Shift+P → "Duplicate Scanner: Suggest Refactoring Opportunities"
```

## Configuration

Access settings via: `File > Preferences > Settings` → Search for "Duplicate Scanner"

### Available Settings

#### `duplicateScanner.minSimilarityThreshold`
- **Type**: Number (0.5 - 1.0)
- **Default**: 0.8
- **Description**: Minimum similarity threshold for detecting duplicate code. Higher values require more similarity.

#### `duplicateScanner.minCodeBlockSize`
- **Type**: Number (minimum 3)
- **Default**: 5
- **Description**: Minimum number of lines for a code block to be considered for analysis.

#### `duplicateScanner.includePatterns`
- **Type**: Array of strings
- **Default**: `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`
- **Description**: Glob patterns for files to include in scanning.

#### `duplicateScanner.excludePatterns`
- **Type**: Array of strings
- **Default**: 
  ```json
  [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.min.js",
    "**/*.test.*",
    "**/*.spec.*"
  ]
  ```
- **Description**: Glob patterns for files to exclude from scanning.

#### `duplicateScanner.enableCrossRepoScanning`
- **Type**: Boolean
- **Default**: false
- **Description**: Enable scanning across multiple repositories.

#### `duplicateScanner.repositoryPaths`
- **Type**: Array of strings
- **Default**: []
- **Description**: List of absolute paths to repositories for cross-repository scanning.
- **Example**: 
  ```json
  [
    "/Users/username/projects/repo1",
    "/Users/username/projects/repo2",
    "/Users/username/projects/repo3"
  ]
  ```

## Example Workflow

### 1. Quick Scan of Current Project

```
1. Open your project in VS Code
2. Press Ctrl+Shift+P
3. Type "Duplicate Scanner: Scan Current Workspace"
4. Wait for analysis to complete
5. Review results in the webview panel
```

### 2. Finding Similar Code

```
1. Select a function or code block
2. Press Ctrl+Shift+P
3. Type "Duplicate Scanner: Find Similar Code"
4. Click on any match to navigate to that location
```

### 3. Cross-Repository Analysis

```
1. Configure repository paths in settings:
   - Open Settings (Ctrl+,)
   - Search "duplicateScanner.repositoryPaths"
   - Add paths to your repositories
   
2. Enable cross-repo scanning:
   - Set "duplicateScanner.enableCrossRepoScanning" to true
   
3. Run scan:
   - Press Ctrl+Shift+P
   - Type "Duplicate Scanner: Scan Multiple Repositories"
   
4. Review duplicates across all repositories
```

## Results Panel

The extension displays results in an interactive webview with two tabs:

### Duplicates Tab
- Shows all detected duplicate patterns
- Displays similarity percentage
- Lists all occurrences with file locations
- Provides code preview
- Click locations to navigate to code

### Suggestions Tab
- Prioritized refactoring suggestions
- Estimated lines of code savings
- Suggested extraction locations and names
- Affected files list
- One-click code copying
- Recommendations for using existing utilities

## How It Works

1. **AST Parsing**: Uses Babel parser to create Abstract Syntax Trees
2. **Code Block Extraction**: Identifies functions, classes, and methods
3. **Normalization**: Removes comments, normalizes whitespace, and extracts structure
4. **Similarity Calculation**: Uses multiple metrics:
   - Structural similarity (Levenshtein distance)
   - Token-based similarity (Jaccard index)
   - Parameter matching
   - Cyclomatic complexity comparison
5. **Pattern Matching**: Groups similar blocks together
6. **Suggestion Generation**: Analyzes duplicates and generates actionable suggestions

## Advanced Features

### Similarity Metrics

The extension uses a weighted combination of:
- **40%**: Structural similarity (code structure)
- **30%**: Token similarity (keywords and identifiers)
- **15%**: Parameter similarity (function signatures)
- **15%**: Complexity similarity (control flow)

### Common Pattern Detection

Automatically detects and suggests replacements for common patterns:
- `for` loops → `Array.map/filter`
- `JSON.parse(JSON.stringify())` → `structuredClone` or `lodash.cloneDeep`
- `new Date().getTime()` → `Date.now()`
- Manual array building → Array methods
- And more...

## Performance Considerations

- **Large Codebases**: Scanning may take time for very large projects
- **Cancellation**: All operations are cancellable via VS Code's progress indicator
- **Incremental**: Uses efficient file globbing and parallel processing
- **Memory**: AST parsing is memory-intensive; adjust `minCodeBlockSize` if needed

## Tips for Best Results

1. **Adjust Similarity Threshold**: Lower for finding more matches, higher for exact duplicates
2. **Exclude Test Files**: Already excluded by default, but adjust if needed
3. **Start Small**: Scan single workspace before attempting cross-repo analysis
4. **Review Suggestions**: Not all suggestions may be applicable; use your judgment
5. **Incremental Refactoring**: Address high-priority suggestions first

## Troubleshooting

### Extension Not Working
- Ensure you have Node.js installed
- Check VS Code version (requires 1.85.0+)
- Look for errors in the Output panel (View → Output → Duplicate Scanner)

### No Duplicates Found
- Lower the similarity threshold in settings
- Check include/exclude patterns
- Ensure you have JavaScript/TypeScript files in your project

### Performance Issues
- Increase `minCodeBlockSize` to reduce processing
- Use more specific include patterns
- Exclude more directories (especially `node_modules`)

### Parse Errors
- Extension will skip files with syntax errors
- Check Output panel for details
- Ensure files use supported syntax (JS, TS, JSX, TSX)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please visit the GitHub repository.

---

**Happy refactoring! 🚀**
