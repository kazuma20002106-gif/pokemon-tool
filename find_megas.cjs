const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/champions.json', 'utf8'));
const megas = data.filter(p => p.name.includes('メガ'));
console.log(megas.map(m => m.name).slice(0, 10));
