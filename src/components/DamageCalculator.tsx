import React, { useMemo } from 'react';
import { Pokemon, MyPokemon } from './PokemonDetailModal';
import { calculateDamage, getEffectiveness } from '../utils/damageCalc';
import { calculateStat, getNatureMultiplier } from '../utils/statsCalc';
import movesData from '../data/moves.json';

interface Props {
  myTeam: (MyPokemon | null)[];
  opponent: Pokemon;
}

export const DamageCalculator: React.FC<Props> = ({ myTeam, opponent }) => {
  // Opponent defensive stats (assume 252 HP / 0 Def / 0 SpD as default for MVP, or just H252)
  // HP: 252 EV, Def/SpD: 0 EV, Nature: 1.0
  const oppMaxHp = calculateStat(opponent.stats.hp, 31, 252, 50, 1.0, true);
  const oppDef = calculateStat(opponent.stats.defense, 31, 0, 50, 1.0, false);
  const oppSpDef = calculateStat(opponent.stats.spDefense, 31, 0, 50, 1.0, false);

  const teamWithMoves = myTeam.filter(p => p !== null && p.moves && p.moves.some(m => m !== null)) as MyPokemon[];

  if (teamWithMoves.length === 0) {
    return (
      <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl">
        <h4 className="text-sm font-bold text-slate-600 mb-2">ダメージ計算 (対H252振り想定)</h4>
        <p className="text-xs text-slate-500">マイパーティのポケモンに技を設定すると、ここにダメージ計算結果が表示されます。</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl">
      <div className="flex justify-between items-end mb-3">
        <h4 className="text-sm font-bold text-slate-700">与ダメージ計算</h4>
        <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
          相手想定: H252 / B0 / D0
        </span>
      </div>
      
      <div className="space-y-3">
        {teamWithMoves.map((myPoke, i) => {
          const validMoves = myPoke.moves.filter(m => m !== null) as string[];
          if (validMoves.length === 0) return null;

          return (
            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center border-b border-slate-100 pb-2">
                <span className="truncate">{myPoke.base.name}</span>
                <span className="text-[10px] ml-2 font-normal text-slate-400 border border-slate-200 px-1 rounded">からの攻撃</span>
              </div>
              
              <div className="space-y-2">
                {validMoves.map((moveName, j) => {
                  const moveData = movesData.find(m => m.name === moveName);
                  if (!moveData || moveData.category === "変化" || !moveData.power) {
                    return (
                      <div key={j} className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{moveName}</span>
                        <span>(変化技 / ダメージなし)</span>
                      </div>
                    );
                  }

                  const isPhysical = moveData.category === "物理";
                  const attackBase = isPhysical ? myPoke.base.stats.attack : myPoke.base.stats.spAttack;
                  const attackEv = isPhysical ? myPoke.evs.attack : myPoke.evs.spAttack;
                  const attackMult = getNatureMultiplier(myPoke.nature, isPhysical ? 'attack' : 'spAttack');
                  
                  const actualAttack = calculateStat(attackBase, 31, attackEv, 50, attackMult, false);
                  const targetDef = isPhysical ? oppDef : oppSpDef;

                  const damage = calculateDamage(
                    50,
                    moveData.power,
                    actualAttack,
                    targetDef,
                    moveData.type,
                    myPoke.base.types,
                    opponent.types,
                    oppMaxHp
                  );

                  let resultColor = "text-slate-600";
                  if (damage.minPercent >= 100) resultColor = "text-red-600";
                  else if (damage.maxPercent >= 100) resultColor = "text-orange-500";
                  else if (damage.minPercent >= 50) resultColor = "text-blue-600";

                  return (
                    <div key={j} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{moveName} <span className="text-[10px] text-slate-400 ml-1 font-normal">({moveData.type} / 威力{moveData.power})</span></span>
                        <span className={`font-black ${resultColor}`}>{damage.hitsToKO}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mr-3 overflow-hidden flex">
                           <div className="bg-red-500 h-1.5" style={{ width: `${Math.min(100, damage.minPercent)}%` }}></div>
                           <div className="bg-orange-300 h-1.5" style={{ width: `${Math.min(100, damage.maxPercent) - Math.min(100, damage.minPercent)}%` }}></div>
                        </div>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap min-w-[70px] text-right">
                          {damage.minDamage} ~ {damage.maxDamage}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
