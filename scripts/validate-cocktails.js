import Ajv from "ajv";
import addFormats from "ajv-formats";
import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Load schema
const schemaPath = join(__dirname, "cocktail-schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
const validate = ajv.compile(schema);

/**
 * Format validation errors into readable warnings
 */
function formatErrors(cocktail, errors) {
  const warnings = [];
  const id = cocktail.id || cocktail.name || "Unknown";

  for (const error of errors) {
    const path = error.instancePath || error.dataPath || "";
    const message = error.message || "";

    if (error.keyword === "required") {
      const missingProp = error.params.missingProperty;
      warnings.push(
        `Missing required property: ${path ? path + "/" : ""}${missingProp}`
      );
    } else if (error.keyword === "type") {
      const expectedType = error.params.type;
      warnings.push(
        `Type error at ${
          path || "root"
        }: expected ${expectedType}, got ${typeof error.data}`
      );
    } else if (error.keyword === "enum") {
      const allowedValues = error.params.allowedValues.join(", ");
      warnings.push(
        `Invalid value at ${path}: must be one of [${allowedValues}]`
      );
    } else if (error.keyword === "minimum" || error.keyword === "maximum") {
      const limit = error.params.limit;
      warnings.push(`Value at ${path} ${message} (limit: ${limit})`);
    } else if (error.keyword === "minItems") {
      warnings.push(
        `Array at ${path} must have at least ${error.params.limit} items`
      );
    } else if (error.keyword === "minLength") {
      warnings.push(`String at ${path} must not be empty`);
    } else if (error.keyword === "pattern") {
      warnings.push(`Format error at ${path}: ${message}`);
    } else if (error.keyword === "format") {
      warnings.push(
        `Format error at ${path}: expected ${error.params.format} format`
      );
    } else {
      warnings.push(`${path || "root"}: ${message}`);
    }
  }

  return { id, warnings };
}

/**
 * Validate cocktail data
 */
export function validateCocktails(filePath) {
  const startTime = Date.now();

  try {
    // Read and parse the JSON file
    const data = JSON.parse(readFileSync(filePath, "utf-8"));

    if (!Array.isArray(data)) {
      console.log(
        chalk.red("✖ Error: Data file must contain an array of cocktails")
      );
      return { valid: false, total: 0, passed: 0, failed: 0 };
    }

    const results = {
      total: data.length,
      passed: 0,
      failed: 0,
      errors: [],
    };

    console.log(
      chalk.blue(`\n🔍 Validating ${results.total} cocktail entries...\n`)
    );

    // Validate each cocktail
    data.forEach((cocktail, index) => {
      const isValid = validate(cocktail);

      if (isValid) {
        results.passed++;
      } else {
        results.failed++;
        const { id, warnings } = formatErrors(cocktail, validate.errors);
        results.errors.push({ index: index + 1, id, warnings });
      }
    });

    // Display results
    if (results.failed > 0) {
      console.log(chalk.yellow(`⚠ Found validation issues:\n`));

      results.errors.forEach(({ index, id, warnings }) => {
        console.log(chalk.yellow(`Entry #${index}: "${id}"`));
        warnings.forEach((warning) => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
        console.log("");
      });
    }

    // Summary
    const duration = Date.now() - startTime;
    console.log(chalk.bold("Summary:"));
    console.log(`  Total entries: ${results.total}`);
    console.log(chalk.green(`  ✓ Passed: ${results.passed}`));

    if (results.failed > 0) {
      console.log(chalk.yellow(`  ⚠ Failed: ${results.failed}`));
    } else {
      console.log(chalk.green(`\n✓ All cocktails are valid! 🍹`));
    }

    console.log(`  Time: ${duration}ms\n`);

    return {
      valid: results.failed === 0,
      ...results,
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(chalk.red(`✖ Error: File not found: ${filePath}`));
    } else if (error instanceof SyntaxError) {
      console.log(chalk.red(`✖ JSON Syntax Error: ${error.message}`));
    } else {
      console.log(chalk.red(`✖ Error: ${error.message}`));
    }
    return { valid: false, total: 0, passed: 0, failed: 0 };
  }
}

// Run validation if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dataPath = join(__dirname, "..", "data", "cocktail_data.json");
  validateCocktails(dataPath);
}
