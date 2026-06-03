import React, { useState } from 'react';
import { X, Shield, Zap, Target, Activity, Heart, Swords } from 'lucide-react';
import movesData from '../data/moves.json';

const TypeBadge = ({ type }: { type: string }) => {
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
  moves: (string | null)[];
}

interface Props {
  pokemon: MyPokemon;
  onSave: (updated: MyPokemon) => void;
  onClose: () => void;
}

export const NATURES = [
  "いじっぱり (攻↑ 特攻↓)", "やんちゃ (攻↑ 特防↓)", "ゆうかん (攻↑ 速↓)", "さみしがり (攻↑ 防↓)",
  "ひかえめ (特攻↑ 攻↓)", "おっとり (特攻↑ 防↓)", "れいせい (特攻↑ 速↓)", "うっかりや (特攻↑ 特防↓)",
  "おくびょう (速↑ 攻↓)", "せっかち (速↑ 防↓)", "ようき (速↑ 特攻↓)", "むじゃき (速↑ 特防↓)",
  "ずぶとい (防↑ 攻↓)", "のんき (防↑ 速↓)", "わんぱく (防↑ 特攻↓)", "のうてんき (防↑ 特防↓)",
  "おだやか (特防↑ 攻↓)", "おとなしい (特防↑ 防↓)", "なまいき (特防↑ 速↓)", "しんちょう (特防↑ 特攻↓)",
  "てれや (補正なし)", "がんばりや (補正なし)", "すなお (補正なし)", "きまぐれ (補正なし)", "まじめ (補正なし)"
];

const statLabels = [
  { key: 'hp', label: 'HP', icon: <Heart className="w-4 h-4 text-green-500" /> },
  { key: 'attack', label: '攻撃', icon: <Swords className="w-4 h-4 text-red-500" /> },
  { key: 'defense', label: '防御', icon: <Shield className="w-4 h-4 text-orange-500" /> },
  { key: 'spAttack', label: '特攻', icon: <Target className="w-4 h-4 text-purple-500" /> },
  { key: 'spDefense', label: '特防', icon: <Activity className="w-4 h-4 text-blue-500" /> },
  { key: 'speed', label: '素早', icon: <Zap className="w-4 h-4 text-yellow-500" /> }
] as const;

export const PokemonDetailModal: React.FC<Props> = ({ pokemon, onSave, onClose }) => {
  const [evs, setEvs] = useState<Stats>({ ...pokemon.evs });
  const [nature, setNature] = useState(pokemon.nature || NATURES[0]);
  const [ability, setAbility] = useState(pokemon.ability || pokemon.base.abilities[0]);
  const [moves, setMoves] = useState<(string | null)[]>(pokemon.moves || [null, null, null, null]);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState('');

  const getFilteredMoves = (query: string) => {
    if (!query) return [];
    const normalized = hiraToKata(query);
    return movesData.filter(m => m.name.includes(normalized)).slice(0, 30);
  };

  const totalEVs = Object.values(evs).reduce((a, b) => a + b, 0);
  const remainingEVs = 508 - totalEVs;

  const handleSmartEvClick = (statKey: keyof Stats) => {
    if (evs[statKey] === 252) {
      // 既に252ならリセット（トグル機能）
      setEvs({ ...evs, [statKey]: 0 });
      return;
    }
    
    const available = remainingEVs + evs[statKey]; // このステータスに振れる最大値
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center">
            {pokemon.base.name} の詳細設定
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 特性 & 性格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">特性</label>
              <select 
                value={ability} 
                onChange={e => setAbility(e.target.value)}
                className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
              >
                {pokemon.base.abilities.map(a => <option key={a} value={a}>{a}</option>)}
                {pokemon.base.hiddenAbilities.map(a => <option key={a} value={a}>{a} (夢)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">性格</label>
              <select 
                value={nature} 
                onChange={e => setNature(e.target.value)}
                className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
              >
                {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          
          {/* 技選択 */}
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

          {/* 努力値スマート入力 */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">努力値 (EVs)</label>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${remainingEVs === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                残り: {remainingEVs}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">ボタンをタップで限界まで振れます。もう一度タップで0に戻ります。</p>
            
            <div className="space-y-3">
              {statLabels.map(({ key, label, icon }) => (
                <div key={key} className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSmartEvClick(key)}
                    className={`flex-shrink-0 w-16 py-1.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      evs[key] > 0 
                        ? evs[key] >= 252 ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                    }`}
                  >
                    {icon} {label}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="252" step="4"
                    value={evs[key]} 
                    onChange={e => handleEvChange(key, parseInt(e.target.value))}
                    className="flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input 
                    type="number" 
                    value={evs[key]} 
                    onChange={e => handleEvChange(key, parseInt(e.target.value))}
                    className="w-14 p-1 text-center text-sm font-bold bg-slate-50 border border-slate-200 rounded focus:border-indigo-400 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>



        <div className="p-4 bg-slate-50 border-t">
          <button 
            onClick={() => {
              onSave({ ...pokemon, evs, nature, ability, moves });
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
