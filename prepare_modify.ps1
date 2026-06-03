const fs = require('fs');
let modal = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');

// 1. Add states and helpers
const addImportsAndStates = `
import { Search } from 'lucide-react';

const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    'ノーマル': 'bg-stone-400', 'ほのお': 'bg-red-500', 'みず': 'bg-blue-500', 'くさ': 'bg-green-500',
    'でんき': 'bg-yellow-400', 'こおり': 'bg-cyan-300', 'かくとう': 'bg-orange-600', 'どく': 'bg-purple-500',
    'じめん': 'bg-amber-600', 'ひこう': 'bg-sky-400', 'エスパー': 'bg-pink-500', 'むし': 'bg-lime-500',
    'いわ': 'bg-yellow-600', 'ゴースト': 'bg-violet-600', 'ドラゴン': 'bg-indigo-600', 'あく': 'bg-zinc-700',
    'はがね': 'bg-slate-400', 'フェアリー': 'bg-pink-300'
  };
  return (
    <span className={\`text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm \${colors[type] || 'bg-slate-400'}\`}>
      {type}
    </span>
  );
};

const hiraToKata = (str: string) => {
  return str.replace(/[\\u3041-\\u3096]/g, match => 
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
};
`;

if (!modal.includes('const hiraToKata =')) {
  modal = modal.replace(
    "import { X, Shield, Zap, Target, Activity, Heart, Swords } from 'lucide-react';",
    "import { X, Shield, Zap, Target, Activity, Heart, Swords, Search } from 'lucide-react';"
  );
  modal = modal.replace(
    'export const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose }) => {',
    addImportsAndStates + '\nexport const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose }) => {'
  );
}

const stateToAdd = `
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState('');

  const getFilteredMoves = (query: string) => {
    if (!query) return [];
    const normalized = hiraToKata(query);
    return movesData.filter(m => m.name.includes(normalized)).slice(0, 30);
  };
`;

if (!modal.includes('activeMoveIndex')) {
  modal = modal.replace(
    'const [moves, setMoves] = useState<(string | null)[]>(pokemon.moves || [null, null, null, null]);',
    'const [moves, setMoves] = useState<(string | null)[]>(pokemon.moves || [null, null, null, null]);\n' + stateToAdd
  );
}

// 2. Replace the move input section
const oldMovesSectionPattern = `
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">技 (最大4つ)</label>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(index => (
                <div key={index} className="relative">
                  <input
                    list="all-moves-list"
                    value={moves[index] ? \`\${moves[index]} - \${movesData.find(m => m.name === moves[index])?.type || ''}\` : ''}
                    onChange={e => {
                      const newMoves = [...moves];
                      const rawVal = e.target.value;
                      const parsedMove = rawVal ? rawVal.split(' - ')[0].trim() : null;
                      newMoves[index] = parsedMove;
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
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
`;

const newMovesSection = `
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">技 (最大4つ)</label>
            <div className="grid grid-cols-2 gap-2 relative">
              {[0, 1, 2, 3].map(index => {
                const isActive = activeMoveIndex === index;
                const displayValue = isActive ? moveSearchQuery : (moves[index] || '');
                const currentMoveData = moves[index] ? movesData.find(m => m.name === moves[index]) : null;

                return (
                  <div key={index} className="relative">
                    <div className="relative">
                      <input
                        value={displayValue}
                        onChange={e => {
                          setMoveSearchQuery(e.target.value);
                          if (!isActive) setActiveMoveIndex(index);
                        }}
                        onFocus={() => {
                          setActiveMoveIndex(index);
                          setMoveSearchQuery(moves[index] || '');
                        }}
                        onBlur={() => {
                          // Allow click on dropdown to register first
                          setTimeout(() => {
                            if (activeMoveIndex === index) setActiveMoveIndex(null);
                          }, 200);
                        }}
                        placeholder="技を検索..."
                        className="w-full p-2 pl-2 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400"
                      />
                      {currentMoveData && !isActive && (
                        <div className="absolute right-7 top-2 pointer-events-none scale-75 origin-right">
                          <TypeBadge type={currentMoveData.type} />
                        </div>
                      )}
                      {moves[index] && (
                        <button 
                          onClick={() => {
                            const newMoves = [...moves];
                            newMoves[index] = null;
                            setMoves(newMoves);
                            if (isActive) setMoveSearchQuery('');
                          }}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isActive && moveSearchQuery && (
                      <div className="absolute z-50 w-[200%] sm:w-[150%] max-w-[280px] left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {getFilteredMoves(moveSearchQuery).length > 0 ? (
                          getFilteredMoves(moveSearchQuery).map(m => (
                            <button
                              key={m.name}
                              className="w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center text-sm transition-colors"
                              onMouseDown={(e) => {
                                // Prevent blur from firing before click
                                e.preventDefault();
                              }}
                              onClick={() => {
                                const newMoves = [...moves];
                                newMoves[index] = m.name;
                                setMoves(newMoves);
                                setActiveMoveIndex(null);
                              }}
                            >
                              <span className="font-bold text-slate-700">{m.name}</span>
                              <TypeBadge type={m.type} />
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">見つかりませんでした</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
`;

// It's safer to use a regex or string exact match for replacement. But if the script fails, I'll use multi_replace.
// Let's just do a robust exact match.

// Remove the datalist we added earlier
modal = modal.replace(
  /<datalist id="all-moves-list">[\s\S]*?<\/datalist>/,
  ''
);

// We'll write this script, but execute it and check if it worked. If not, use replace_file_content.
fs.writeFileSync('modify_moves_ui.cjs', \`
const fs = require('fs');
let text = fs.readFileSync('src/components/PokemonDetailModal.tsx', 'utf8');
text = text.replace(${JSON.stringify(oldMovesSectionPattern.trim())}, ${JSON.stringify(newMovesSection.trim())});
fs.writeFileSync('src/components/PokemonDetailModal.tsx', text);
\`);
