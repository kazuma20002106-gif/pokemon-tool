const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const index = content.indexOf('const isSlowerThanMin = mySpeed < oppMinSpeed;');
console.log(content.slice(index, index + 2000));
