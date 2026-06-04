import React, { useState } from 'react';
import { X, Shield, Zap, Target, Activity, Heart, Swords, Info, ChevronDown } from 'lucide-react';
import movesData from '../data/moves.json';
import learnsetsData from '../data/learnsets.json';
import unimplementedMovesData from '../data/unimplemented_moves.json';
import abilitiesData from '../data/abilities.json';

const learnsets = learnsetsData as Record<string, string[]>;
const unimplementedMoves = unimplementedMovesData as string[];
const abilitiesDict = abilitiesData as Record<string, string>;

const ClickTooltip = ({ text, className = "w-48" }: { text: string, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-[60] text-left font-normal leading-relaxed pointer-events-none`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export const TypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    'ノーマル': 'bg-stone-400', 'ほのお': 'bg-red-500', 'みず': 'bg-blue-500', 'くさ': 'bg-green-500',
    'でんき': 'bg-yellow-400', 'こおり': 'bg-cyan-300', 'かくとう': 'bg-orange-600', 'どく': 'bg-purple-500',
    'じめん': 'bg-amber-600', 'ひこう': 'bg-sky-400', 'エスパー': 'bg-pink-500', 'むし': 'bg-lime-500',
    'いわ': 'bg-yellow-600', 'ゴースト': 'bg-violet-600', 'ドラゴン': 'bg-indigo-600', 'あく': 'bg-zinc-700',
    'はがね': 'bg-slate-400', 'フェアリー': 'bg-pink-300'
  };
  return (
    <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-sm ${colors[type] || 'bg-slate-400'}`}>
      {type}
    </span>
  );
};

const hiraToKata = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, match => 
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
};

export interface Stats { hp: number; attack: number; defense: number; spAttack: number; spDefense: number; speed: number; }
export interface Pokemon { 
  id: number; 
  name: string; 
  types: string[]; 
  abilities: string[]; 
  hiddenAbilities: string[]; 
  stats: Stats; 
  availableIn?: string[];
}

export interface MyPokemon {
  base: Pokemon;
  evs: Stats;
  nature: string;
  ability: string;
  item?: string;
  moves: (string | null)[];
}

export const NATURES = [
  // 攻撃↑
  "いじっぱり (攻↑ 特攻↓)", "さみしがり (攻↑ 防↓)", "やんちゃ (攻↑ 特防↓)", "ゆうかん (攻↑ 速↓)",
  // 防御↑
  "ずぶとい (防↑ 攻↓)", "わんぱく (防↑ 特攻↓)", "のうてんき (防↑ 特防↓)", "のんき (防↑ 速↓)",
  // 特攻↑
  "ひかえめ (特攻↑ 攻↓)", "おっとり (特攻↑ 防↓)", "うっかりや (特攻↑ 特防↓)", "れいせい (特攻↑ 速↓)",
  // 特防↑
  "おだやか (特防↑ 攻↓)", "おとなしい (特防↑ 防↓)", "しんちょう (特防↑ 特攻↓)", "なまいき (特防↑ 速↓)",
  // 素早さ↑
  "おくびょう (速↑ 攻↓)", "せっかち (速↑ 防↓)", "ようき (速↑ 特攻↓)", "むじゃき (速↑ 特防↓)",
  // 補正なし
  "てれや (補正なし)", "がんばりや (補正なし)", "すなお (補正なし)", "きまぐれ (補正なし)", "まじめ (補正なし)"
];

import itemsData from '../data/items.json';

const itemsDict = itemsData as Record<string, string>;
export const ITEMS = ["なし", ...Object.keys(itemsDict).sort((a, b) => a.localeCompare(b, "ja"))];

const statLabels = [
  { key: 'hp', label: 'HP', icon: <Heart className="w-4 h-4 text-green-500" /> },
  { key: 'attack', label: '攻撃', icon: <Swords className="w-4 h-4 text-red-500" /> },
  { key: 'defense', label: '防御', icon: <Shield className="w-4 h-4 text-orange-500" /> },
  { key: 'spAttack', label: '特攻', icon: <Target className="w-4 h-4 text-purple-500" /> },
  { key: 'spDefense', label: '特防', icon: <Activity className="w-4 h-4 text-blue-500" /> },
  { key: 'speed', label: '素早', icon: <Zap className="w-4 h-4 text-yellow-500" /> }
] as const;

interface Props {
  pokemon: MyPokemon;
  onSave: (updated: MyPokemon) => void;
  onClose: () => void;
}

export const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose }) => {
  const [evs, setEvs] = useState<Stats>({ ...pokemon.evs });
  const [nature, setNature] = useState(pokemon.nature || NATURES[0]);
  const [ability, setAbility] = useState(pokemon.ability || pokemon.base.abilities[0]);
  const [item, setItem] = useState(pokemon.item || "なし");
  const [moves, setMoves] = useState<(string | null)[]>(pokemon.moves || [null, null, null, null]);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState('');
  const [activeItemSearch, setActiveItemSearch] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [activeNatureSelect, setActiveNatureSelect] = useState(false);
  const [showUnimplemented, setShowUnimplemented] = useState(false);

  const getFilteredMoves = (query: string) => {
    let availableMoves = movesData;
    
    const myLearnset = learnsets[pokemon.base.name];
    if (myLearnset && myLearnset.length > 0) {
      availableMoves = movesData.filter(m => myLearnset.includes(m.name));
    }

    if (!showUnimplemented) {
      availableMoves = availableMoves.filter(m => !unimplementedMoves.includes(m.name));
    }

    if (!query) return [];
    
    const normalizedQuery = hiraToKata(query);
    return availableMoves
      .filter(m => hiraToKata(m.name).startsWith(normalizedQuery))
      .slice(0, 30);
  };

  const totalEVs = Object.values(evs).reduce((a, b) => a + b, 0);
  const remainingEVs = 508 - totalEVs;

  const handleSmartEvClick = (statKey: keyof Stats) => {
    if (evs[statKey] === 252) {
      setEvs({ ...evs, [statKey]: 0 });
      return;
    }
    
    const available = remainingEVs + evs[statKey];
    const amountToAdd = Math.min(252, available);
    
    setEvs({ ...evs, [statKey]: amountToAdd });
  };

  const handleEvChange = (statKey: keyof Stats, value: number) => {
    const safeVal = Math.min(252, Math.max(0, value));
    const otherTotal = totalEVs - evs[statKey];
    if (otherTotal + safeVal <= 508) {
      setEvs({ ...evs, [statKey]: safeVal });
    } else {
      setEvs({ ...evs, [statKey]: 508 - otherTotal });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] overflow-y-auto">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl animate-[slideUp_0.3s_ease-out] my-auto h-fit relative">
        <div className="p-4 bg-slate-100 border-b flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-slate-800 flex items-center">
            {pokemon.base.name} の詳細設定
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 pb-12">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="flex items-center text-xs font-bold text-slate-500 mb-1">
                特性
                {abilitiesDict[ability] && (
                  <ClickTooltip text={abilitiesDict[ability]} className="w-56" />
                )}
              </label>
              <select 
                value={ability} 
                onChange={e => setAbility(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
              >
                {pokemon.base.abilities.map(a => <option key={a} value={a}>{a}</option>)}
                {pokemon.base.hiddenAbilities.map(a => <option key={a} value={a}>{a} (夢)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <div className="relative">
                <button 
                  onClick={() => setActiveNatureSelect(!activeNatureSelect)}
                  className="w-full p-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-left flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                    <span className="font-bold text-slate-700">{nature.split(' ')[0]}</span>
                    {nature.includes('↑') ? (
                      <div className="flex gap-1.5">
                        <span className="text-[9px] font-bold text-red-500">{nature.match(/\(([^ ]+)↑/)?.[1]}↑</span>
                        <span className="text-[9px] font-bold text-blue-500">{nature.match(/ ([^ ]+)↓\)/)?.[1]}↓</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400">補正なし</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                </button>
                {activeNatureSelect && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveNatureSelect(false)} />
                    <div className="absolute top-full left-0 min-w-full w-max mt-1 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] max-h-48 overflow-y-auto">
                      {NATURES.map(n => (
                        <div 
                          key={n}
                          onClick={() => {
                            setNature(n);
                            setActiveNatureSelect(false);
                          }}
                          className={`px-3 py-2 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 flex justify-between items-center gap-4 whitespace-nowrap ${nature === n ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'}`}
                        >
                          <span>{n.split(' ')[0]}</span>
                          {n.includes('↑') ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-red-500">{n.match(/\(([^ ]+)↑/)?.[1]}↑</span>
                              <span className="text-[9px] font-bold text-blue-500">{n.match(/ ([^ ]+)↓\)/)?.[1]}↓</span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">補正なし</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1">もちもの</label>
              <div className="relative">
                <input
                  value={activeItemSearch ? itemSearchQuery : item}
                  onChange={e => {
                    setItemSearchQuery(e.target.value);
                    if (!activeItemSearch) setActiveItemSearch(true);
                  }}
                  onFocus={(e) => {
                    setActiveItemSearch(true);
                    setItemSearchQuery(item === "なし" ? "" : item);
                    e.target.select();
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setActiveItemSearch(false);
                      setItemSearchQuery(item);
                    }, 200);
                  }}
                  className="w-full p-2 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400"
                  placeholder="検索..."
                />
                {activeItemSearch && itemSearchQuery && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setItemSearchQuery('');
                      setItem("なし");
                    }}
                    className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {activeItemSearch && (
                <div className="absolute bottom-full mb-1 left-0 z-[100] w-[150%] max-w-[240px] bg-slate-800 text-white rounded-xl shadow-2xl max-h-60 overflow-y-auto border border-slate-700">
                  {ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery))).map(i => (
                    <button
                      key={i}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700 border-b border-slate-700/50 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setItem(i);
                        setActiveItemSearch(false);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                  {ITEMS.filter(i => hiraToKata(i).includes(hiraToKata(itemSearchQuery))).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">見つかりません</div>
                  )}
                </div>
              )}
              {item !== "なし" && !activeItemSearch && itemsDict[item] && (
                <div className="absolute top-full mt-1 left-0 w-[150%] max-w-[240px] z-40 text-[10px] text-slate-600 bg-white border border-slate-200 shadow-lg p-2 rounded-lg line-clamp-2">
                  {itemsDict[item]}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500">技 (最大4つ)</label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showUnimplemented}
                  onChange={e => setShowUnimplemented(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                <span className="ml-2 text-[10px] font-bold text-slate-500">未実装技も表示</span>
              </label>
            </div>
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
                        onFocus={(e) => {
                          setActiveMoveIndex(index);
                          setMoveSearchQuery(moves[index] || '');
                          e.target.select();
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            if (activeMoveIndex === index) setActiveMoveIndex(null);
                          }, 200);
                        }}
                        placeholder="技を検索..."
                        className={`w-full p-2 pl-2 ${currentMoveData && !isActive ? 'pr-14' : 'pr-8'} text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 placeholder:text-slate-400`}
                      />
                      {currentMoveData && !isActive && (
                        <div className="absolute right-7 top-2 pointer-events-none scale-75 origin-right">
                          <TypeBadge type={currentMoveData.type} />
                        </div>
                      )}
                      {moves[index] && (
                        <button 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const newMoves = [...moves];
                            newMoves[index] = null;
                            setMoves(newMoves);
                            setMoveSearchQuery('');
                          }}
                          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isActive && moveSearchQuery && (
                      <div className={`absolute z-[100] w-[200%] sm:w-[150%] max-w-[280px] ${index % 2 === 1 ? 'right-0' : 'left-0'} ${'bottom-[calc(100%+8px)] flex-col'} bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] max-h-48 overflow-y-auto flex`}>
                        {getFilteredMoves(moveSearchQuery).length > 0 ? (
                          (index < 2 ? getFilteredMoves(moveSearchQuery) : [...getFilteredMoves(moveSearchQuery)].reverse()).map(m => (
                            <button
                              key={m.name}
                              className="w-full text-left p-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center text-sm transition-colors"
                              onMouseDown={(e) => { e.preventDefault(); }}
                              onClick={() => {
                                const newMoves = [...moves];
                                newMoves[index] = m.name;
                                setMoves(newMoves);
                                setActiveMoveIndex(null);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{m.name}</span>
                                <TypeBadge type={m.type} />
                              </div>
                              {unimplementedMoves.includes(m.name) && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded ml-2">未実装</span>
                              )}
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

          <div>
            <div className="flex items-end justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">努力値 (EVs)</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${remainingEVs === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                残り: {remainingEVs}
              </span>
            </div>
            
            <div className="space-y-3">
              {statLabels.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSmartEvClick(key as keyof Stats)}
                    className={`flex-shrink-0 w-16 py-1.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      evs[key as keyof Stats] > 0 
                        ? evs[key as keyof Stats] >= 252 ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {icon} {label}
                  </button>
                  <div className="flex-1 px-4">
                    <input
                      type="range"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="252"
                      step="4"
                      value={evs[key as keyof Stats]}
                      onChange={(e) => handleEvChange(key as keyof Stats, Number(e.target.value))}
                      className="w-16 p-1.5 text-center text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t">
          <button 
            onClick={() => {
              onSave({ ...pokemon, evs, nature, ability, item, moves });
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold shadow-md active:scale-[0.98] transition-transform"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
};
