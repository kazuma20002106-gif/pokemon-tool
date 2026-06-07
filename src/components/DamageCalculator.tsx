import React, { useState } from 'react';
import { MyPokemon } from './PokemonDetailModal';
import { calculateDamage, getEffectiveness } from '../utils/damageCalc';
import { calculateStat, getNatureMultiplier, applyStatRank, calculateActualSpeed } from '../utils/statsCalc';
import movesData from '../data/moves.json';
import { Info, ShieldAlert, Swords, Zap } from 'lucide-react';
import { BattleStatRanks } from '../App';

interface Props {
  myTeam: (MyPokemon | null)[];
  activeMyIndices: number[];
  setCalcMyPokemonIndices: React.Dispatch<React.SetStateAction<number[]>>;
  myBattleRanks: Record<number, BattleStatRanks>;
  activeMyFaceoffIndex: number;

  oppTeam: (MyPokemon | null)[];
  activeOppIndices: number[];
  setCalcOpponentIndices: React.Dispatch<React.SetStateAction<number[]>>;
  oppBattleRanks: Record<number, BattleStatRanks>;
  activeOppFaceoffIndex: number;

  weather: string;
}


const InfoTooltip = ({ text, className = "w-48", align = 'center' }: { text: string, className?: string, align?: 'center' | 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: align === 'right' ? rect.right : rect.left + rect.width / 2
      });
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen, align]);

  return (
    <div className="relative inline-flex items-center ml-1 align-middle">
      <button 
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {isOpen && (
        <div 
          className={`fixed z-[100] p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl text-left font-normal leading-relaxed pointer-events-none ${className}`}
          style={{ 
            top: pos.top - 6,
            left: pos.left,
            transform: align === 'right' ? 'translate(-100%, -100%)' : 'translate(-50%, -100%)'
          }}
        >
          {text}
          <div 
            className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
              align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

const TooltipHelp = ({ text, align = 'center' }: { text: string, align?: 'center' | 'right' }) => (
  <div className="group relative inline-flex items-center ml-1">
    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
    <div className={`hidden group-hover:block absolute z-[60] w-56 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg bottom-full mb-2 pointer-events-none ${
      align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'
    }`}>
      {text}
      <div className={`absolute top-full border-4 border-transparent border-t-slate-800 ${
        align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2'
      }`}></div>
    </div>
  </div>
);

const getAttackerItemNote = (pokemon: any, move: any, effectiveness: number) => {
  if (!pokemon.item || pokemon.item === "なし") return null;
  if (pokemon.item === "こだわりハチマキ" && move.category === "物理") return "ハチマキ (1.5倍)";
  if (pokemon.item === "こだわりメガネ" && move.category === "特殊") return "メガネ (1.5倍)";
  if (pokemon.item === "いのちのたま") return "珠 (1.3倍)";
  if (pokemon.item === "たつじんのおび" && effectiveness > 1) return "帯 (1.2倍)";
  
  const typeBoostingItems: Record<string, string> = {
    "もくたん": "ほのお", "しんぴのしずく": "みず", "じしゃく": "でんき", "きせきのタネ": "くさ",
    "とけないこおり": "こおり", "くろおび": "かくとう", "どくバリ": "どく", "やわらかいすな": "じめん",
    "するどいくちばし": "ひこう", "まがったスプーン": "エスパー", "ぎんのこな": "むし",
    "かたいいし": "いわ", "のろいのおふだ": "ゴースト", "りゅうのキバ": "ドラゴン",
    "くろいメガネ": "あく", "メタルコート": "はがね", "ようせいのはね": "フェアリー",
    "シルクのスカーフ": "ノーマル", "ノーマルジュエル": "ノーマル"
  };
  if (typeBoostingItems[pokemon.item] === move.type) {
    if (pokemon.item === "ノーマルジュエル") return "ジュエル (1.3倍)";
    return "タイプ強化 (1.2倍)";
  }
  return null;
};


const getTypeTextColor = (type: string) => {
  const colors: Record<string, string> = {
    'ノーマル': 'text-stone-500', 'ほのお': 'text-red-500', 'みず': 'text-blue-500', 'くさ': 'text-green-600',
    'でんき': 'text-yellow-500', 'こおり': 'text-cyan-500', 'かくとう': 'text-orange-600', 'どく': 'text-purple-600',
    'じめん': 'text-amber-600', 'ひこう': 'text-sky-500', 'エスパー': 'text-pink-500', 'むし': 'text-lime-600',
    'いわ': 'text-yellow-700', 'ゴースト': 'text-violet-600', 'ドラゴン': 'text-indigo-600', 'あく': 'text-zinc-700',
    'はがね': 'text-slate-500', 'フェアリー': 'text-pink-400'
  };
  return colors[type] || 'text-slate-700';
};

export const DamageCalculator: React.FC<Props> = ({ 
  myTeam, activeMyIndices, setCalcMyPokemonIndices, myBattleRanks, activeMyFaceoffIndex,
  oppTeam, activeOppIndices, setCalcOpponentIndices, oppBattleRanks, activeOppFaceoffIndex,
  weather 
}) => {
  const activeOpponent = oppTeam[activeOppFaceoffIndex]!;
  const oppActiveAbility = activeOpponent.ability;
  const oppActiveItem = activeOpponent.item || "なし";
  const oppRanks = oppBattleRanks[activeOppFaceoffIndex] || { attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
  const battleRanks = myBattleRanks;
  
  const [worstCaseMode, setWorstCaseMode] = useState(false);
  const [baseAssumption, setBaseAssumption] = useState<'h0' | 'h252'>('h252');
  const [worstCaseItem, setWorstCaseItem] = useState(true);
  const [viewMode, setViewMode] = useState<'speed' | 'damage'>('speed');
  const [oppScarfAssumption, setOppScarfAssumption] = useState(false);
  const [oppSpeedLines, setOppSpeedLines] = useState<string[]>(['max-plus']);

  // 相手のHP（最悪想定 または H252指定の場合は252振り、それ以外は0振り）
  const oppHpEv = worstCaseMode || baseAssumption === 'h252' ? 252 : 0;
  const oppMaxHp = calculateStat(activeOpponent.base.stats.hp, 31, oppHpEv, 50, 1.0, true);

  const teamWithMoves = myTeam.filter((p, i) => p !== null && activeMyIndices.includes(i)) as MyPokemon[];

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

  // 素早さ比較リストの生成
  const speedList: any[] = [];
  
  if (viewMode === 'speed') {
    myTeam.forEach((myPoke, i) => {
      if (!myPoke || !activeMyIndices.includes(i)) return;
      const myRank = myBattleRanks[i]?.speed || 0;
      const speed = calculateActualSpeed(
        myPoke.base.stats.speed,
        31,
        myPoke.evs.speed,
        getNatureMultiplier(myPoke.nature, 'speed'),
        myRank,
        myPoke.item || 'なし',
        myPoke.ability || 'なし',
        weather
      );
      
      let itemNote = '';
      if (myPoke.item === 'こだわりスカーフ') itemNote = ' / スカーフ';
      else if (myPoke.item && (myPoke.item === 'くろいてっきゅう' || myPoke.item.includes('パワー') || myPoke.item === 'きょうせいギプス')) itemNote = ' / 鉄球系';

      speedList.push({
        id: `my-${i}`,
        name: myPoke.base.name,
        speed,
        isOpponent: false,
        pokemon: myPoke,
        details: `(努力値${myPoke.evs.speed}${itemNote})`,
        isFaceoff: i === activeMyFaceoffIndex
      });
    });

    oppTeam.forEach((oppPoke, i) => {
      if (!oppPoke || !activeOppIndices.includes(i)) return;
      const oppBaseSpeed = oppPoke.base.stats.speed;
      const oppRank = oppBattleRanks[i]?.speed || 0;
      const oppItem = oppScarfAssumption ? 'こだわりスカーフ' : (oppPoke.item || 'なし');
      const oppAbility = oppPoke.ability || 'なし';
      
      const isFaceoff = i === activeOppFaceoffIndex;

      if (oppSpeedLines.includes('max-plus')) {
        speedList.push({
          id: `opp-${i}-max-plus`,
          name: oppPoke.base.name,
          speed: calculateActualSpeed(oppBaseSpeed, 31, 252, 1.1, oppRank, oppItem, oppAbility, weather),
          isOpponent: true,
          pokemon: oppPoke,
          details: '(最速)',
          isFaceoff
        });
      }
      if (oppSpeedLines.includes('max')) {
        speedList.push({
          id: `opp-${i}-max`,
          name: oppPoke.base.name,
          speed: calculateActualSpeed(oppBaseSpeed, 31, 252, 1.0, oppRank, oppItem, oppAbility, weather),
          isOpponent: true,
          pokemon: oppPoke,
          details: '(準速)',
          isFaceoff
        });
      }
      if (oppSpeedLines.includes('min')) {
        speedList.push({
          id: `opp-${i}-min`,
          name: oppPoke.base.name,
          speed: calculateActualSpeed(oppBaseSpeed, 31, 0, 1.0, oppRank, oppItem, oppAbility, weather),
          isOpponent: true,
          pokemon: oppPoke,
          details: '(無振り)',
          isFaceoff
        });
      }
    });

    speedList.sort((a, b) => b.speed - a.speed);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-4">
      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-3 rounded-t-2xl">
        
        {/* === 参加メンバー選択 UI === */}
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="text-[10px] font-bold text-slate-500 mb-1.5">参加させる自陣メンバー</div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {myTeam.map((p, i) => {
                if (!p) return null;
                const isActive = activeMyIndices.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCalcMyPokemonIndices(prev => isActive ? prev.filter(idx => idx !== i) : [...prev, i])}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-bold transition-all ${
                      isActive ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.base.id}.png`} alt="" className="w-4 h-4 object-contain" />
                    <span className="truncate max-w-[50px]">{p.base.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 mb-1.5">参加させる敵陣メンバー</div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {oppTeam.map((p, i) => {
                if (!p) return null;
                const isActive = activeOppIndices.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => setCalcOpponentIndices(prev => isActive ? prev.filter(idx => idx !== i) : [...prev, i])}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-bold transition-all ${
                      isActive ? 'bg-rose-600 text-white border-rose-700 shadow-sm' : 'bg-white text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.base.id}.png`} alt="" className="w-4 h-4 object-contain" />
                    <span className="truncate max-w-[50px]">{p.base.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <div className="flex bg-slate-200 rounded-lg p-1 shadow-inner w-full max-w-sm">
            <button
              onClick={() => setViewMode('speed')}
              className={`flex-1 flex justify-center items-center px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'speed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 mr-1.5" />
              素早さ比較
            </button>
            <button
              onClick={() => setViewMode('damage')}
              className={`flex-1 flex justify-center items-center px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'damage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Swords className="w-4 h-4 mr-1.5" />
              ダメージ計算
            </button>
          </div>
        </div>
        
        {viewMode === 'damage' ? (
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center"><Swords className="w-5 h-5 mr-2" />ダメージ計算</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWorstCaseMode(!worstCaseMode)}
              className={`flex items-center px-2 py-1.5 rounded text-[10px] font-bold transition-all shadow-sm ${
                 worstCaseMode ? 'bg-red-500 text-white shadow-md border border-red-600' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <ShieldAlert className={`w-3 h-3 mr-1 ${worstCaseMode ? 'text-white' : 'text-slate-400'}`} />
              {worstCaseMode ? '最悪想定: ON' : '最悪想定: OFF'}
              </button>
              <TooltipHelp align="right" text="相手の攻撃に対して、考えられる最も硬いステータス（HP・防御/特防特化、および突撃チョッキなどの補正）を想定して計算します。下のボタンで相手の道具補正をオンオフできます。" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center"><Zap className="w-5 h-5 mr-2" />素早さ比較</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-md p-0.5">
                {[
                  { id: 'max-plus', label: '最速' },
                  { id: 'max', label: '準速' },
                  { id: 'min', label: '無振' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (oppSpeedLines.includes(opt.id)) {
                        setOppSpeedLines(prev => prev.filter(x => x !== opt.id));
                      } else {
                        setOppSpeedLines(prev => [...prev, opt.id]);
                      }
                    }}
                    className={`text-[9px] font-bold px-1.5 py-1 rounded transition-colors ${
                      oppSpeedLines.includes(opt.id) ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOppScarfAssumption(!oppScarfAssumption)}
                className={`flex items-center px-2 py-1.5 rounded text-[10px] font-bold transition-all shadow-sm ${
                  oppScarfAssumption ? 'bg-sky-500 text-white shadow-md border border-sky-600' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                相手スカーフ想定: {oppScarfAssumption ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
        
        {/* モード固有のオプション設定 */}
        {viewMode === 'damage' && (
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
                ベース: HP無振り
              </button>
              <button
                onClick={() => setBaseAssumption('h252')}
                className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${
                  baseAssumption === 'h252' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                ベース: HP特化
              </button>
            </div>
          )}
        </div>
        )}
      </div>
      <div className="p-3 space-y-4">
        {viewMode === 'speed' ? (
          <div className="space-y-1">
            <div className="flex px-3 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <div className="flex-1">ポケモン</div>
              <div className="w-16 text-right">実数値</div>
            </div>
            {speedList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">自陣と相手のポケモンを登録すると、素早さの比較が表示されます。</div>
            ) : (
            <div className="space-y-1.5 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2 pb-10">
              {speedList.map((entry: any) => (
                <div 
                  key={entry.id}
                  className={`flex items-center px-3 py-2.5 rounded-lg border transition-all relative overflow-hidden ${
                    entry.isOpponent 
                      ? entry.isFaceoff ? 'bg-rose-100 border-rose-400 shadow-md ring-1 ring-rose-400' : 'bg-rose-50/50 border-rose-200' 
                      : entry.isFaceoff ? 'bg-indigo-100 border-indigo-400 shadow-md ring-1 ring-indigo-400' : 'bg-indigo-50/50 border-indigo-200'
                  }`}
                >
                  {entry.isFaceoff && (
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${entry.isOpponent ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                  )}
                  <div className="flex-1 flex items-center gap-2">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.pokemon.base.id}.png`}
                      className="w-10 h-10 object-contain drop-shadow-sm"
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[13px] ${
                        entry.isOpponent ? 'text-rose-700' : 'text-indigo-700'
                      }`}>
                        {entry.name}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        entry.isOpponent ? 'text-rose-400' : 'text-indigo-400'
                      }`}>
                        {entry.isOpponent ? `相手 ${entry.details}` : `自陣 ${entry.details}`}
                      </span>
                    </div>
                  </div>
                  <div className={`w-20 text-right font-black text-xl tracking-tight ${
                    entry.isOpponent ? 'text-rose-600' : 'text-indigo-600'
                  }`}>
                    {entry.speed}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        ) : (
        <>
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-sm font-bold text-slate-700">与ダメージ計算</h4>
          <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            相手想定: {worstCaseMode ? '防御/特防 特化 (技による)' : (baseAssumption === 'h252' ? 'HP 252 / 防御 0 / 特防 0' : 'HP 0 / 防御 0 / 特防 0')}
          </span>
        </div>
      
      {oppSpecialAbility && (
        <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg">
          ※ 相手の特性『{oppSpecialAbility}』によるダメージ軽減・無効化は考慮していません。
        </div>
      )}
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pb-32 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">
        {teamWithMoves.map((myPoke, i) => {
          const validMoves = myPoke.moves.filter(m => m !== null) as string[];
          if (validMoves.length === 0) {
            return (
              <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center border-b border-slate-100 pb-2">
                  <span className="truncate">{myPoke.base.name}</span>
                </div>
                <div className="text-center text-[10px] text-slate-400 py-3">
                  技が未設定です。<br/>右上の設定（歯車アイコン）から追加してください。
                </div>
              </div>
            );
          }

          return (
            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-800 mb-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex flex-wrap items-center gap-1">
                  <div className="flex items-baseline bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    <span className="font-black text-[15px] tracking-wide text-slate-800 truncate">{myPoke.base.name}</span>
                    <span className="text-[10px] ml-1 font-bold text-slate-400">からの攻撃</span>
                  </div>
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

                  let targetDefBase = isPhysical ? activeOpponent.base.stats.defense : activeOpponent.base.stats.spDefense;
                  let targetDefEv = worstCaseMode ? 252 : 0;
                  let targetDefNature = worstCaseMode ? 1.1 : 1.0;
                  let targetDefRank = isPhysical ? oppRanks.defense : oppRanks.spDefense;
                  
                  let targetDef = applyStatRank(calculateStat(targetDefBase, 31, targetDefEv, 50, targetDefNature, false), targetDefRank);
                  
                  // 天候による耐久アップ効果
                  if (!isPhysical && weather === 'sandstorm' && activeOpponent.base.types.includes('いわ')) {
                    targetDef = Math.floor(targetDef * 1.5);
                  }
                  if (isPhysical && weather === 'snow' && activeOpponent.base.types.includes('こおり')) {
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
                    const effectiveness = getEffectiveness(moveData.type, activeOpponent.base.types);
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
                    activeOpponent.base.types,
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
                    <div key={j} className="flex flex-col gap-1.5 pt-3 mt-3 border-t border-dotted border-slate-300 first:border-0 first:pt-0 first:mt-0">
                      <div className="flex justify-between items-start text-xs">
                        <div className="font-bold text-slate-700 flex flex-col">
                          <div className="flex items-center flex-wrap gap-1">
                            <span className={`text-[13px] font-black tracking-wide ${getTypeTextColor(moveData.type)}`}>{moveName}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1">({moveData.type} / 威力{moveData.power})</span>
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
                            {getAttackerItemNote(myPoke, moveData, damage.effectiveness) && (
                              <span className="text-[9px] bg-purple-50 text-purple-700 px-1 rounded border border-purple-100">
                                {getAttackerItemNote(myPoke, moveData, damage.effectiveness)}
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
                          <InfoTooltip align="right" text="相手のHPを削り切るのに必要な攻撃回数の目安です。「確定1発」なら一撃で倒せます。" className="w-40" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center group/gauge">
                        <div className="w-full relative flex items-center mr-3">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex relative">
                            <div className="bg-red-500 h-1.5" style={{ width: `${Math.min(100, damage.minPercent)}%` }}></div>
                            <div className="bg-orange-300 h-1.5" style={{ width: `${Math.min(100, damage.maxPercent) - Math.min(100, damage.minPercent)}%` }}></div>
                          </div>
                          <InfoTooltip align="right" text="ゲージ全体が相手の最大HP(100%)です。赤い部分は「最低乱数(最も運が悪い時のダメージ)」、オレンジの部分は「最高乱数までのブレ幅」を表しています。" className="w-56" />
                        </div>
                        <div className="flex items-center justify-end min-w-[85px]">
                          <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono text-right">
                            {damage.minDamage} ~ {damage.maxDamage}
                          </span>
                          <InfoTooltip align="right" text="実際のダメージ量の数値（最低乱数 〜 最高乱数）です。" className="w-40" />
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
        </>
        )}
      </div>
    </div>
  );
};
