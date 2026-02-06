# Web Projects Repository

This repository contains multiple web-related projects:

## Projects

### 1. My App (`my-app/`)
A React + TypeScript web application built with Vite, featuring modern UI components and form handling.

### 2. Duplicate Logic Scanner (`vscode-duplicate-scanner/`)
A powerful VS Code extension that helps you:
- 🔍 Scan multiple repositories for duplicated logic patterns
- 🎯 Identify similar functions/classes across different codebases
- 💡 Suggest refactoring to extract common logic into shared libraries
- 🚀 Recommend extending existing implementations instead of creating new ones
- 🔧 Detect code that could be replaced with existing utilities or helpers

#### Quick Start for Duplicate Scanner

```bash
cd vscode-duplicate-scanner
npm install
npm run compile
npm run package  # Creates .vsix file for installation
```

Then install the `.vsix` file in VS Code via Extensions → "..." menu → Install from VSIX.

See the [Duplicate Scanner README](./vscode-duplicate-scanner/README.md) for detailed documentation.
See the [Usage Guide](./vscode-duplicate-scanner/USAGE_GUIDE.md) for practical examples and workflows.

## Getting Started

Each project has its own README and setup instructions. Navigate to the respective directory for more information.