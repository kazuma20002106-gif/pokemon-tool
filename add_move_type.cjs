const fs = require('fs');
let modal = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');

// Update onChange handler in PokemonDetailModal.tsx
const oldOnChange = `
                        onChange={e => {
                          const newMoves = [...moves];
                          newMoves[index] = e.target.value === '' ? null : e.target.value;
                          setMoves(newMoves);
                        }}
`;
const newOnChange = `
                        onChange={e => {
                          const newMoves = [...moves];
                          const rawVal = e.target.value;
                          const parsedMove = rawVal ? rawVal.split(' - ')[0].trim() : null;
                          newMoves[index] = parsedMove;
                          setMoves(newMoves);
                        }}
`;
modal = modal.replace(oldOnChange.trim(), newOnChange.trim());

// Update datalist values
const oldDatalist = `
        <datalist id="all-moves-list">
          {movesData.map(m => <option key={m.name} value={m.name} />)}
        </datalist>
`;
const newDatalist = `
        <datalist id="all-moves-list">
          {movesData.map(m => <option key={m.name} value={\`\${m.name} - \${m.type}\`} />)}
        </datalist>
`;
modal = modal.replace(oldDatalist.trim(), newDatalist.trim());

// We also need to fix the input `value` prop to match the format if the move is selected, 
// so the input box shows "冷凍ビーム - こおり".
// Wait, if `moves[index]` is just "冷凍ビーム", how do we show "冷凍ビーム - こおり" in the input?
// `movesData.find(m => m.name === moves[index])` -> \`\${m.name} - \${m.type}\`
const oldInput = `
                      <input
                        list="all-moves-list"
                        value={moves[index] || ''}
`;
const newInput = `
                      <input
                        list="all-moves-list"
                        value={moves[index] ? \`\${moves[index]} - \${movesData.find(m => m.name === moves[index])?.type || ''}\` : ''}
`;
modal = modal.replace(oldInput.trim(), newInput.trim());

fs.writeFileSync('src/components/PokemonDetailModal.tsx', modal);
console.log("Updated move dropdown to include types!");
