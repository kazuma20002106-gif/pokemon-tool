const fs = require('fs');

// 1. Fix Pokemon interface in PokemonDetailModal.tsx
let modal = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');
modal = modal.replace(
  '  stats: Stats; \r\n}',
  '  stats: Stats; \r\n  availableIn?: string[];\r\n}'
).replace(
  '  stats: Stats; \n}',
  '  stats: Stats; \n  availableIn?: string[];\n}'
);
fs.writeFileSync('src/components/PokemonDetailModal.tsx', modal);

// 2. Fix App.tsx missing import
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('import { DamageCalculator }')) {
  app = app.replace(
    "import { TypeBadge } from './components/TypeBadge';",
    "import { TypeBadge } from './components/TypeBadge';\nimport { DamageCalculator } from './components/DamageCalculator';"
  );
}
fs.writeFileSync('src/App.tsx', app);

// 3. Fix damageCalc.ts logic and unused imports
let damageCalc = fs.readFileSync('src/utils/damageCalc.ts', 'utf8');
const badLogic = `
  for (const tType of targetTypes) {
    if (TYPE_CHART[moveType].weak.includes(tType)) multiplier *= 2;
    if (TYPE_CHART[moveType].resist.includes(tType)) multiplier *= 0.5;
    if (TYPE_CHART[moveType].immune.includes(tType)) multiplier *= 0;
  }
`;
const goodLogic = `
  for (const tType of targetTypes) {
    if (TYPE_CHART[moveType] && TYPE_CHART[moveType][tType] !== undefined) {
      multiplier *= TYPE_CHART[moveType][tType];
    }
  }
`;
damageCalc = damageCalc.replace(badLogic.trim(), goodLogic.trim());
fs.writeFileSync('src/utils/damageCalc.ts', damageCalc);

// 4. Fix DamageCalculator unused imports
let dmgCalcComponent = fs.readFileSync('src/components/DamageCalculator.tsx', 'utf8');
dmgCalcComponent = dmgCalcComponent.replace(
  "import React, { useMemo } from 'react';",
  "import React from 'react';"
);
dmgCalcComponent = dmgCalcComponent.replace(
  "import { calculateDamage, getEffectiveness } from '../utils/damageCalc';",
  "import { calculateDamage } from '../utils/damageCalc';"
);
fs.writeFileSync('src/components/DamageCalculator.tsx', dmgCalcComponent);

console.log("Fixed all typescript errors!");
