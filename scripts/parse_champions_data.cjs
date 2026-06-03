const fs = require('fs');

function parseYakkun(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const moveChanges = [];
  const pokemonChanges = {};
  
  let section = 0; // 0: unknown, 1: moves, 2: pokemon
  let currentPokemon = null;

  for (let line of lines) {
    if (line.includes('威力・効果の変更された技') || line.includes('技\t変更点') || line === '技\t変更点') {
      section = 1;
      continue;
    }
    if (line.includes('新たに覚える追加技') || line.includes('ポケモン\t新たに覚える追加技')) {
      section = 2;
      continue;
    }
    
    if (section === 1) {
      if (line === '切る技(切り技)に追加' || line.includes('音技に追加')) continue; // Skip standalone categories if any, but they seem to be attached?
      const parts = line.split('\t');
      if (parts.length === 2) {
        moveChanges.push({ move: parts[0].trim(), change: parts[1].trim() });
      }
    } else if (section === 2) {
      if (!line.startsWith('没収:') && !line.includes('いびき') && !line.includes('没収') && !line.includes('変更なし')) {
        // Pokemon name
        currentPokemon = line.replace('\t', '').trim();
        if (currentPokemon && !pokemonChanges[currentPokemon]) {
          pokemonChanges[currentPokemon] = { added: [], removed: [] };
        }
      } else if (currentPokemon) {
        if (line.startsWith('没収:')) {
          const moves = line.replace('没収:', '').split('、').map(m => m.trim());
          pokemonChanges[currentPokemon].removed.push(...moves);
        } else if (line !== '変更なし') {
          // Additional moves are just mashed together?
          // "いびきはがねのつばさはねやすめ" - Yikes, they are not comma separated.
          // We might need to match them against a list of all moves later.
          pokemonChanges[currentPokemon].addedRaw = line; 
        }
      }
    }
  }
  return { moveChanges, pokemonChanges };
}

function parseGame8(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  // Use regex to extract all text from tables
  // We are looking for moves. A Game8 table row usually looks like <tr><td><a ...>Move Name</a></td>...</tr>
  
  const matches = [...content.matchAll(/<a[^>]*>(.*?)<\/a>/g)];
  const possibleMoves = new Set();
  for (let match of matches) {
    const text = match[1].trim();
    if (text.length > 0 && !text.includes('<')) {
      possibleMoves.add(text);
    }
  }
  return Array.from(possibleMoves);
}

const yakkunData = parseYakkun('C:/Users/kazum/OneDrive/デスクトップ/pokemonn.txt');
fs.writeFileSync('yakkun_parsed.json', JSON.stringify(yakkunData, null, 2));

const game8_1 = parseGame8('C:/Users/kazum/.gemini/antigravity/brain/060b8f7f-6075-4e9b-a35a-457949d8a608/.system_generated/steps/972/content.md');
const game8_2 = parseGame8('C:/Users/kazum/.gemini/antigravity/brain/060b8f7f-6075-4e9b-a35a-457949d8a608/.system_generated/steps/981/content.md');

fs.writeFileSync('game8_moves.json', JSON.stringify({ moves1: game8_1, moves2: game8_2 }, null, 2));

console.log('Parsed successfully');
