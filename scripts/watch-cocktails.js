import chokidar from "chokidar";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { validateCocktails } from "./validate-cocktails.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the cocktail data file
const dataPath = join(__dirname, "..", "data", "cocktail_data.json");

// Debounce timer
let debounceTimer = null;
const DEBOUNCE_DELAY = 500; // milliseconds

/**
 * Run validation with debouncing
 */
function runValidation() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(chalk.cyan(`\n[$timestamp] File changed, validating...`));
    console.log(chalk.gray("─".repeat(60)));

    validateCocktails(dataPath);

    console.log(chalk.gray("─".repeat(60)));
    console.log(chalk.cyan("Watching for changes... (Press Ctrl+C to stop)\n"));
  }, DEBOUNCE_DELAY);
}

/**
 * Initialize file watcher
 */
function startWatcher() {
  console.log(chalk.bold.green("\n🍹 Cocktail Data Validator - Watch Mode\n"));
  console.log(chalk.gray(`Watching: ${dataPath}\n`));

  // Initial validation
  console.log(chalk.cyan("Running initial validation..."));
  console.log(chalk.gray("─".repeat(60)));
  validateCocktails(dataPath);
  console.log(chalk.gray("─".repeat(60)));

  // Set up file watcher
  const watcher = chokidar.watch(dataPath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on("change", () => {
      runValidation();
    })
    .on("error", (error) => {
      console.log(chalk.red(`\n✖ Watcher error: ${error.message}\n`));
    });

  console.log(chalk.cyan("Watching for changes... (Press Ctrl+C to stop)\n"));

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n\nStopping watcher..."));
    watcher.close();
    process.exit(0);
  });
}

// Start the watcher
startWatcher();
