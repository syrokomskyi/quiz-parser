import fs from "node:fs";

interface Quiz {
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface QuizCollection {
  total_unique: number;
  last_updated: string;
  quizzes: Quiz[];
}

class QuizAnalyzer {
  private readonly dataFile = "unique_quizzes.json";

  public analyze(): void {
    try {
      if (!fs.existsSync(this.dataFile)) {
        console.log(
          `❌ File ${this.dataFile} not found. First run quizzes collection.`,
        );
        return;
      }

      const data = fs.readFileSync(this.dataFile, "utf-8");
      const collection: QuizCollection = JSON.parse(data);

      console.log("📊 STATISTICS OF COLLECTED QUIZZES\n");
      console.log(`🎯 Total unique quizzes: ${collection.total_unique}`);
      console.log(
        `📅 Last updated: ${new Date(collection.last_updated).toLocaleString("ru-RU")}`,
      );

      // Statistics by types
      const typeStats = this.getTypeStats(collection.quizzes);
      console.log("\n📝 By types:");
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(
          `   ${type}: ${count} (${((count / collection.total_unique) * 100).toFixed(1)}%)`,
        );
      });

      // Statistics by difficulty
      const difficultyStats = this.getDifficultyStats(collection.quizzes);
      console.log("\n⭐ By difficulty:");
      Object.entries(difficultyStats).forEach(([difficulty, count]) => {
        console.log(
          `   ${difficulty}: ${count} (${((count / collection.total_unique) * 100).toFixed(1)}%)`,
        );
      });

      // Top categories
      const categoryStats = this.getCategoryStats(collection.quizzes);
      const topCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      console.log("\n🏆 Top-10 categories:");
      topCategories.forEach(([category, count], index) => {
        console.log(`   ${index + 1}. ${category}: ${count} quizzes`);
      });

      console.log(
        `\n📈 Total categories: ${Object.keys(categoryStats).length}`,
      );

      // Examples of questions by difficulty
      console.log("\n💡 Examples of questions:");
      ["easy", "medium", "hard"].forEach((difficulty) => {
        const example = collection.quizzes.find(
          (q) => q.difficulty === difficulty,
        );
        if (example) {
          console.log(`\n   ${difficulty.toUpperCase()}: ${example.question}`);
          console.log(`   Answer: ${example.correct_answer}`);
        }
      });
    } catch (error) {
      console.error("❌ Error analyzing data:", error);
    }
  }

  private getTypeStats(quizzes: Quiz[]): Record<string, number> {
    const stats: Record<string, number> = {};
    quizzes.forEach((quiz) => {
      stats[quiz.type] = (stats[quiz.type] || 0) + 1;
    });
    return stats;
  }

  private getDifficultyStats(quizzes: Quiz[]): Record<string, number> {
    const stats: Record<string, number> = {};
    quizzes.forEach((quiz) => {
      stats[quiz.difficulty] = (stats[quiz.difficulty] || 0) + 1;
    });
    return stats;
  }

  private getCategoryStats(quizzes: Quiz[]): Record<string, number> {
    const stats: Record<string, number> = {};
    quizzes.forEach((quiz) => {
      stats[quiz.category] = (stats[quiz.category] || 0) + 1;
    });
    return stats;
  }
}

// Run analyzer
const analyzer = new QuizAnalyzer();
analyzer.analyze();
