# Quick Start Quiz Collector

## 🚀 Installation and running

**Install dependencies:**

```bash
pnpm install
```

**Run quizzes collection:**

```bash
pnpm run dev
```

**View statistics:**

```bash
pnpm run dev:stats
```

## 📁 Project files

- `quiz_collector.ts` - main collection script
- `quiz_stats.ts` - data analysis script
- `unique_quizzes.json` - result (created automatically)
- `package.json` - dependencies and scripts
- `tsconfig.json` - TypeScript settings

## 🎯 Key commands

```bash
pnpm run dev         # Run quizzes collection
pnpm run dev:stats   # Show statistics
pnpm run build       # Compile to JS
pnpm run clean       # Clear all data
```

## ✨ Features

- **Idempotency**: repeated run immediately ends if data is already collected
- **Autostop**: stops when 100% of quizzes are repeated  
- **Safety**: obeys API limits
- **Reliability**: saves data after each request
