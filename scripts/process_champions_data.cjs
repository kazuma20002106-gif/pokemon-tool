const fs = require('fs');

function processData() {
  const yakkun = JSON.parse(fs.readFileSync('yakkun_parsed.json', 'utf-8'));
  const game8 = JSON.parse(fs.readFileSync('game8_moves.json', 'utf-8'));
  
  // Game8 moves (extract from array)
  // According to the output, the actual moves are approximately index 18 to 507.
  // We can just filter the strings against sv.json moves to be safe.
  const learnsetsOriginal = JSON.parse(fs.readFileSync('src/data/learnsets.json', 'utf-8'));
  const allKnownSVMoveNames = new Set();
  for (const moves of Object.values(learnsetsOriginal)) {
    for (const m of moves) allKnownSVMoveNames.add(m);
  }
  
  // Also add anything that might be new in champions but is in the game8 list
  // Just collect everything that doesn't contain "技" or "一覧" and looks like a move.
  const game8Moves = new Set();
  const excludeList = ['TOP', '内定ポケモン', '育成論', '最強ポケモン', '最強パーティ', '上位構築まとめ', '使用率ランキング', 'ダメージ計算', '素早さ早見表', 'M-1上位構築まとめ', '育成論一覧【144匹公開】', '最強メガシンカ', 'ダメージ計算機', '構築管理ツール', 'ランクマM-2開始！', 'チャンピオン級のボーダー', '技（わざ）一覧', '関連記事'];
  
  for (const item of game8.moves1) {
    if (excludeList.includes(item)) continue;
    if (item.includes('技') || item.includes('まとめ') || item.includes('一覧')) continue;
    game8Moves.add(item);
  }
  
  // Let's create an exhaustive list of all move names for parsing the raw string
  const exhaustiveMoves = Array.from(new Set([...allKnownSVMoveNames, ...game8Moves]));
  // Sort by length descending to match longest first (e.g. 10まんボルト over ボルト)
  exhaustiveMoves.sort((a, b) => b.length - a.length);

  function parseRawMoves(str) {
    if (!str) return [];
    let remaining = str;
    const foundMoves = [];
    while (remaining.length > 0) {
      let matched = false;
      for (const move of exhaustiveMoves) {
        if (remaining.startsWith(move)) {
          foundMoves.push(move);
          remaining = remaining.substring(move.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        console.warn(`Could not parse the rest of string: ${remaining}`);
        break; // break to avoid infinite loop
      }
    }
    return foundMoves;
  }

  // Update learnsets
  const learnsets = JSON.parse(fs.readFileSync('src/data/learnsets.json', 'utf-8'));
  
  const moveChangesList = yakkun.moveChanges;
  const pokemonChanges = yakkun.pokemonChanges;
  
  const processedPokemonChanges = {};
  for (const [pokemon, changes] of Object.entries(pokemonChanges)) {
    const added = [...changes.added];
    if (changes.addedRaw) {
      added.push(...parseRawMoves(changes.addedRaw));
    }
    processedPokemonChanges[pokemon] = {
      added,
      removed: changes.removed || []
    };
  }

  // Now filter the learnsets:
  // 1. Apply added/removed
  // 2. Filter out moves NOT in game8Moves (assuming game8Moves is our source of truth for implemented moves)
  for (const [pokemon, moves] of Object.entries(learnsets)) {
    let currentMoves = new Set(moves);
    const changes = processedPokemonChanges[pokemon];
    
    // Some pokemon might have slightly different names in yakkun vs sv.json (e.g. ウインディ(ヒスイ) vs ウインディ(ヒスイのすがた))
    // Let's do a fuzzy match or hardcode later if necessary. For now we use direct match.
    // To handle suffixes like (アローラ):
    let matchKey = pokemon;
    if (!changes) {
      const altKey1 = pokemon.replace('のすがた', '').replace('のフォルム', '');
      if (processedPokemonChanges[altKey1]) matchKey = altKey1;
    }
    
    if (processedPokemonChanges[matchKey]) {
      const pc = processedPokemonChanges[matchKey];
      for (const rm of pc.removed) currentMoves.delete(rm);
      for (const add of pc.added) currentMoves.add(add);
    }
    
    // Do not filter out unimplemented moves here, so we can toggle them in UI
    learnsets[pokemon] = [...currentMoves];
  }
  
  // Create an exhaustive list of unimplemented moves
  const allMovesInMovesJson = JSON.parse(fs.readFileSync('src/data/moves.json', 'utf-8')).map(m => m.name);
  const unimplementedMovesList = allMovesInMovesJson.filter(m => !game8Moves.has(m));
  
  fs.writeFileSync('src/data/learnsets.json', JSON.stringify(learnsets, null, 2));
  fs.writeFileSync('src/data/unimplemented_moves.json', JSON.stringify(unimplementedMovesList, null, 2));
  fs.writeFileSync('champions_move_changes.json', JSON.stringify(moveChangesList, null, 2));
  
  console.log('Learnsets processed. Valid moves count:', game8Moves.size, 'Unimplemented:', unimplementedMovesList.length);
}

processData();
