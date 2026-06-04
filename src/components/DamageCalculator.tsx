import React, { useState } from 'react';
import { MyPokemon } from './PokemonDetailModal';
import { calculateDamage, getEffectiveness } from '../utils/damageCalc';
import { calculateStat, getNatureMultiplier, applyStatRank } from '../utils/statsCalc';
import movesData from '../data/moves.json';
import { Info, ShieldAlert, Swords } from 'lucide-react';
import { BattleStatRanks } from '../App';

interface Props {
  myTeam: (MyPokemon | null)[];
  activePokemonIndices: number[];
  myBattleRanks: Record<number, BattleStatRanks>;
  opponent: MyPokemon;
  oppRanks: BattleStatRanks;
  weather: string;
}


const InfoTooltip = ({ text, className = "w-48" }: { text: string, className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
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
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${className} p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-20 text-left font-normal leading-relaxed pointer-events-none`}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export const DamageCalculator: React.FC<Props> = ({ myTeam, activePokemonIndices, myBattleRanks, opponent, oppRanks, weather }) => {
  const oppActiveAbility = opponent.ability;
  const oppActiveItem = opponent.item || "なし";
  const battleRanks = myBattleRanks;
  
  const [worstCaseMode, setWorstCaseMode] = useState(false);
  const [baseAssumption, setBaseAssumption] = useState<'h0' | 'h252'>('h252');
  const [worstCaseItem, setWorstCaseItem] = useState(true);

  // 相手のHP（最悪想定 または H252指定の場合は252振り、それ以外は0振り）
  const oppHpEv = worstCaseMode || baseAssumption === 'h252' ? 252 : 0;
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, oppHpEv, 50, 1.0, true);

  const teamWithMoves = myTeam.filter((p, i) => p !== null && activePokemonIndices.includes(i) && p.moves && p.moves.some(m => m !== null)) as MyPokemon[];

  if (teamWithMoves.length === 0) {
    return (
      <div className="mt-4 p-4 border border-slate-200 bg-slate-50 rounded-xl">
        <h4 className="text-sm font-bold text-slate-600 mb-2">ダメージ計算 (対H252振り想定)</h4>
        <p className="text-xs text-slate-500">マイパーティのポケモンに技を設定すると、ここにダメージ計算結果が表示されます。</p>
      </div>
    );
  }

  // ミラーアーマー等いかく無効特性リスト
  const intimidateImmuneAbilities = ["クリアボディ", "しろいけむり", "かいりきバサミ", "ミラーアーマー", "せいしんりょく", "どんかん", "きもったま", "マイペース"];
  const hasIntimidate = oppActiveAbility === "いかく";
  const specialAbilities = ["ばけのかわ", "マルチスケイル", "ファントムガード", "アイスフェイス"];
  const oppSpecialAbility = specialAbilities.includes(oppActiveAbility) ? oppActiveAbility : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-slate-700">
            <Swords className="w-5 h-5 mr-2" />
            <h2 className="font-bold">ダメージ計算</h2>
          </div>
          <button
            onClick={() => setWorstCaseMode(!worstCaseMode)}
            className={`flex items-center px-2 py-1.5 rounded text-[10px] font-bold transition-all shadow-sm ${
               worstCaseMode ? 'bg-red-500 text-white shadow-md border border-red-600' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldAlert className={`w-3 h-3 mr-1 ${worstCaseMode ? 'text-white' : 'text-slate-400'}`} />
            {worstCaseMode ? '最悪想定: ON' : '最悪想定: OFF'}
          </button>
        </div>
        
        {/* モード固有のオプション設定 */}
        <div className="flex justify-end gap-2 mt-1">
          {worstCaseMode ? (
            <button
              onClick={() => setWorstCaseItem(!worstCaseItem)}
              className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm transition-colors ${
                worstCaseItem ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              最悪の道具も考慮: {worstCaseItem ? 'ON' : 'OFF'}
            </button>
          ) : (
            <div className="flex bg-slate-200 rounded p-0.5 shadow-inner">
              <button
                onClick={() => setBaseAssumption('h0')}
                className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${
                  baseAssumption === 'h0' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                ベース: H無振り
              </button>
              <button
                onClick={() => setBaseAssumption('h252')}
                className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${
                  baseAssumption === 'h252' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                ベース: H特化
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 space-y-4">
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-sm font-bold text-slate-700">与ダメージ計算</h4>
          <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            相手想定: {worstCaseMode ? '防御/特防 特化 (技による)' : (baseAssumption === 'h252' ? 'H252 / B0 / D0' : 'H0 / B0 / D0')}
          </span>
        </div>
      
      {oppSpecialAbility && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
          ※ 相手の特性『{oppSpecialAbility}』によるダメージ軽減・無効化は考慮していません。
        </div>
      )}
      
      <div className="space-y-3">
        {teamWithMoves.map((myPoke, i) => {
          const validMoves = myPoke.moves.filter(m => m !== null) as string[];
          if (validMoves.length === 0) return null;

          return (
            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-800 mb-2 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center">
                  <span className="truncate">{myPoke.base.name}</span>
                  <span className="text-[10px] ml-2 font-normal text-slate-400 border border-slate-200 px-1 rounded">からの攻撃</span>
                  {hasIntimidate && !intimidateImmuneAbilities.includes(myPoke.ability) && (
                    <span className="text-[10px] text-red-500 ml-2 mt-1 sm:mt-0 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      ※ 相手の「いかく」で攻撃1段階ダウン
                    </span>
                  )}
                  {hasIntimidate && intimidateImmuneAbilities.includes(myPoke.ability) && (
                    <span className="text-[10px] text-indigo-500 ml-2 mt-1 sm:mt-0 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      ※ 特性「{myPoke.ability}」でいかく無効
                    </span>
                  )}
                </div>
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
                  
                  let actualAttack = calculateStat(attackBase, 31, attackEv, 50, attackMult, false);
                  
                  // ランク補正の適用
                  let atkRank = isPhysical ? (battleRanks[i]?.attack || 0) : (battleRanks[i]?.spAttack || 0);
                  if (isPhysical && hasIntimidate && !intimidateImmuneAbilities.includes(myPoke.ability)) {
                    atkRank -= 1; // いかく
                  }
                  actualAttack = applyStatRank(actualAttack, atkRank);

                  // 特性や天候によるステータス補正
                  if (isPhysical) {
                    if (myPoke.ability === "ちからもち" || myPoke.ability === "ヨガパワー") {
                      actualAttack = Math.floor(actualAttack * 2);
                    } else if (myPoke.ability === "はりきり") {
                      actualAttack = Math.floor(actualAttack * 1.5);
                    }
                    if (myPoke.item === "こだわりハチマキ") {
                      actualAttack = Math.floor(actualAttack * 1.5);
                    }
                  } else {
                    if (myPoke.ability === "サンパワー" && weather === "sun") {
                      actualAttack = Math.floor(actualAttack * 1.5);
                    }
                    if (myPoke.item === "こだわりメガネ") {
                      actualAttack = Math.floor(actualAttack * 1.5);
                    }
                  }

                  let targetDefBase = isPhysical ? opponent.base.stats.defense : opponent.base.stats.spDefense;
                  let targetDefEv = worstCaseMode ? 252 : 0;
                  let targetDefNature = worstCaseMode ? 1.1 : 1.0;
                  let targetDefRank = isPhysical ? oppRanks.defense : oppRanks.spDefense;
                  
                  let targetDef = applyStatRank(calculateStat(targetDefBase, 31, targetDefEv, 50, targetDefNature, false), targetDefRank);
                  
                  // 天候による耐久アップ効果
                  if (!isPhysical && weather === 'sandstorm' && opponent.base.types.includes('いわ')) {
                    targetDef = Math.floor(targetDef * 1.5);
                  }
                  if (isPhysical && weather === 'snow' && opponent.base.types.includes('こおり')) {
                    targetDef = Math.floor(targetDef * 1.5);
                  }
                  
                  let currentOppItem = oppActiveItem || "なし";
                  
                  // ベースの突撃チョッキ反映 (最悪想定アイテムを使わない場合やOFFの場合用)
                  if (!isPhysical && currentOppItem === "とつげきチョッキ") {
                    targetDef = Math.floor(targetDef * 1.5);
                  }
                  
                  // 最悪想定の道具考慮
                  if (worstCaseMode && worstCaseItem) {
                    currentOppItem = "なし"; // fallback
                    const effectiveness = getEffectiveness(moveData.type, opponent.base.types);
                    if (effectiveness > 1) {
                      const berryForType: Record<string, string> = {
                        "ほのお": "オッカのみ", "みず": "イトケのみ", "でんき": "ソクノのみ", "くさ": "リンドのみ",
                        "こおり": "ヤチェのみ", "かくとう": "ヨプのみ", "どく": "ビアーのみ", "じめん": "シュカのみ",
                        "ひこう": "バコウのみ", "エスパー": "ウタンのみ", "むし": "タンガのみ", "いわ": "ヨロギのみ",
                        "ゴースト": "カシブのみ", "ドラゴン": "ハバンのみ", "あく": "ナモのみ", "はがね": "リリバのみ",
                        "フェアリー": "ロゼルのみ"
                      };
                      currentOppItem = berryForType[moveData.type] || "なし";
                    } else if (moveData.type === "ノーマル") {
                      currentOppItem = "ホズのみ";
                    } else if (!isPhysical) {
                      currentOppItem = "とつげきチョッキ";
                    }
                    
                    if (!isPhysical && currentOppItem === "とつげきチョッキ" && oppActiveItem !== "とつげきチョッキ") {
                      // We must multiply targetDef here since it wasn't Assault Vest originally
                      targetDef = Math.floor(targetDef * 1.5);
                    }
                  }

                  const damage = calculateDamage(
                    50,
                    moveData.power,
                    actualAttack,
                    targetDef,
                    moveData.type,
                    myPoke.base.types,
                    opponent.base.types,
                    oppMaxHp,
                    myPoke.ability,
                    [oppActiveAbility],
                    weather,
                    myPoke.item || "なし",
                    currentOppItem
                  );

                  let resultColor = "text-slate-600";
                  if (damage.minPercent >= 100) resultColor = "text-red-600";
                  else if (damage.maxPercent >= 100) resultColor = "text-orange-500";
                  else if (damage.minPercent >= 50) resultColor = "text-blue-600";

                  return (
                    <div key={j} className="flex flex-col gap-1.5 mt-2 first:mt-0">
                      <div className="flex justify-between items-start text-xs">
                        <div className="font-bold text-slate-700 flex flex-col">
                          <div className="flex items-center flex-wrap gap-1">
                            {moveName} 
                            <span className="text-[10px] text-slate-400 font-normal">({moveData.type} / 威力{moveData.power})</span>
                            {worstCaseMode && currentOppItem !== "なし" && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded shadow-sm border border-rose-200 ml-1">
                                盾想定: {currentOppItem}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {damage.stabBonus > 1 && (
                              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100">
                                {damage.stabBonus === 2.0 ? 'てきおうりょく (2.0倍)' : 'タイプ一致 (1.5倍)'}
                              </span>
                            )}
                            {damage.effectiveness > 1 && (
                              <span className="text-[9px] bg-red-50 text-red-600 px-1 rounded border border-red-100">
                                ばつぐん ({damage.effectiveness}倍)
                              </span>
                            )}
                            {damage.effectiveness < 1 && damage.effectiveness > 0 && (
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                いまひとつ ({damage.effectiveness}倍)
                              </span>
                            )}
                            {damage.weatherBonus > 1 && (
                              <span className="text-[9px] bg-yellow-50 text-yellow-600 px-1 rounded border border-yellow-100">
                                天候ボーナス ({damage.weatherBonus}倍)
                              </span>
                            )}
                            {damage.itemNote && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded border border-amber-200">
                                ※{damage.itemNote}
                              </span>
                            )}
                            {weather === 'sun' && (moveName === 'ソーラービーム' || moveName === 'ソーラーブレード') && (
                              <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1 rounded border border-yellow-200">
                                ため無しで即攻撃可能
                              </span>
                            )}
                            {damage.immunityReason && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded border border-slate-200">
                                {damage.immunityReason === 'type' ? `${moveData.type}タイプのため無効` : `特性『${damage.immunityReason}』のため無効`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`font-black ${resultColor}`}>{damage.hitsToKO}</span>
                          <InfoTooltip text="相手のHPを削り切るのに必要な攻撃回数の目安です。「確定1発」なら一撃で倒せます。" className="w-40" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center group/gauge">
                        <div className="w-full relative flex items-center mr-3">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex relative">
                            <div className="bg-red-500 h-1.5" style={{ width: `${Math.min(100, damage.minPercent)}%` }}></div>
                            <div className="bg-orange-300 h-1.5" style={{ width: `${Math.min(100, damage.maxPercent) - Math.min(100, damage.minPercent)}%` }}></div>
                          </div>
                          <InfoTooltip text="ゲージ全体が相手の最大HP(100%)です。赤い部分は「最低乱数(最も運が悪い時のダメージ)」、オレンジの部分は「最高乱数までのブレ幅」を表しています。" className="w-56" />
                        </div>
                        <div className="flex items-center justify-end min-w-[85px]">
                          <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono text-right">
                            {damage.minDamage} ~ {damage.maxDamage}
                          </span>
                          <InfoTooltip text="実際のダメージ量の数値（最低乱数 〜 最高乱数）です。" className="w-40" />
                        </div>
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
    </div>
  );
};
