const fs = require('fs');

const typeMap = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  grass: "くさ",
  electric: "でんき",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー"
};

const moves = JSON.parse(fs.readFileSync('src/data/moves.json', 'utf8'));

// Filter duplicates and translate types
const uniqueMoves = [];
const seen = new Set();

for (const m of moves) {
  if (!seen.has(m.name)) {
    seen.add(m.name);
    m.type = typeMap[m.type] || m.type;
    // Map category
    if (m.category === "physical") m.category = "物理";
    else if (m.category === "special") m.category = "特殊";
    else if (m.category === "status") m.category = "変化";
    uniqueMoves.push(m);
  }
}

// Sort alphabetically for easier selection
uniqueMoves.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

fs.writeFileSync('src/data/moves.json', JSON.stringify(uniqueMoves, null, 2));
console.log(`Saved ${uniqueMoves.length} unique moves with translated types/categories.`);
