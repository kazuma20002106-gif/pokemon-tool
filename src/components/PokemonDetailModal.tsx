import React, { useState } from 'react';
import { X, Shield, Zap, Target, Activity, Heart, Swords } from 'lucide-react';
import movesData from '../data/moves.json';

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
                    {movesData.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              ))}
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


        <datalist id="all-moves-list">
          {movesData.map(m => <option key={m.name} value={`${m.name} - ${m.type}`} />)}
        </datalist>
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
