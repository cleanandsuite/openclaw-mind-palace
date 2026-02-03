# OpenClaw Mind Palace

Compartmentalized knowledge base for Clean & Suite and other projects.

## Folder Structure

```
docs/
├── 01_compliance/      ← Legal, security, privacy policies
├── 02_code-style/      ← Coding conventions, patterns
├── 03_database/        ← Schemas, queries, migrations
├── 04_design/          ← UI guidelines, brand assets
├── 05_structuring/     ← Architecture, integrations
├── 06_bug-fixes/       ← Known issues, solutions
├── 07_testing/         ← Test cases, coverage
├── 90_workspaces/      ← Project-specific context (Clean & Suite, etc.)
└── 99_archive/         ← Deprecated/old content
```

## Usage

OpenClaw reads from `docs/` for memory search. Add `.md` files to any category.

## Syncing

Push changes to GitHub:
```bash
cd mind-palace
git add .
git commit -m "Updated memory"
git push
```
