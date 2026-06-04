import os

file_path = 'src/components/DamageCalculator.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
content = content.replace(
    "const [worstCaseMode, setWorstCaseMode] = useState(false);",
    "const [worstCaseMode, setWorstCaseMode] = useState(false);\n  const [baseAssumption, setBaseAssumption] = useState<'h0' | 'h252'>('h252');\n  const [worstCaseItem, setWorstCaseItem] = useState(true);"
)

# 2. Update global stat calculation
old_stats = """  // Opponent defensive stats (assume 252 HP / 0 Def / 0 SpD as default for MVP, or just H252)
  // HP: 252 EV, Def/SpD: 0 EV, Nature: 1.0
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, 252, 50, 1.0, true);
  let oppDef = applyStatRank(calculateStat(opponent.base.stats.defense, 31, 0, 50, 1.0, false), oppRanks.defense);
  let oppSpDef = applyStatRank(calculateStat(opponent.base.stats.spDefense, 31, 0, 50, 1.0, false), oppRanks.spDefense);

  if (oppActiveItem === "とつげきチョッキ") {
    oppSpDef = Math.floor(oppSpDef * 1.5);
  }

  // 天候による耐久アップ効果
  if (weather === 'sandstorm' && opponent.base.types.includes('いわ')) {
    oppSpDef = Math.floor(oppSpDef * 1.5);
  }
  if (weather === 'snow' && opponent.base.types.includes('こおり')) {
    oppDef = Math.floor(oppDef * 1.5);
  }"""

new_stats = """  // 相手のHP（最悪想定 または H252指定の場合は252振り、それ以外は0振り）
  const oppHpEv = worstCaseMode || baseAssumption === 'h252' ? 252 : 0;
  const oppMaxHp = calculateStat(opponent.base.stats.hp, 31, oppHpEv, 50, 1.0, true);"""

content = content.replace(old_stats, new_stats)

# 3. Update header UI
old_header = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
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
      <div className="p-3 space-y-4">
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-sm font-bold text-slate-700">与ダメージ計算</h4>
          <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
            相手想定: H252 / B0 / D0
          </span>
        </div>"""

new_header = """      <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-col gap-2">
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
        </div>"""

content = content.replace(old_header, new_header)


# 4. Target Def Calculation
old_def_calc = """                  let targetDef = isPhysical ? oppDef : oppSpDef;
                  
                  let currentOppItem = oppActiveItem || "なし";
                  if (worstCaseMode) {
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
                      // oppSpDef already multiplied if oppActiveItem is Assault Vest, otherwise we must apply it here
                      targetDef = Math.floor(targetDef * 1.5);
                    }
                  }"""

new_def_calc = """                  let targetDefBase = isPhysical ? opponent.base.stats.defense : opponent.base.stats.spDefense;
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
                  }"""

content = content.replace(old_def_calc, new_def_calc)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
