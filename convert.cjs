const fs = require('fs');
const lines = fs.readFileSync('C:/Users/kazum/OneDrive/デスクトップ/pokemonn.txt', 'utf-8').trim().split('\n').slice(1);
const result = {};
lines.forEach(l => {
  const parts = l.split(',');
  if(parts.length >= 2) result[parts[0].trim()] = parts.slice(1).join(',').trim();
});
fs.writeFileSync('src/data/items.json', JSON.stringify(result, null, 2));
