import fs from "node:fs";

interface Quiz {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface ApiResponse {
  response_code: number;
  results: Quiz[];
}

interface QuizCollection {
  total_unique: number;
  last_updated: string;
  quizzes: Quiz[];
}

class QuizCollector {
  private readonly apiUrl = "https://opentdb.com/api.php?amount=20";
  private readonly outputFile = "unique_quizzes.json";

  private delayMs() {
    return Math.floor(Math.random() * 3000) + 1200;
  }

  private uniqueQuizzes: Map<string, Quiz> = new Map();

  constructor() {
    this.loadExistingQuizzes();
  }

  private generateQuizKey(quiz: Quiz): string {
    return `${quiz.question}|${quiz.correct_answer}`;
  }

  private loadExistingQuizzes(): void {
    try {
      if (fs.existsSync(this.outputFile)) {
        const data = fs.readFileSync(this.outputFile, "utf-8");
        const collection: QuizCollection = JSON.parse(data);

        collection.quizzes.forEach((quiz) => {
          const key = this.generateQuizKey(quiz);
          this.uniqueQuizzes.set(key, quiz);
        });

        console.log(`Loaded ${collection.quizzes.length} existing quizzes`);
      }
    } catch (error) {
      console.error("Error loading existing quizzes:", error);
    }
  }

  private saveQuizzes(): void {
    try {
      const collection: QuizCollection = {
        total_unique: this.uniqueQuizzes.size,
        last_updated: new Date().toISOString(),
        quizzes: Array.from(this.uniqueQuizzes.values()),
      };

      fs.writeFileSync(
        this.outputFile,
        JSON.stringify(collection, null, 2),
        "utf-8",
      );
      console.log(
        `Saved ${collection.total_unique} unique quizzes to ${this.outputFile}`,
      );
    } catch (error) {
      console.error("Error saving quizzes:", error);
    }
  }

  private async fetchQuizzes(): Promise<Quiz[]> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.response_code !== 0) {
        throw new Error(`API error! response_code: ${data.response_code}`);
      }

      return data.results;
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      return [];
    }
  }

  private addUniqueQuizzes(quizzes: Quiz[]): number {
    let addedCount = 0;

    quizzes.forEach((quiz) => {
      const key = this.generateQuizKey(quiz);
      if (!this.uniqueQuizzes.has(key)) {
        this.uniqueQuizzes.set(key, quiz);
        addedCount++;
      }
    });

    return addedCount;
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delayMs()));
  }

  public async collectQuizzes(): Promise<void> {
    console.log("Starting quiz collection...");
    console.log(`Current unique quizzes count: ${this.uniqueQuizzes.size}`);

    let requestCount = 0;
    let consecutiveEmptyResults = 0;
    const maxConsecutiveEmpty = 6;

    while (true) {
      requestCount++;
      console.log(`\nRequest #${requestCount}...`);

      const newQuizzes = await this.fetchQuizzes();
      if (newQuizzes.length === 0) {
        console.log("Unable to retrieve quizzes, retrying in 2.5 seconds...");
        await this.delay();
        continue;
      }

      const addedCount = this.addUniqueQuizzes(newQuizzes);

      console.log(
        `Received ${newQuizzes.length} quizzes, added ${addedCount} new unique`,
      );
      console.log(`Total unique quizzes: ${this.uniqueQuizzes.size}`);

      // Save after each successful request
      this.saveQuizzes();

      if (addedCount === 0) {
        consecutiveEmptyResults++;
        console.log(
          `Empty results count: ${consecutiveEmptyResults}/${maxConsecutiveEmpty}`,
        );

        if (consecutiveEmptyResults >= maxConsecutiveEmpty) {
          console.log(
            "\n🎉 Collection completed! All unique quizzes collected.",
          );
          break;
        }
      } else {
        consecutiveEmptyResults = 0; // Reset counter on new quizzes
      }

      // Wait before next request
      console.log("Waiting 2.5 seconds before next request...");
      await this.delay();
    }

    console.log(`\nFinal statistics:`);
    console.log(`- Total requests: ${requestCount}`);
    console.log(`- Total unique quizzes collected: ${this.uniqueQuizzes.size}`);
    console.log(`- File: ${this.outputFile}`);
  }

  // Check idempotency
  public async checkIdempotency(): Promise<boolean> {
    console.log("Checking idempotency...");

    const initialSize = this.uniqueQuizzes.size;
    if (initialSize === 0) {
      console.log("No saved quizzes, starting collection from scratch.");
      return false;
    }

    // Do several test requests
    const testCount = 3;
    let newQuizzesFound = 0;

    for (let i = 0; i < testCount; i++) {
      console.log(`Test request ${i + 1}/${testCount}...`);

      const quizzes = await this.fetchQuizzes();
      if (quizzes.length > 0) {
        const sizeBefore = this.uniqueQuizzes.size;
        this.addUniqueQuizzes(quizzes);
        newQuizzesFound += this.uniqueQuizzes.size - sizeBefore;
      }

      if (i < testCount - 1) await this.delay();
    }

    if (newQuizzesFound === 0) {
      console.log("✅ Idempotency confirmed - no new quizzes found.");
      console.log(`Total unique quizzes: ${this.uniqueQuizzes.size}`);
      return true;
    } else {
      console.log(
        `⚠️  Found ${newQuizzesFound} new quizzes, continue collection.`,
      );
      this.saveQuizzes();
      return false;
    }
  }
}

async function main() {
  try {
    const collector = new QuizCollector();

    const isComplete = await collector.checkIdempotency();

    if (!isComplete) {
      await collector.collectQuizzes();
    }

    console.log("\n🎯 Script completed successfully!");
  } catch (error) {
    console.error("Critical error:", error);
    process.exit(1);
  }
}

main().catch(console.error);

export { QuizCollector };
