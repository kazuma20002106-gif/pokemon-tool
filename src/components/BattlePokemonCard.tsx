import React from 'react';
import { Zap } from 'lucide-react';
import megaIds from '../data/megaIds.json';
import { MyPokemon, Pokemon } from './PokemonDetailModal';
import { BattleStatRanks } from '../App';


interface BattlePokemonCardProps {
  pokemon: MyPokemon;
  basePokemonData: Pokemon;
  ranks: BattleStatRanks;
  onRankChange: (stat: keyof BattleStatRanks, value: number) => void;
  onEdit: () => void;
  isOpponent?: boolean;
  megaEvolutions?: Pokemon[];
  onMegaEvolution?: (mega: Pokemon) => void;
  onRevertMega?: () => void;
}

const StatBar = ({ label, value, max = 255 }: { label: string, value: number, max?: number }) => (
  <div className="flex items-center text-[10px]">
    <span className="w-8 font-bold text-slate-500">{label}</span>
    <span className="w-6 text-right mr-2 text-slate-700">{value}</span>
    <div className="flex-grow h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-pokemon-red to-orange-400 rounded-full"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);

const RankSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded border border-slate-200 px-1 py-0.5">
      <span className="text-[9px] font-bold text-slate-500 w-5">{label}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(value - 1)} disabled={value <= -6} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">-</button>
        <span className={`text-[10px] font-bold w-3 text-center ${value > 0 ? 'text-red-500' : value < 0 ? 'text-blue-500' : 'text-slate-700'}`}>
          {value > 0 ? `+${value}` : value}
        </span>
        <button onClick={() => onChange(value + 1)} disabled={value >= 6} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">+</button>
      </div>
    </div>
  );
};


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

export const BattlePokemonCard: React.FC<BattlePokemonCardProps> = ({
  pokemon,
  basePokemonData,
  ranks,
  onRankChange,
  onEdit,
  isOpponent = false,
  megaEvolutions = [],
  onMegaEvolution,
  onRevertMega
}) => {
  const isMega = basePokemonData.name.includes('メガ');

  return (
    <div className={`rounded-xl p-3 shadow-sm border ${isOpponent ? 'bg-rose-50 border-rose-200' : 'bg-indigo-50 border-indigo-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${(megaIds as any)[basePokemonData.name] || basePokemonData.id}.png`}
              alt={basePokemonData.name}
              className="w-14 h-14 drop-shadow-md bg-white rounded-full border border-slate-200"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-800">{basePokemonData.name}</h3>
              <button onClick={onEdit} className="text-[9px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm border border-slate-200">
                ステータス・技を変更
              </button>
            </div>
            <div className="flex gap-1 mt-1">
              {pokemon.base.types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-[10px]">
          <span className="font-bold text-slate-500">特性:</span> <span className="font-bold text-slate-700">{pokemon.ability || 'なし'}</span>
        </div>
        <div className="text-[10px]">
          <span className="font-bold text-slate-500">道具:</span> <span className="font-bold text-slate-700">{pokemon.item || 'なし'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2 bg-white/50 p-2 rounded-lg">
        <StatBar label="H" value={basePokemonData.stats.hp} max={255} />
        <StatBar label="A" value={basePokemonData.stats.attack} max={200} />
        <StatBar label="B" value={basePokemonData.stats.defense} max={200} />
        <StatBar label="C" value={basePokemonData.stats.spAttack} max={200} />
        <StatBar label="D" value={basePokemonData.stats.spDefense} max={200} />
        <StatBar label="S" value={basePokemonData.stats.speed} max={200} />
      </div>

      <div className="grid grid-cols-5 gap-1">
        <RankSelector label="攻撃" value={ranks.attack} onChange={(v) => onRankChange('attack', v)} />
        <RankSelector label="防御" value={ranks.defense} onChange={(v) => onRankChange('defense', v)} />
        <RankSelector label="特攻" value={ranks.spAttack} onChange={(v) => onRankChange('spAttack', v)} />
        <RankSelector label="特防" value={ranks.spDefense} onChange={(v) => onRankChange('spDefense', v)} />
        <RankSelector label="素早" value={ranks.speed} onChange={(v) => onRankChange('speed', v)} />
      </div>

      {megaEvolutions.length > 0 && onMegaEvolution && (
        <div className="flex gap-2 mt-2">
          {!isMega ? megaEvolutions.map(mega => (
            <button
              key={mega.id}
              onClick={() => onMegaEvolution(mega)}
              className="px-2 py-1 bg-gradient-to-r from-slate-700 to-slate-900 text-white text-[9px] font-bold rounded shadow-sm hover:from-slate-600 hover:to-slate-800 flex items-center"
            >
              <Zap className="w-3 h-3 mr-1 text-yellow-400" />
              {mega.name} に切り替え
            </button>
          )) : onRevertMega && (
            <button
              onClick={onRevertMega}
              className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-bold rounded shadow-sm hover:bg-slate-300 flex items-center"
            >
              元の姿に戻す
            </button>
          )}
        </div>
      )}
    </div>
  );
};
