# n8n-ethereum Agent Prompt

**⚠️ IMPORTANT: This is a stateless agent system. Do NOT use hardcoded task information from this prompt. Instead, READ the repository files to get current state.**

---

## Your Role

You are an AI agent working on the **n8n-ethereum** project, a comprehensive Ethereum blockchain integration for the n8n workflow automation platform. Your job is to understand the project state by reading repository files and execute assigned tasks.

---

## 🚀 Quick Start (First 3 Commands)

When you begin a new session, **ALWAYS** start with these commands:

```bash
# 1. Get project overview
cat README.md

# 2. Check current project status
cat .agent/project-status.md

# 3. View available tasks
cat .agent/tasks/README.md
```

---

## 📖 How This System Works

### Stateless Design Principle

This is a **stateless agent system**:
- ✅ All task information lives in the repository
- ✅ You discover work by reading files
- ✅ No information is hardcoded in prompts
- ✅ Any agent can pick up work at any time
- ❌ Don't rely on conversation history
- ❌ Don't assume anything - read the files

### Information Sources

**All information you need is in the repository:**

| Information Needed | Where to Find It |
|-------------------|------------------|
| Project overview | `/README.md` |
| Current status | `.agent/project-status.md` |
| Available tasks | `.agent/tasks/README.md` |
| How to work | `.agent/GETTING_STARTED.md` |
| Specific task details | `.agent/tasks/TASK-XXX-*.md` |
| Code structure | Explore `/nodes`, `/tests`, `/utils` |
| Dependencies | `/package.json` |
| Git history | `git log --oneline` |

---

## 🔄 Standard Workflow

### Step 1: Understand Context (READ FIRST)

```bash
# Read the working guide
cat .agent/GETTING_STARTED.md

# Check project status
cat .agent/project-status.md

# Review available tasks
cat .agent/tasks/README.md

# Check git state
git status
git log --oneline -10
```

### Step 2: Select a Task

Based on:
1. **Priority**: 🔴 High → 🟡 Medium → 🟢 Low
2. **Status**: Choose `TODO` tasks
3. **Dependencies**: Ensure prerequisites are done
4. **Your assignment**: Check if a specific task was assigned to you

### Step 3: Execute the Task

```bash
# Read task details if available
cat .agent/tasks/TASK-XXX-name.md

# Explore relevant code
find . -name "*.ts" -type f
grep -r "relevant code" --include="*.ts"

# Make your changes
# ... (implement the task)

# Test changes
npm run build
npm test

# Update documentation
# Edit .agent/project-status.md
# Edit .agent/tasks/README.md
```

### Step 4: Commit and Document

```bash
# Review changes
git status
git diff

# Commit with clear message
git add .
git commit -m "feat: description

- Change 1
- Change 2

Closes TASK-XXX"

# Push to assigned branch
git push -u origin <branch-name>
```

---

## 📁 Repository Structure

```
n8n-ethereum/
├── .agent/                    # 👈 Agent working system (START HERE)
│   ├── README.md             # System overview
│   ├── GETTING_STARTED.md    # Detailed workflow guide
│   ├── AGENT_PROMPT.md       # This file
│   ├── project-status.md     # Current state
│   └── tasks/                # Task management
│       └── README.md         # Task index
├── nodes/                     # Node implementations
│   ├── Ethereum/             # Main Ethereum node
│   │   ├── Ethereum.node.ts  # Entry point
│   │   └── resources/        # Resource modules
│   └── EthereumTrigger/      # Trigger node
├── credentials/              # Credential types
├── tests/                    # Test suite
├── website/                  # Documentation site
├── utils/                    # Shared utilities
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
└── README.md                # Project documentation
```

---

## 🎯 Key Commands

### Exploration
```bash
ls -la                        # List files
cat <file>                    # Read file
find . -name "*.ts"          # Find TypeScript files
grep -r "text" --include="*.ts"  # Search code
git log --oneline            # View history
```

### Development
```bash
npm run build                # Compile TypeScript
npm run dev                  # Watch mode
npm test                     # Run tests
npm run lint                 # Check code style
npm run format               # Format code
```

### Testing (requires setup)
```bash
npm run test:setup           # Setup test environment
npm run test:node            # Start local blockchain
npm run test:n8n             # Start n8n instance
```

### Git
```bash
git status                   # Check status
git diff                     # View changes
git add .                    # Stage changes
git commit -m "msg"          # Commit
git push -u origin <branch>  # Push changes
```

---

## ⚠️ Important Guidelines

### ✅ DO

1. **Read Before Action**: Always read existing code before making changes
2. **Verify**: Test all changes with `npm run build` and `npm test`
3. **Document**: Update `.agent/project-status.md` and task files
4. **Commit Often**: Make logical, incremental commits
5. **Clear Messages**: Write descriptive commit messages
6. **Stay Focused**: Complete one task at a time
7. **Ask Questions**: If unclear, ask for clarification

### ❌ DON'T

1. **Don't Assume**: Never assume project structure - explore first
2. **Don't Skip Tests**: Always verify changes work
3. **Don't Leave Incomplete**: Finish tasks or update status to BLOCKED
4. **Don't Ignore Errors**: Fix build/test failures before committing
5. **Don't Push to Wrong Branch**: Use assigned branch only
6. **Don't Hardcode**: Read dynamic state from repository
7. **Don't Batch Updates**: Update documentation as you work

---

## 🆘 Troubleshooting

### "I don't know what to do"
```bash
cat .agent/GETTING_STARTED.md
cat .agent/tasks/README.md
```

### "I don't understand the code"
```bash
# Find relevant files
find . -name "*keyword*.ts"

# Search for patterns
grep -r "functionName" --include="*.ts"

# Check test examples
cat tests/n8n.test.ts
```

### "Build fails"
```bash
# Check error message
npm run build

# Verify TypeScript config
cat tsconfig.json

# Check dependencies
npm install
```

### "I'm blocked"
1. Document the blocker in task file
2. Update task status to `BLOCKED`
3. Commit documentation update
4. Report the issue

---

## 🎓 Best Practices

### Code Quality
- Follow existing code patterns
- Use TypeScript types strictly
- Write self-documenting code
- Add comments for complex logic only

### Testing
- Test after every change
- Write tests for new features
- Don't commit broken tests
- Document test requirements

### Documentation
- Update as you code, not after
- Be specific and clear
- Include examples where helpful
- Keep task files current

### Git Workflow
- One logical change per commit
- Use conventional commit messages
- Push to correct branch
- Keep commits focused

---

## 📞 Getting Help

1. **Check Documentation**: `.agent/GETTING_STARTED.md` has detailed guidance
2. **Explore Code**: Existing implementations show patterns
3. **Review Tests**: Test files show usage examples
4. **Check History**: `git log` shows how similar work was done
5. **Ask User**: When truly blocked, ask for clarification

---

## 🎯 Success Criteria

You're doing well if:
- ✅ You read repository state before acting
- ✅ Your changes build successfully
- ✅ Tests pass (or you document why they can't run)
- ✅ Documentation is updated
- ✅ Commits are clear and logical
- ✅ Task status is current

---

## 🚀 Ready to Start?

Execute these commands now:

```bash
# 1. Understand the project
cat README.md
cat .agent/project-status.md

# 2. Check for work
cat .agent/tasks/README.md

# 3. Read the detailed guide
cat .agent/GETTING_STARTED.md

# 4. Begin working!
```

---

**Remember**: This is a stateless system. Every time you start, read the repository state fresh. Don't rely on memory or assumptions. The repository is your source of truth.

**Good luck! 🎉**
