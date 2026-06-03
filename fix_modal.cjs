const fs = require('fs');

let modal = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');

// Replace the <select> block
const oldSelectBlock = `
                    <select
                      value={moves[index] || ''}
                      onChange={e => {
                        const newMoves = [...moves];
                        newMoves[index] = e.target.value === '' ? null : e.target.value;
                        setMoves(newMoves);
                      }}
                      className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                    >
                      <option value="">-- 未選択 --</option>
                      {movesData.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
`;

const newSelectBlock = `
                    <div className="relative">
                      <input
                        list="all-moves-list"
                        value={moves[index] || ''}
                        onChange={e => {
                          const newMoves = [...moves];
                          newMoves[index] = e.target.value === '' ? null : e.target.value;
                          setMoves(newMoves);
                        }}
                        placeholder="技を検索..."
                        className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400"
                      />
                      {moves[index] && (
                        <button 
                          onClick={() => {
                            const newMoves = [...moves];
                            newMoves[index] = null;
                            setMoves(newMoves);
                          }}
                          className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
`;

modal = modal.replace(
  oldSelectBlock.trim(),
  newSelectBlock.trim()
);

// Do it for the other occurrences if replace only replaced one (but there's only one in the map)

// Add the datalist outside the modal content, maybe right before the closing </div> of the modal.
const datalistStr = `
        <datalist id="all-moves-list">
          {movesData.map(m => <option key={m.name} value={m.name} />)}
        </datalist>
`;

modal = modal.replace(
  '        <div className="p-4 bg-slate-50 border-t">',
  datalistStr + '        <div className="p-4 bg-slate-50 border-t">'
);

fs.writeFileSync('src/components/PokemonDetailModal.tsx', modal);
console.log("Updated to use datalist for faster rendering and search!");
