# Getting Started - Agent Working Guide

Welcome! This guide will help you understand how to work on this project effectively.

## Step 1: Understand the Project

First, read these files to understand what you're working on:

1. **Main README**: `/README.md` - Project overview, features, and usage
2. **Project Status**: `.agent/project-status.md` - Current state and completion status
3. **Package Info**: `/package.json` - Dependencies and scripts

Key commands to explore:
```bash
# List project structure
ls -la

# View project files
cat README.md
cat package.json

# Check git status
git status
git log --oneline -10
```

## Step 2: Check Available Tasks

Read the task index to see what work is available:

```bash
cat .agent/tasks/README.md
```

Tasks have the following statuses:
- `TODO` - Not started, available to work on
- `IN_PROGRESS` - Currently being worked on
- `BLOCKED` - Waiting on dependencies or decisions
- `COMPLETED` - Finished and verified
- `CANCELLED` - No longer needed

## Step 3: Choose a Task

Select a task based on:
1. Priority (High → Medium → Low)
2. Dependencies (complete prerequisite tasks first)
3. Your capabilities and expertise

## Step 4: Execute the Task

For each task:

1. **Understand Requirements**: Read the task file thoroughly
2. **Check Current State**: Explore relevant code
   ```bash
   # Find related files
   find . -name "*.ts" -type f
   # Search for relevant code
   grep -r "keyword" --include="*.ts"
   ```
3. **Make Changes**: Implement the required functionality
4. **Verify**: Test your changes
   ```bash
   npm run build
   npm test
   ```
5. **Update Documentation**: Keep project-status.md and task files current

## Step 5: Commit Your Work

Follow the git workflow:

```bash
# Review changes
git status
git diff

# Stage changes
git add .

# Commit with clear message
git commit -m "type: description

- Change 1
- Change 2
- Change 3

Closes TASK-XXX"

# Push to assigned branch
git push -u origin <branch-name>
```

Commit message types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation only
- `test`: Test additions/changes
- `chore`: Build process, dependencies, etc.

## Step 6: Update Task Status

After completing work:

1. Update task file status to `COMPLETED`
2. Update `.agent/project-status.md` with progress
3. Update `.agent/tasks/README.md` task status
4. Commit documentation updates

## Important Guidelines

### DO:
- ✅ Read before you write - understand existing code first
- ✅ Test your changes before committing
- ✅ Write clear commit messages
- ✅ Update documentation as you work
- ✅ Ask for clarification if requirements are unclear

### DON'T:
- ❌ Make assumptions about project structure
- ❌ Skip testing your changes
- ❌ Leave tasks partially complete without updating status
- ❌ Commit without descriptive messages
- ❌ Push to wrong branches

## Useful Commands Reference

```bash
# Development
npm run build          # Compile TypeScript
npm run dev           # Watch mode compilation
npm test              # Run all tests

# Testing
npm run test:setup    # Setup test environment
npm run test:node     # Start local blockchain
npm run test:n8n      # Start n8n instance

# Code Quality
npm run lint          # Check code style
npm run format        # Format code

# Project Exploration
ls -la                # List files
find . -name "*.ts"   # Find TypeScript files
grep -r "text"        # Search code
git log --oneline     # View commit history
```

## Getting Help

If you encounter issues:

1. Check existing code for similar patterns
2. Review test files for usage examples
3. Check git history for context: `git log --all --grep="keyword"`
4. Document blockers in task files
5. Set task status to `BLOCKED` with explanation

## Next Steps

1. Read `.agent/project-status.md` to understand current progress
2. Review `.agent/tasks/README.md` to see available work
3. Choose a task and start contributing!

Good luck! 🚀
