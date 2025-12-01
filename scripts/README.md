# Cocktail Data Validator

Automated validation system for `data/cocktail_data.json` that ensures all cocktail entries have the required properties with correct data types.

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Run Validation

**One-time validation:**
```bash
pnpm validate
```

**Watch mode (auto-validate on file changes):**
```bash
pnpm watch:validate
# or
pnpm dev
```

## How It Works

The validator uses [JSON Schema](https://json-schema.org/) to check each cocktail entry against a comprehensive schema that defines:

- **Required properties** - All 42 properties must be present
- **Data types** - Ensures strings, numbers, booleans, arrays, and objects are correct
- **Enum values** - Validates fixed-value fields (e.g., difficulty must be Easy/Medium/Hard/Expert)
- **Nested structures** - Checks ingredients, garnishOptions, variations, etc.
- **Format validation** - Validates ISO dates, ID patterns, image paths

## What Gets Validated

### String Properties
- `id`, `name`, `category`, `type`, `drinkColor`, `difficulty`, `glassType`, `iceType`, `garnish`, `season`, `vibe`, `skillLevelNeeded`, `originCountry`, `creatorName`, `nameOrigin`, `history`, `imageUrl`, `thumbnailUrl`

### Number Properties
- `timeToPrepare`, `servings`, `alcoholPercentage`, `totalAlcoholML`, `ratingAvg`, `ratingCount`, `createdYear`
- Nested: `tasteProfile.*` (0-10), `aromaProfile.intensity` (0-10), `nutrition.*`, `healthProfile.healthyStar` (0-5)

### Boolean Properties
- `isFavorite`, `metadata.addedByUser`, `healthProfile.lowSugar`, `healthProfile.lowCalories`, `healthProfile.lowAlcohol`

### Array Properties
- `alternateNames`, `tags`, `mood`, `warnings`, `ingredients`, `garnishOptions`, `instructions`, `baseSpirits`, `equipmentNeeded`, `bestOccasions`, `funFacts`, `variations`, `tips`

### Object Properties
- `tasteProfile`, `aromaProfile`, `nutrition`, `metadata`, `healthProfile`

### Enum Constraints

The following properties have restricted values:

- **category**: Whiskey, Vodka, Gin, Rum, Tequila, Brandy, Liqueur, Wine, Beer, Beer/Wine, Non-Alcoholic, Mixed
- **type**: Alcoholic, Non-Alcoholic, Mocktail
- **difficulty**: Easy, Medium, Hard, Expert
- **season**: Spring, Summer, Fall, Winter, All
- **skillLevelNeeded**: Beginner, Intermediate, Advanced, Expert
- **ingredients[].unit**: ml, oz, dash, piece, drop, leaf, sprig, tsp, tbsp, cup, g, mg, pinch
- **ingredients[].type**: alcohol, bitter, sweetener, juice, mix, ice, garnish, soda, syrup, cream, other
- **garnishOptions[].type**: citrus, fruit, herb, vegetable, other, spice, flower

## Understanding Warnings

When validation fails, you'll see detailed warnings like:

```
⚠ Found validation issues:

Entry #3: "margarita_001"
  • Missing required property: aromaProfile/intensity
  • Type error at /timeToPrepare: expected number, got string
  • Invalid value at /difficulty: must be one of [Easy, Medium, Hard, Expert]
  • Array at /tags must have at least 1 items
```

### Common Issues

1. **Missing properties** - Add the missing field to your cocktail entry
2. **Type errors** - Ensure numbers aren't wrapped in quotes, booleans are true/false
3. **Invalid enum values** - Use exactly the values listed in the schema
4. **Empty arrays** - Arrays like `tags` must have at least one item
5. **Format errors** - Check ID patterns (lowercase_001), date formats (ISO 8601)

## Adding New Cocktails

When adding a new cocktail to `data/cocktail_data.json`:

1. Copy the template structure from an existing entry
2. Fill in all required properties
3. Save the file
4. If watch mode is running, validation runs automatically
5. Fix any warnings that appear

### Template Structure

```json
{
  "id": "cocktail_name_001",
  "name": "Cocktail Name",
  "alternateNames": [],
  "category": "Vodka",
  "type": "Alcoholic",
  "tags": ["Classic"],
  "imageUrl": "images/cocktail_name.jpg",
  "thumbnailUrl": "thumbs/cocktail_name.png",
  "drinkColor": "Clear",
  "mood": ["Elegant"],
  "warnings": [],
  "ingredients": [
    {
      "name": "Vodka",
      "quantity": 60,
      "unit": "ml",
      "type": "alcohol"
    }
  ],
  "garnishOptions": [],
  "instructions": ["Step 1"],
  "difficulty": "Easy",
  "timeToPrepare": 5,
  "servings": 1,
  "glassType": "Martini glass",
  "iceType": "None",
  "garnish": "None",
  "tasteProfile": {
    "sweetness": 1,
    "bitterness": 1,
    "sourness": 1,
    "strength": 8,
    "refreshing": 5,
    "flavorNotes": ["clean"]
  },
  "aromaProfile": {
    "primary": ["neutral"],
    "secondary": [],
    "intensity": 3
  },
  "alcoholPercentage": 40,
  "totalAlcoholML": 24,
  "baseSpirits": ["Vodka"],
  "nutrition": {
    "calories": 100,
    "carbs": 0,
    "sugar": 0
  },
  "equipmentNeeded": ["Mixing glass"],
  "bestOccasions": ["Any"],
  "season": "All",
  "vibe": "Classic",
  "skillLevelNeeded": "Beginner",
  "ratingAvg": 4.0,
  "ratingCount": 0,
  "isFavorite": false,
  "originCountry": "Unknown",
  "creatorName": "Unknown",
  "createdYear": 2000,
  "nameOrigin": "Description",
  "history": "History here",
  "funFacts": [],
  "variations": [],
  "metadata": {
    "keywords": [],
    "updatedAt": "2025-12-01T00:00:00Z",
    "addedByUser": false
  },
  "tips": [],
  "healthProfile": {
    "healthyStar": 3,
    "lowSugar": true,
    "lowCalories": false,
    "lowAlcohol": false,
    "notes": "Notes here"
  }
}
```

## Files

- **`cocktail-schema.json`** - JSON Schema definition with all validation rules
- **`validate-cocktails.js`** - Core validation logic using AJV
- **`watch-cocktails.js`** - File watcher that auto-runs validation

## Dependencies

- **ajv** (v8.17.1) - JSON Schema validator
- **ajv-formats** (v3.0.1) - Additional format validators (date-time, etc.)
- **chalk** (v5.6.2) - Terminal colors for readable output
- **chokidar** (v5.0.0) - Efficient file system watcher

## Troubleshooting

### "File not found" error
Make sure `data/cocktail_data.json` exists in the project root.

### JSON Syntax Error
Check for missing commas, brackets, or quotes in your JSON file.

### Validation runs multiple times
This is normal during rapid file saves. The debounce delay (500ms) prevents excessive validation runs.

### Watch mode not detecting changes
Try saving the file again, or restart the watch mode with `pnpm dev`.

## Tips

- Keep watch mode running while editing cocktails for instant feedback
- Fix warnings from top to bottom - some errors may cascade
- Use a JSON validator/linter in your editor for syntax checking
- Copy an existing valid entry as a starting point for new cocktails

