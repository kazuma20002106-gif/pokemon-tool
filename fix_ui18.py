import os

dc_file = 'src/components/DamageCalculator.tsx'
pd_file = 'src/components/PokemonDetailModal.tsx'
app_file = 'src/App.tsx'

with open(dc_file, 'r', encoding='utf-8') as f:
    dc_content = f.read()

with open(pd_file, 'r', encoding='utf-8') as f:
    pd_content = f.read()

# 1. Update EV hint in PokemonDetailModal.tsx
old_ev_header = """            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-bold text-slate-500">努力値 (EVs)</label>
              <div className="flex items-center gap-3">"""
new_ev_header = """            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-bold text-slate-500">努力値 (EVs)</label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 hidden sm:inline-block">
                  💡名前タップで全振り
                </span>"""
pd_content = pd_content.replace(old_ev_header, new_ev_header)

# 2. Add TooltipHelp and item helper to DamageCalculator.tsx
if "const TooltipHelp =" not in dc_content:
    import_index = dc_content.find("import {")
    tooltip_component = """
import { Info } from 'lucide-react';
const TooltipHelp = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-1">
    <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
    <div className="hidden group-hover:block absolute z-50 w-56 p-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
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
"""
    # Replace Info if already imported, otherwise add it
    if "Info" not in dc_content[:300]:
        dc_content = dc_content.replace("import { Swords, ShieldAlert, Zap, Activity } from 'lucide-react';", "import { Swords, ShieldAlert, Zap, Activity, Info } from 'lucide-react';")
    
    # insert before export const DamageCalculator
    dc_content = dc_content.replace("export const DamageCalculator = ", tooltip_component + "\nexport const DamageCalculator = ")

# 3. Add tooltip to worstcase
old_worstcase_ui = """          <div className="flex items-center text-slate-700">
            <Swords className="w-5 h-5 mr-2" />
            <h2 className="font-bold">ダメージ計算</h2>
          </div>
          <button
            onClick={() => setWorstCaseMode(!worstCaseMode)}"""
new_worstcase_ui = """          <div className="flex items-center text-slate-700">
            <Swords className="w-5 h-5 mr-2" />
            <h2 className="font-bold">ダメージ計算</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWorstCaseMode(!worstCaseMode)}"""
dc_content = dc_content.replace(old_worstcase_ui, new_worstcase_ui)

old_worstcase_btn = """            {worstCaseMode ? '最悪想定: ON' : '最悪想定: OFF'}
          </button>
        </div>"""
new_worstcase_btn = """            {worstCaseMode ? '最悪想定: ON' : '最悪想定: OFF'}
            </button>
            <TooltipHelp text="相手の攻撃に対して、考えられる最も硬いステータス（HP・防御/特防特化、および突撃チョッキなどの補正）を想定して計算します。下のボタンで相手の道具補正をオンオフできます。" />
          </div>
        </div>"""
dc_content = dc_content.replace(old_worstcase_btn, new_worstcase_btn)

# 4. Handle empty moves display
old_empty_moves = """      <div className="space-y-3">
        {teamWithMoves.map((myPoke, i) => {
          const validMoves = myPoke.moves.filter(m => m !== null) as string[];
          if (validMoves.length === 0) return null;

          return ("""
new_empty_moves = """      <div className="space-y-3">
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

          return ("""
dc_content = dc_content.replace(old_empty_moves, new_empty_moves)

# 5. Add item note to damage display
old_damage_tags = """                            {damage.effectiveness < 1 && damage.effectiveness > 0 && (
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                いまひとつ ({damage.effectiveness}倍)
                              </span>
                            )}"""
new_damage_tags = """                            {damage.effectiveness < 1 && damage.effectiveness > 0 && (
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">
                                いまひとつ ({damage.effectiveness}倍)
                              </span>
                            )}
                            {getAttackerItemNote(myPoke, moveData, damage.effectiveness) && (
                              <span className="text-[9px] bg-purple-50 text-purple-700 px-1 rounded border border-purple-100">
                                {getAttackerItemNote(myPoke, moveData, damage.effectiveness)}
                              </span>
                            )}"""
dc_content = dc_content.replace(old_damage_tags, new_damage_tags)

with open(dc_file, 'w', encoding='utf-8') as f:
    f.write(dc_content)

with open(pd_file, 'w', encoding='utf-8') as f:
    f.write(pd_content)

# Bump App.tsx version
with open(app_file, 'r', encoding='utf-8') as f:
    app_content = f.read()
app_content = app_content.replace('>v1.1.11</span>', '>v1.1.12</span>')
with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_content)
