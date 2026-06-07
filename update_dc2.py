import os

dc_file = 'src/components/DamageCalculator.tsx'
with open(dc_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
old_import1 = "import { calculateStat, getNatureMultiplier, applyStatRank } from '../utils/statsCalc';"
new_import1 = "import { calculateStat, getNatureMultiplier, applyStatRank, calculateActualSpeed } from '../utils/statsCalc';"
content = content.replace(old_import1, new_import1)

old_import2 = "import { Info, ShieldAlert, Swords } from 'lucide-react';"
new_import2 = "import { Info, ShieldAlert, Swords, Zap } from 'lucide-react';"
content = content.replace(old_import2, new_import2)

# 2. Add state
old_state = "const [worstCaseItem, setWorstCaseItem] = useState(true);"
new_state = """const [worstCaseItem, setWorstCaseItem] = useState(true);
  const [viewMode, setViewMode] = useState<'speed' | 'damage'>('speed');
  const [oppScarfAssumption, setOppScarfAssumption] = useState(false);"""
content = content.replace(old_state, new_state)

# 3. Add Speed list calculation
old_render_start = """  const intimidateImmuneAbilities = ["クリアボディ", "しろいけむり", "かいりきバサミ", "ミラーアーマー", "せいしんりょく", "どんかん", "きもったま", "マイペース"];
  const hasIntimidate = oppActiveAbility === "いかく";
  const specialAbilities = ["ばけのかわ", "マルチスケイル", "ファントムガード", "アイスフェイス"];
  const oppSpecialAbility = specialAbilities.includes(oppActiveAbility) ? oppActiveAbility : null;"""

new_render_start = """  const intimidateImmuneAbilities = ["クリアボディ", "しろいけむり", "かいりきバサミ", "ミラーアーマー", "せいしんりょく", "どんかん", "きもったま", "マイペース"];
  const hasIntimidate = oppActiveAbility === "いかく";
  const specialAbilities = ["ばけのかわ", "マルチスケイル", "ファントムガード", "アイスフェイス"];
  const oppSpecialAbility = specialAbilities.includes(oppActiveAbility) ? oppActiveAbility : null;

  // 素早さ比較リストの生成
  const speedList: any[] = [];
  
  if (viewMode === 'speed') {
    teamWithMoves.forEach((myPoke, i) => {
      const myRank = myBattleRanks[activePokemonIndices[i]]?.speed || 0;
      const speed = calculateActualSpeed(
        myPoke.base.stats.speed,
        myPoke.ivs.speed,
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
content = content.replace(old_render_start, new_render_start)

# 4. Update Header
old_header = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-slate-700">
            <Swords className="w-5 h-5 mr-2" />
            <h2 className="font-bold">ダメージ計算</h2>
          </div>
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
        </div>"""

new_header = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2 rounded-t-2xl">
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
          </div>
        )}"""
content = content.replace(old_header, new_header)

# 5. Hide mode options
old_mode_options = """        {/* モード固有のオプション設定 */}
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
            <div className="flex gap-2">
              <button
                onClick={() => setBaseAssumption('h0')}
                className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm transition-colors ${
                  baseAssumption === 'h0' ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ベース: HP無振り
              </button>
              <button
                onClick={() => setBaseAssumption('h252')}
                className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm transition-colors ${
                  baseAssumption === 'h252' ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ベース: HP特化
              </button>
            </div>
          )}
        </div>"""

new_mode_options = """        {/* モード固有のオプション設定 */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => setBaseAssumption('h0')}
                  className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm transition-colors ${
                    baseAssumption === 'h0' ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ベース: HP無振り
                </button>
                <button
                  onClick={() => setBaseAssumption('h252')}
                  className={`text-[9px] font-bold px-2 py-1 rounded border shadow-sm transition-colors ${
                    baseAssumption === 'h252' ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ベース: HP特化
                </button>
              </div>
            )}
          </div>
        )}"""
content = content.replace(old_mode_options, new_mode_options)

# 6. Render Speed View vs Damage View
old_content_render = """      <div className="p-3">
        {/* === 与ダメージ計算 === */}"""

new_content_render = """      <div className="p-3">
        {viewMode === 'speed' ? (
          <div className="space-y-1">
            <div className="flex px-3 py-2 text-xs font-bold text-slate-500 border-b border-slate-200">
              <div className="flex-1">ポケモン</div>
              <div className="w-16 text-right">実数値</div>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 pb-10">
              {speedList.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center px-3 py-2.5 rounded-lg border ${
                    item.isOpponent ? 'bg-rose-50/50 border-rose-200 shadow-sm' : 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.pokemon.base.id}.png`}
                      className="w-10 h-10 object-contain drop-shadow-sm"
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className={`font-bold text-[13px] ${item.isOpponent ? 'text-rose-700' : 'text-indigo-700'}`}>
                        {item.name}
                      </span>
                      <span className={`text-[10px] font-bold ${item.isOpponent ? 'text-rose-500' : 'text-indigo-500'}`}>
                        {item.details}
                      </span>
                    </div>
                  </div>
                  <div className={`w-20 text-right font-black text-xl tracking-tight ${item.isOpponent ? 'text-rose-600' : 'text-indigo-600'}`}>
                    {item.speed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
        {/* === 与ダメージ計算 === */}"""
content = content.replace(old_content_render, new_content_render)

# Close the Fragment at the end
old_end = """        </div>
      </div>
    </div>
  );
};"""

new_end = """        </div>
          </>
        )}
      </div>
    </div>
  );
};"""
content = content.replace(old_end, new_end)


with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(content)
