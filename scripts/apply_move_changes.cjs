const fs = require('fs');

const movesData = JSON.parse(fs.readFileSync('src/data/moves.json', 'utf-8'));
const changes = JSON.parse(fs.readFileSync('champions_move_changes.json', 'utf-8'));

for (const changeObj of changes) {
  const moveName = changeObj.move;
  const changeText = changeObj.change;
  
  const move = movesData.find(m => m.name === moveName);
  if (!move) {
    console.log('Move not found:', moveName);
    continue;
  }

  // Parse 威力X→Y
  const powerMatch = changeText.match(/威力(\d+)→(\d+)/);
  if (powerMatch) {
    move.power = parseInt(powerMatch[2], 10);
    console.log(`Updated ${moveName} power to ${move.power}`);
  }

  // Parse 命中X→Y
  const accMatch = changeText.match(/命中(\d+)→(\d+)/);
  if (accMatch) {
    move.accuracy = parseInt(accMatch[2], 10);
    console.log(`Updated ${moveName} accuracy to ${move.accuracy}`);
  }

  // Parse タイプ変更 (e.g. くさタイプ→はがねタイプ)
  const typeMatch = changeText.match(/(.+)タイプ→(.+)タイプ/);
  if (typeMatch) {
    move.type = typeMatch[2];
    console.log(`Updated ${moveName} type to ${move.type}`);
  }
}

fs.writeFileSync('src/data/moves_champions.json', JSON.stringify(movesData, null, 2));
console.log('Move updates applied successfully');
