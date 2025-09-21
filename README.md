# Quiz Collector

Script on TypeScript for collecting all unique quizzes from Open Trivia Database API.

## Features

- ✅ Collect all unique quizzes from <https://opentdb.com/api.php>
- ✅ Obey request limit (1 request every 2-3 seconds)
- ✅ Save to JSON file with full data structure
- ✅ **Idempotency** - repeated run immediately ends if data is already collected
- ✅ Autostop when 100% of quizzes are repeated
- ✅ Error handling and detailed logging
- ✅ Incremental saving (after each request)

## Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## Running

### Variant 1: Compilation and running

```bash
# Compile TypeScript
npm run build

# Run compiled JavaScript
npm start
```

### Variant 2: Direct running (with ts-node)

```bash
npm run dev
```

### Variant 3: Manual running

```bash
# Compile
npx tsc quiz_collector.ts --target ES2022 --module ESNext --moduleResolution node

# Run
node quiz_collector.js
```

## How it works

1. **First run**: Script starts collecting quizzes from scratch
2. **Subsequent runs**: Script loads existing quizzes and checks for new ones
3. **Idempotency**: If all quizzes are already collected, script ends immediately
4. **Autostop**: Script stops after 5 requests in a row without new unique quizzes

## Output files

- `unique_quizzes.json` - Main file with collected quizzes

### File structure

```json
{
  "total_unique": 4000,
  "last_updated": "2025-09-21T21:36:00.000Z",
  "quizzes": [
    {
      "type": "multiple",
      "difficulty": "easy",
      "category": "General Knowledge", 
      "question": "In aerodynamics, which force pushes an object upwards?",
      "correct_answer": "Lift",
      "incorrect_answers": ["Drag", "Weight", "Thrust"]
    }
  ]
}
```

## Logging

Script outputs detailed information:

- Number of loaded quizzes at start
- Progress of each request
- Number of new unique quizzes
- Idempotency statistics
- Final statistics

## Data cleanup

```bash
# Remove collected data and compiled files
pnpm run clean
```

## Requirements

- Node.js >= 18.0.0
- pnpm, npm, or yarn

## Algorithm of uniqueness

Uniqueness of quizzes is determined by the combination of `question + correct_answer`, ensuring reliable identification of duplicates.

## Example of Statistics

```bash
pnpm run dev:stats
```

📊 STATISTICS OF COLLECTED QUIZZES

🎯 Total unique quizzes: 1486
📅 Last updated: 22.09.2025, 20:10:13

📝 By types:
   multiple: 1263 (85.0%)
   boolean: 223 (15.0%)

⭐ By difficulty:
   easy: 494 (33.2%)
   medium: 696 (46.8%)
   hard: 296 (19.9%)

🏆 Top-10 categories:

   1. Entertainment: Video Games: 360 quizzes
   2. Entertainment: Music: 145 quizzes
   3. General Knowledge: 116 quizzes
   4. History: 101 quizzes
   5. Geography: 100 quizzes
   6. Entertainment: Film: 94 quizzes
   7. Science & Nature: 85 quizzes
   8. Entertainment: Japanese Anime & Manga: 66 quizzes
   9. Entertainment: Television: 57 quizzes
   10. Science: Computers: 50 quizzes

📈 Total categories: 24

💡 Examples of questions:

   EASY: What colour is the female blackbird?
   Answer: Brown

   MEDIUM: What is the exact length of one non-curved part in Lane 1 of an Olympic Track?
   Answer: 84.39m

   HARD: Which of these artists did NOT remix the song "Faded" by Alan Walker?
   Answer: Skrillex
