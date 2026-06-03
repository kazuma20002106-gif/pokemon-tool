const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/champions.json', 'utf-8'));
const abilities = new Set();
data.forEach(p => {
  if (p.abilities) {
    p.abilities.forEach(a => abilities.add(a));
  }
});
console.log(Array.from(abilities).join('\n'));
