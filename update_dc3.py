import os

dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Props Interface
old_props = """interface Props {
  myTeam: (MyPokemon | null)[];
  activePokemonIndices: number[];
  myBattleRanks: Record<number, BattleStatRanks>;
  opponent: MyPokemon;
  oppRanks: BattleStatRanks;
  weather: string;
}"""

new_props = """interface Props {
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
}"""
content = content.replace(old_props, new_props)

# 2. Update Component Definition
old_comp = """export const DamageCalculator: React.FC<Props> = ({ myTeam, activePokemonIndices, myBattleRanks, opponent, oppRanks, weather }) => {
  const oppActiveAbility = opponent.ability;
  const oppActiveItem = opponent.item || "なし";
  const battleRanks = myBattleRanks;
  
  const [worstCaseMode, setWorstCaseMode] = useState(false);
  const [baseAssumption, setBaseAssumption] = useState<'h0' | 'h252'>('h252');
  const [worstCaseItem, setWorstCaseItem] = useState(true);
  const [viewMode, setViewMode] = useState<'speed' | 'damage'>('speed');
  const [oppScarfAssumption, setOppScarfAssumption] = useState(false);

  // 相手のHP（最悪想定 または H252指定の場合は252振り、それ以外は0振り）
  const oppHpEv = worstCaseMode || baseAssumption === 'h252' ? 252 : 0;
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, oppHpEv, 50, 1.0, true);

  const teamWithMoves = myTeam.filter((p, i) => p !== null && activePokemonIndices.includes(i)) as MyPokemon[];"""

new_comp = """export const DamageCalculator: React.FC<Props> = ({ 
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

  const teamWithMoves = myTeam.filter((p, i) => p !== null && activeMyIndices.includes(i)) as MyPokemon[];"""
content = content.replace(old_comp, new_comp)

# 3. Update Speed List Logic
old_speed_logic = """  if (viewMode === 'speed') {
    teamWithMoves.forEach((myPoke, i) => {
      const myRank = myBattleRanks[activePokemonIndices[i]]?.speed || 0;
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
      speedList.push({
        id: `my-${i}`,
        name: myPoke.base.name,
        speed,
        isOpponent: false,
        pokemon: myPoke,
        details: `(努力値${myPoke.evs.speed})`
      });
    });

    const oppBaseSpeed = opponent.base.stats.speed;
    const oppRank = oppRanks.speed || 0;
    const oppItem = oppScarfAssumption ? 'こだわりスカーフ' : (opponent.item || 'なし');
    const oppAbility = opponent.ability || 'なし';

    const oppMaxPlus = calculateActualSpeed(oppBaseSpeed, 31, 252, 1.1, oppRank, oppItem, oppAbility, weather);
    const oppMax = calculateActualSpeed(oppBaseSpeed, 31, 252, 1.0, oppRank, oppItem, oppAbility, weather);
    const oppMin = calculateActualSpeed(oppBaseSpeed, 31, 0, 1.0, oppRank, oppItem, oppAbility, weather);

    speedList.push({
      id: 'opp-max-plus',
      name: `${opponent.base.name}`,
      speed: oppMaxPlus,
      isOpponent: true,
      pokemon: opponent,
      details: '(最速)'
    });
    speedList.push({
      id: 'opp-max',
      name: `${opponent.base.name}`,
      speed: oppMax,
      isOpponent: true,
      pokemon: opponent,
      details: '(準速)'
    });
    speedList.push({
      id: 'opp-min',
      name: `${opponent.base.name}`,
      speed: oppMin,
      isOpponent: true,
      pokemon: opponent,
      details: '(無振り)'
    });

    speedList.sort((a, b) => b.speed - a.speed);
  }"""

new_speed_logic = """  if (viewMode === 'speed') {
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
      speedList.push({
        id: `my-${i}`,
        name: myPoke.base.name,
        speed,
        isOpponent: false,
        pokemon: myPoke,
        details: `(努力値${myPoke.evs.speed})`,
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
  }"""
content = content.replace(old_speed_logic, new_speed_logic)

# 4. Insert Team Selection UI in the top area of DamageCalculator
old_header_start = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2 rounded-t-2xl">
        <div className="flex items-center justify-between mb-1">"""

team_selection_ui = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-3 rounded-t-2xl">
        
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

        <div className="flex items-center justify-between mb-1">"""

content = content.replace(old_header_start, team_selection_ui)

# 5. Fix speed options (Adding line toggles)
old_speed_options = """          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700 flex items-center"><Zap className="w-5 h-5 mr-2" />素早さ比較</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOppScarfAssumption(!oppScarfAssumption)}
                className={`flex items-center px-2 py-1.5 rounded text-[10px] font-bold transition-all shadow-sm ${
                  oppScarfAssumption ? 'bg-sky-500 text-white shadow-md border border-sky-600' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                相手スカーフ想定: {oppScarfAssumption ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>"""

new_speed_options = """          <div className="flex items-center justify-between">
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
          </div>"""
content = content.replace(old_speed_options, new_speed_options)

# 6. Apply Faceoff highlighting
old_list_item = """                <div 
                  key={entry.id}
                  className={`flex items-center px-3 py-2.5 rounded-lg border transition-all ${
                    entry.isOpponent 
                      ? 'bg-rose-50 border-rose-200' 
                      : 'bg-indigo-50 border-indigo-200'
                  }`}
                >"""

new_list_item = """                <div 
                  key={entry.id}
                  className={`flex items-center px-3 py-2.5 rounded-lg border transition-all relative overflow-hidden ${
                    entry.isOpponent 
                      ? entry.isFaceoff ? 'bg-rose-100 border-rose-400 shadow-md ring-1 ring-rose-400' : 'bg-rose-50/50 border-rose-200' 
                      : entry.isFaceoff ? 'bg-indigo-100 border-indigo-400 shadow-md ring-1 ring-indigo-400' : 'bg-indigo-50/50 border-indigo-200'
                  }`}
                >
                  {entry.isFaceoff && (
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${entry.isOpponent ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                  )}"""

content = content.replace(old_list_item, new_list_item)


# 7. Update damage rendering to use activeOpponent correctly
# The old script didn't change the damage calculation part, but it used `opponent` variable.
# We changed `opponent` to `activeOpponent`. Let's replace `opponent.base.name` with `activeOpponent.base.name`, etc.
content = content.replace("opponent={opponent}", "opponent={activeOpponent}")
content = content.replace("opponent.types", "activeOpponent.base.types")
content = content.replace("opponent.base.name", "activeOpponent.base.name")
content = content.replace("opponent.item", "activeOpponent.item")
# Note: we need to be careful with string replacements, let's just replace `opponent.` with `activeOpponent.` except in props destructuring.
content = content.replace("opponent.base.types", "activeOpponent.base.types")


with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(content)
