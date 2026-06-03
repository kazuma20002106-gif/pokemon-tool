const fs = require('fs');

// 1. Update PokemonDetailModal.tsx
let modal = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');

// Add moves to MyPokemon interface
modal = modal.replace(
  'export interface MyPokemon {\n  base: Pokemon;\n  evs: Stats;\n  nature: string;\n  ability: string;\n}',
  'export interface MyPokemon {\n  base: Pokemon;\n  evs: Stats;\n  nature: string;\n  ability: string;\n  moves: (string | null)[];\n}'
);

// Add moves state
modal = modal.replace(
  '  const [ability, setAbility] = useState(pokemon.ability || pokemon.base.abilities[0]);\n\n  const totalEVs =',
  `  const [ability, setAbility] = useState(pokemon.ability || pokemon.base.abilities[0]);\n  const [moves, setMoves] = useState<(string | null)[]>(pokemon.moves || [null, null, null, null]);\n\n  const totalEVs =`
);

// Add Move Select UI above EVs
const moveUI = `
          {/* 技選択 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">技 (最大4つ)</label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(index => (
                <div key={index} className="relative">
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
                    {/* TO DO: Import moves.json and populate here */}
                  </select>
                </div>
              ))}
            </div>
          </div>
`;

modal = modal.replace(
  '{/* 努力値',
  moveUI + '\n          {/* 努力値'
);

// Update save payload
modal = modal.replace(
  'onSave({ ...pokemon, evs, nature, ability });',
  'onSave({ ...pokemon, evs, nature, ability, moves });'
);

// Add import for moves
if (!modal.includes('import movesData')) {
    modal = modal.replace(
        "import { X, Shield, Zap, Target, Activity, Heart, Swords } from 'lucide-react';",
        "import { X, Shield, Zap, Target, Activity, Heart, Swords } from 'lucide-react';\nimport movesData from '../data/moves.json';"
    );
    // Replace the TODO with actual move options
    modal = modal.replace(
        '{/* TO DO: Import moves.json and populate here */}',
        '{movesData.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}'
    );
}

fs.writeFileSync('src/components/PokemonDetailModal.tsx', modal);


// 2. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  '        ability: base.abilities[0]\n      };',
  '        ability: base.abilities[0],\n        moves: [null, null, null, null]\n      };'
);

app = app.replace(
  'const emptyIndex = myTeam.findIndex(p => p === null);',
  'const emptyIndex = myTeam.findIndex(p => p === null);'
);

fs.writeFileSync('src/App.tsx', app);
console.log("Updated UI for moves!");
