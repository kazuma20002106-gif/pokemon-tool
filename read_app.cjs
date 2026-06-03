const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const index = content.indexOf('opponentWeaknesses.resist');
console.log(content.slice(index - 100, index + 1000));
