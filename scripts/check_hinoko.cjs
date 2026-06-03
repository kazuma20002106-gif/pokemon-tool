const fs = require('fs');
const game8 = JSON.parse(fs.readFileSync('game8_moves.json', 'utf-8'));
const sv = JSON.parse(fs.readFileSync('src/data/moves.json', 'utf-8'));
console.log('Hinoko in Game8?', game8.moves1.includes('ひのこ') || game8.moves2.includes('ひのこ'));
const m = sv.find(m => m.name === 'ひのこ');
console.log('Hinoko in SV moves.json?', !!m);
