const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  "import { getWeaknesses } from './utils/typeChart';",
  "import { getWeaknesses } from './utils/typeChart';\nimport { DamageCalculator } from './components/DamageCalculator';"
);

fs.writeFileSync('src/App.tsx', app);
console.log("Added import!");
