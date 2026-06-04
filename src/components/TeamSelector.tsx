import React from 'react';
import { Plus, X, Search } from 'lucide-react';
import { MyPokemon, Pokemon, TypeBadge } from './PokemonDetailModal';
import megaIds from '../data/megaIds.json';

interface TeamSelectorProps {
  team: (MyPokemon | null)[];
  activeIndex: number;
  onSelectActive: (index: number) => void;
  onAddPokemon: (index: number, basePokemon: Pokemon) => void;
  onRemovePokemon: (index: number) => void;
  pokemonData: Pokemon[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOpponent?: boolean;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  team,
  activeIndex,
  onSelectActive,
  onAddPokemon,
  onRemovePokemon,
  pokemonData,
  searchQuery,
  onSearchChange,
  isOpponent = false
}) => {
  const [addingIndex, setAddingIndex] = React.useState<number | null>(null);
  
  const hiraToKata = (str: string) => {
    return str.replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
  };
  
  const filteredPokemon = React.useMemo(() => {
    if (!searchQuery) return [];
    const normalized = hiraToKata(searchQuery);
    return pokemonData.filter(p => p.name.startsWith(normalized)).slice(0, 8);
  }, [searchQuery, pokemonData]);

  return (
    <div className={`p-3 rounded-xl shadow-sm border ${isOpponent ? 'bg-rose-50/50 border-rose-200' : 'bg-indigo-50/50 border-indigo-200'}`}>
      <div className="flex gap-2 overflow-x-auto py-2 px-2 snap-x">
        {team.map((poke, i) => (
          <div key={i} className="flex-shrink-0 snap-start relative">
            {poke ? (
              <div 
                onClick={() => onSelectActive(i)}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all bg-white
                  ${activeIndex === i 
                    ? (isOpponent ? 'border-rose-500 ring-2 ring-rose-200 shadow-md scale-110' : 'border-indigo-500 ring-2 ring-indigo-200 shadow-md scale-110') 
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'}`}
              >
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(megaIds as any)[poke.base.name] || poke.base.id}.png`}
                  alt={poke.base.name}
                  className="w-10 h-10 object-contain"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemovePokemon(i); }}
                  className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-red-600 z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => {
                  setAddingIndex(i);
                  onSearchChange('');
                }}
                className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
                  ${addingIndex === i 
                    ? (isOpponent ? 'border-rose-500 bg-rose-100' : 'border-indigo-500 bg-indigo-100')
                    : 'border-slate-300 bg-white/50 hover:bg-white hover:border-slate-400'}`}
              >
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {addingIndex !== null && (
        <div className="mt-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="relative">
            <input
              autoFocus
              type="text"
              className={`w-full p-2.5 pl-9 pr-12 border-2 rounded-xl text-sm font-medium outline-none transition-all
                ${isOpponent 
                  ? 'border-rose-100 bg-rose-50 text-slate-700 focus:ring-4 focus:ring-rose-100 focus:border-rose-300 placeholder:text-rose-300'
                  : 'border-indigo-100 bg-indigo-50 text-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 placeholder:text-indigo-300'}`}
              placeholder="追加するポケモン名..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className={`w-4 h-4 absolute left-3 top-3.5 ${isOpponent ? 'text-rose-400' : 'text-indigo-400'}`} />
            <button 
              onClick={() => setAddingIndex(null)}
              className="absolute right-3 top-2.5 text-slate-400 p-1 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {searchQuery && filteredPokemon.length > 0 && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-[100]">
                {filteredPokemon.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                    onClick={() => {
                      onAddPokemon(addingIndex, p);
                      setAddingIndex(null);
                      onSearchChange('');
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                          alt=""
                          className="w-8 h-8 object-contain"
                        />
                        <span className="font-bold text-slate-700">{p.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {p.types.map(t => <TypeBadge key={t} type={t} />)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
