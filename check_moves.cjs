const fs = require('fs');
const moves = JSON.parse(fs.readFileSync('src/data/moves.json', 'utf8'));
const names = moves.map(m => m.name);
const unique = new Set(names);
console.log(`Total: ${names.length}, Unique: ${unique.size}`);
